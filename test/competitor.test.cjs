const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,run}=require('./helpers.cjs');
const competitor={id:'7712000000000000001',reference_num:'CLI-C-1',name:'Acme',subtitle:'Alternative platform',website:'https://acme.example.test',color:'#123456',project:{id:'7712000000000000002',name:'Platform'},html_url:'https://example.test/competitors/CLI-C-1',url:'https://example.test/api/v3/competitors/CLI-C-1'};

test('competitor creation resolves workspace context and preserves the complete published input',async t=>{
 const {dir,requests}=await setup(t,req=>({record:req.method==='GET'?{id:competitor.project.id}:competitor}));const input={name:'Acme',project_id:'CLI',subtitle:'Alternative platform',website:'https://acme.example.test',color:'#123456',custom_fields:{notes:'<p>Structured custom field</p>'}};
 const result=await run(dir,['competitor:create','--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),competitor);assert.equal(requests[0].url,'/api/v3/projects/CLI?fields=id');assert.deepEqual(requests[1].body,{record:{...input,project_id:competitor.project.id}});
 const flags=await run(dir,['competitor','create','--workspace',competitor.project.id,'-t','Other','--subtitle','Tools & services','--website','acme.example.test','--color','#000000','--json']);assert.equal(flags.code,0,flags.stderr);assert.deepEqual(requests[2].body,{record:{name:'Other',project_id:competitor.project.id,subtitle:'Tools & services',website:'acme.example.test',color:'#000000'}});
});

test('competitor partial edits preserve plain subtitle/website text and empty clears',async t=>{
 const {dir,requests}=await setup(t,()=>({record:competitor}));const result=await run(dir,['competitor','edit',competitor.reference_num,'--subtitle','','--website','https://acme.example.test/path?a=1&b=2','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(requests[0].body,{record:{subtitle:'',website:'https://acme.example.test/path?a=1&b=2'}});
 const input={website:'',custom_fields:{notes:'<p>New HTML custom field</p>'}};const patch=await run(dir,['competitor','edit',competitor.id,'--input','-','--json'],{input:JSON.stringify(input)});assert.equal(patch.code,0,patch.stderr);assert.deepEqual(requests[1].body,{record:input});
});

test('competitor validation rejects missing context, moves, unsupported fields and malformed values before access',async t=>{
 const {dir,requests}=await setup(t);
 for(const [action,input] of [[['create'],{name:'x'}],[['create'],{project_id:'123'}],...[{},{project_id:'123'},{description:'<p>no</p>'},{image:'x'},{image_url:'x'},{documents:[]},{watchers:[]},{url:'https://wrong-field.test'},{position:2},{status_id:'123'},{subtitle:null},{website:123},{color:123},{color:'blue'},{color:'#12'}].map(input=>[['edit',competitor.reference_num],input])]){const result=await run(dir,['competitor',...action,'--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,1,JSON.stringify(input));}
 const conflict=await run(dir,['competitor','edit',competitor.id,'--website','a','--input','-','--json'],{input:'{"website":"b"}'});assert.match(conflict.stderr,/either --input/);
 const body=await run(dir,['competitor','edit',competitor.id,'--body','Unsupported','--json']);assert.equal(body.code,1);assert.match(body.stderr,/Usage: aha competitor edit/);assert.equal(requests.length,0);
});

test('competitor lists resolve workspace refs, filters, fields and cursor pages and warn about incomplete data',async t=>{
 let page=0;const {dir,requests}=await setup(t,req=>req.url.startsWith('/api/v3/projects/')?{record:{id:competitor.project.id}}:{records:[{...competitor,comments:{records:[],has_more:true}}],pagination:{has_more:++page===1,next_cursor:page===1?'next+/=':null,truncated:true}});
 const result=await run(dir,['competitor','list','--workspace','CLI','--filters','{"eq[subtitle]":"Alternative platform"}','--fields','id,name,website,comments','--json']);assert.equal(result.code,0,result.stderr);assert.equal(JSON.parse(result.stdout).length,2);assert.match(result.stderr,/incomplete/);assert.match(result.stderr,/truncated/);const query=new URL(requests[2].url,'https://example.test').searchParams;assert.equal(query.get('project_id'),competitor.project.id);assert.equal(query.get('filter.eq[subtitle]'),'Alternative platform');assert.equal(query.get('fields'),'id,name,website,comments');assert.equal(query.get('after'),'next+/=');
});

test('competitor lists reject missing cursors without returning partial arrays',async t=>{
 const {dir}=await setup(t,()=>({records:[competitor],pagination:{has_more:true,next_cursor:null}}));const result=await run(dir,['competitor','list','--json']);assert.equal(result.code,1);assert.match(result.stderr,/incomplete/);assert.equal(result.stdout,'');
});

test('competitor views distinguish the company website from Aha record and API URLs',async t=>{
 const {dir}=await setup(t,()=>({record:competitor}));const result=await run(dir,['competitor','view',competitor.reference_num]);assert.equal(result.code,0,result.stderr);assert.match(result.stdout,/Workspace: Platform/);assert.match(result.stdout,/Subtitle: Alternative platform/);assert.ok(result.stdout.includes('Website: '+competitor.website));assert.ok(result.stdout.includes(competitor.html_url));assert.ok(!result.stdout.includes('Website: '+competitor.url));assert.match(result.stdout,/Color: #123456/);const json=await run(dir,['competitor','view',competitor.id,'--json']);assert.equal(json.code,0,json.stderr);assert.deepEqual(JSON.parse(json.stdout),competitor);
});

test('competitor deletion confirms, supports cancellation and emits shared JSON using the fetched ID',async t=>{
 const {dir,requests}=await setup(t,()=>({record:competitor}));assert.equal((await run(dir,['competitor','delete',competitor.reference_num,'--json'])).code,1);assert.equal(requests.length,0);const canceled=await run(dir,['competitor','delete',competitor.reference_num],{confirm:false});assert.equal(canceled.code,0);assert.equal(requests.length,1);const result=await run(dir,['competitor','delete',competitor.reference_num,'--yes','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),{id:competitor.id,deleted:true});assert.equal(requests.at(-1).url,'/api/v3/competitors/'+competitor.id);assert.equal(requests.at(-1).method,'DELETE');
});

test('competitor errors preserve permission, validation and not-found failures without v1 retry',async t=>{
 const {dir,requests}=await setup(t,req=>req.url.includes('missing')?{status:404,error:'Not found'}:req.method==='PUT'?{status:400,error:'Invalid field'}:req.method==='DELETE'?{status:403,error:'Not permitted'}:{record:competitor});
 for(const args of [['view','CLI-missing-1'],['edit',competitor.id,'--website','new.test'],['delete',competitor.id,'--yes']]){const result=await run(dir,['competitor',...args,'--json']);assert.equal(result.code,1);assert.match(result.stderr,/HTTP (403|404|400)/);assert.equal(result.stdout,'');}
 assert.ok(requests.every(r=>r.url.startsWith('/api/v3/competitors/')));
});
