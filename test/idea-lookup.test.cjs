const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,run}=require('./helpers.cjs');
const portal={id:'7712000000000000001',name:'Customer portal',access:'private',enabled:false,external_url:'https://customers.example.test',html_url:'https://example.test/settings/portal',url:'https://example.test/api/v3/idea_portals/7712000000000000001',projects:{records:[{id:'555',name:'Platform'}],has_more:true}};
const user={id:'7712000000000000002',name:'Alex Customer',email:'alex@example.test',first_name:'Alex',last_name:'Customer',title:'Engineer',phone:'123',custom_fields:{notes:'<p>Original HTML</p>'},portal_users:{records:[{id:'7712000000000000003',name:'Alex Customer'}],has_more:true}};
const membership={id:'7712000000000000003',name:user.name,email:user.email,enabled:false,verified:true,unsubscribed:false,permission:'employee',idea_portal:{id:portal.id,name:portal.name},idea_user:{id:user.id,name:user.name,email:user.email}};
const resources={'idea-portal':['idea_portals',portal],'idea-user':['idea_users',user],'portal-user':['portal_users',membership]};

test('portal lookup lists use supported searches, association filters and all cursor pages',async t=>{
 for(const [topic,[path,record]] of Object.entries(resources)){
  let page=0;const {dir,requests}=await setup(t,()=>({records:[record],pagination:{has_more:++page===1,next_cursor:page===1?'next+/=':null}}));
  const filters=topic==='portal-user'?{'eq[idea_portal.id]':portal.id,'eq[idea_user.id]':user.id,'eq[permission]':'employee'}:{'eq[id]':record.id};
  const args=[topic,'list','--per-page','1','--fields','default,created_at','--filters',JSON.stringify(filters),'--sort','id','--descending','--json'];if(topic!=='portal-user')args.push('--search','Alex & Co');
  const result=await run(dir,args);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),[record,record]);assert.equal(requests.length,2);
  const query=new URL(requests[1].url,'https://example.test').searchParams;assert.ok(requests.every(r=>r.method==='GET'&&r.url.startsWith('/api/v3/'+path+'?')));assert.equal(query.get('after'),'next+/=');assert.equal(query.get('fields'),'default,created_at');assert.equal(query.get('sort.desc'),'id');for(const [key,value] of Object.entries(filters))assert.equal(query.get('filter.'+key),value);if(topic!=='portal-user')assert.equal(query.get('filter.contains['+(topic==='idea-user'?'email':'name')+']'),'Alex & Co');
 }
});

test('lookup views preserve distinct IDs, false values, URLs, selected fields and capped embeds',async t=>{
 for(const [topic,[path,record]] of Object.entries(resources)){
  const {dir,requests}=await setup(t,()=>({record}));const human=await run(dir,[topic,'view',record.id]);assert.equal(human.code,0,human.stderr);assert.match(human.stdout,new RegExp(record.id));assert.doesNotMatch(human.stdout,/undefined|null/);
  if(topic==='idea-portal'){assert.ok(human.stdout.includes('Portal URL: '+portal.external_url));assert.ok(human.stdout.includes('Settings URL: '+portal.html_url));assert.ok(human.stdout.includes('API URL: '+portal.url));assert.match(human.stdout,/Enabled: no/);assert.match(human.stdout,/Workspaces shown: 1/);assert.match(human.stderr,/projects is incomplete/);}
  if(topic==='idea-user'){assert.match(human.stdout,/Email: alex@example.test/);assert.match(human.stdout,/Portal memberships shown: 1/);assert.match(human.stderr,/portal_users is incomplete/);}
  if(topic==='portal-user'){for(const text of ['Enabled: no','Verified: yes','Unsubscribed: no','Permission: employee','Idea portal: '+portal.id,'Idea user: '+user.id])assert.ok(human.stdout.includes(text),text);}
  const json=await run(dir,[topic+':view',record.id,'--fields','default,custom_fields','--json']);assert.equal(json.code,0,json.stderr);assert.deepEqual(JSON.parse(json.stdout),record);assert.equal(requests[1].url,'/api/v3/'+path+'/'+record.id+'?fields=default%2Ccustom_fields');
 }
});

test('lookup identifiers and unsupported membership search fail before access',async t=>{
 const {dir,requests}=await setup(t);for(const topic of Object.keys(resources))for(const args of [['view'],['view','CLI-1'],['view','12/34'],['view','1','2'],['view','1','--fields',''],['list','--per-page','201'],['list','--descending'],['list','--filters','{"eq[enabled]":false}']]){const result=await run(dir,[topic,...args,'--json']);assert.equal(result.code,1,topic+JSON.stringify(args));assert.equal(result.stdout,'');}
 const search=await run(dir,['portal-user','list','--search','Alex','--json']);assert.equal(search.code,1);assert.equal(requests.length,0);
});

test('lookup lists refuse incomplete cursors and warn about sorted truncation',async t=>{
 for(const topic of Object.keys(resources)){
  for(const cursor of [null,'same']){const {dir,requests}=await setup(t,()=>({records:[{id:'1'}],pagination:{has_more:true,next_cursor:cursor}}));const result=await run(dir,[topic,'list','--json']);assert.equal(result.code,1);assert.match(result.stderr,/incomplete/);assert.equal(result.stdout,'');assert.equal(requests.length,cursor?2:1);}
  const {dir}=await setup(t,()=>({records:[],pagination:{has_more:false,next_cursor:null,truncated:true}}));const result=await run(dir,[topic,'list','--sort','id','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),[]);assert.match(result.stderr,/truncated/);
 }
});

test('portal lookups expose no mutation actions or API fallbacks',async t=>{
 const {dir,requests}=await setup(t);for(const topic of Object.keys(resources)){
  for(const action of ['create','edit','delete','invite','grant-access']){const result=await run(dir,[topic,action,'1','--json']);assert.equal(result.code,1);assert.equal(result.stdout,'');}
  const help=await run(dir,[topic,'--help']);assert.equal(help.code,0,help.stderr);assert.match(help.stdout,/read-only/);assert.match(help.stdout,/list/);assert.match(help.stdout,/view/);assert.doesNotMatch(help.stdout,/(create|edit|delete|invite|grant-access)/);
 }assert.equal(requests.length,0);
});

test('lookup permission and missing-record failures preserve v3 errors',async t=>{
 const {dir,requests}=await setup(t,req=>req.url.includes('/404?')?{status:404,error:'Not found'}:{status:403,error:'Not permitted'});for(const topic of Object.keys(resources))for(const args of [['list'],['view','403'],['view','404']]){const result=await run(dir,[topic,...args,'--json']);assert.equal(result.code,1);assert.match(result.stderr,/HTTP (403|404)/);assert.equal(result.stdout,'');}assert.equal(requests.length,9);assert.ok(requests.every(r=>r.method==='GET'&&r.url.startsWith('/api/v3/')));
});
