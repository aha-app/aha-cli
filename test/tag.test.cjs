const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,run}=require('./helpers.cjs');
const tag={id:'7702173770823077592', name:'Infrastructure', type:'general', color:'#123456'};

test('tag create supports title flags, full structured input and interactive title prompting', async t=>{
 const {dir,requests}=await setup(t,()=>({record:tag}));
 const result=await run(dir,['tag','create','--title','Infrastructure','--type','general','--color','#123456','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),tag);assert.deepEqual(requests[0].body,{record:{name:'Infrastructure',type:'general',color:'#123456'}});
 const research=await run(dir,['tag:create','--input','-','--json'],{input:'{"name":"Research","type":"research","color":"#abcdef"}'});assert.equal(research.code,0,research.stderr);assert.equal(requests[1].body.record.type,'research');
 const interactive=await run(dir,['tag','create'],{answers:{title:'Prompted tag'}});assert.equal(interactive.code,0,interactive.stderr);assert.equal(requests[2].body.record.name,'Prompted tag');assert.match(interactive.stdout,/ID: 7702173770823077592/);
 const scripted=await run(dir,['tag','create','--json'],{answers:{title:'No prompt'}});assert.equal(scripted.code,1);assert.equal(requests.length,3);
});

test('tag edits send requested metadata only and views expose name, type and color',async t=>{
 const {dir,requests}=await setup(t,()=>({record:tag}));
 const result=await run(dir,['tag','edit',tag.id,'--color','#abcdef','--json']);assert.equal(result.code,0,result.stderr);assert.equal(requests[0].method,'PUT');assert.deepEqual(requests[0].body,{record:{color:'#abcdef'}});
 const viewed=await run(dir,['tag','view',tag.id]);assert.equal(viewed.code,0,viewed.stderr);assert.match(viewed.stdout,/Infrastructure/);assert.match(viewed.stdout,/Type: general/);assert.match(viewed.stdout,/Color: #123456/);
});

test('tag validation rejects missing names, unsupported fields and invalid metadata before access',async t=>{
 const {dir,requests}=await setup(t);
 for(const input of [{},{name:' '},{name:'x',description:'x'},{name:'x',type:'other'},{name:'x',type:['general']},{name:'x',type:null},{name:'x',color:123}]){
  const result=await run(dir,['tag','create','--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,1,JSON.stringify(input));
 }
 const empty=await run(dir,['tag','edit',tag.id,'--json']);assert.equal(empty.code,1);
 const name=await run(dir,['tag','view','Infrastructure','--json']);assert.equal(name.code,1);assert.match(name.stderr,/Look up IDs/);
 const conflict=await run(dir,['tag','edit',tag.id,'--title','a','--input','-','--json'],{input:'{"name":"b"}'});assert.match(conflict.stderr,/either --input/);
 const page=await run(dir,['tag','list','--per-page','201','--json']);assert.equal(page.code,1);assert.equal(requests.length,0);
});

test('tag lookup preserves type/name filters, fields and cursor pagination',async t=>{
 let page=0;const {dir,requests}=await setup(t,()=>({records:[tag],pagination:{has_more:++page===1,next_cursor:page===1?'next+/=':null}}));
 const result=await run(dir,['tag','list','--search','Infra','--filters','{"eq[type]":"general"}','--fields','id,name,type,color','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),[tag,tag]);
 const query=new URL(requests[1].url,'https://example.test').searchParams;assert.equal(query.get('filter.contains[name]'),'Infra');assert.equal(query.get('filter.eq[type]'),'general');assert.equal(query.get('fields'),'id,name,type,color');assert.equal(query.get('after'),'next+/=');
});

test('tag deletion requires confirmation, allows canceling and returns string IDs',async t=>{
 const {dir,requests}=await setup(t,()=>({record:tag}));
 const scripted=await run(dir,['tag','delete',tag.id,'--json']);assert.equal(scripted.code,1);assert.equal(requests.length,0);
 const cancel=await run(dir,['tag','delete',tag.id],{confirm:false});assert.equal(cancel.code,0);assert.match(cancel.stdout,/canceled/);assert.equal(requests.length,1);
 const removed=await run(dir,['tag','delete',tag.id,'--yes','--json']);assert.equal(removed.code,0,removed.stderr);assert.deepEqual(JSON.parse(removed.stdout),{id:tag.id,deleted:true});assert.equal(requests.at(-1).method,'DELETE');
});

test('tag permission, missing-record, immutable-type and in-use errors fail without legacy retries',async t=>{
 const {dir,requests}=await setup(t,req=>req.method==='POST'?{status:403,error:'Not permitted'}:req.method==='PUT'?{status:422,error:'Type cannot change'}:req.method==='DELETE'?{status:422,error:'Only unused tags can be deleted'}:req.url.includes('/999?')?{status:404,error:'Not found'}:{record:tag});
 for(const args of [['create','--title','x'],['view','999'],['edit',tag.id,'--type','research'],['delete',tag.id,'--yes']]){
  const result=await run(dir,['tag',...args,'--json']);assert.equal(result.code,1);assert.match(result.stderr,/HTTP (403|404|422)/);assert.equal(result.stdout,'');
 }
 assert.equal(requests.length,5);assert.ok(requests.every(r=>r.url.startsWith('/api/v3/tags')));
});
