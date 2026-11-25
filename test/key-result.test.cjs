const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,run}=require('./helpers.cjs');
const keyResult={id:'7712000000000000001',reference_num:'CLI-G-1-KR-1',name:'Improve renewal',goal:{id:'7712000000000000002',reference_num:'CLI-G-1',name:'Retention'},status:{id:'123',name:'In progress'},assigned_to_user:{id:'456',name:'Owner'},description:{body:'<p>Keep &amp; grow</p>'},starting_metric:'50%',current_metric:'65%',target_metric:'80%',progress:50,position:2};

test('key result creation resolves its required goal reference and sends the full published input',async t=>{
 const {dir,requests}=await setup(t,req=>({record:req.method==='GET'?{id:keyResult.goal.id}:keyResult}));
 const input={name:'Renewals',goal_id:'CLI-G-1',position:2,progress:50,starting_metric:'50%',current_metric:'65%',target_metric:'80%',status_id:'123',assigned_to_user_id:'456',description:'<p>Keep &amp; grow</p>',custom_fields:{note:'Important'},watchers:[{id:'456'}]};
 const result=await run(dir,['key-result:create','--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),keyResult);assert.equal(requests[0].url,'/api/v3/goals/CLI-G-1?fields=id');assert.equal(requests[1].method,'POST');assert.deepEqual(requests[1].body,{record:{...input,goal_id:keyResult.goal.id}});
});

test('key result metric flags preserve text, progress zero and partial updates; @me uses existing lookup',async t=>{
 const {dir,requests}=await setup(t,req=>req.url==='/api/v1/me'?{user:{id:'456'}}:{record:keyResult});
 const result=await run(dir,['key-result','edit',keyResult.reference_num,'--starting-metric','0%','--current-metric','12.5%','--target-metric','90%','--progress','0','--position','2','--status','123','--owner','@me','--json']);assert.equal(result.code,0,result.stderr);assert.equal(requests[0].url,'/api/v1/me');assert.deepEqual(requests[1].body,{record:{starting_metric:'0%',current_metric:'12.5%',target_metric:'90%',progress:0,position:2,status_id:'123',assigned_to_user_id:'456'}});
 const patch={description:'<p>New <strong>HTML</strong></p>',assigned_to_user_id:null,custom_fields:{note:'new'},watchers:[{id:'456',_destroy:true}]};
 const edited=await run(dir,['key-result','edit',keyResult.id,'--input','-','--json'],{input:JSON.stringify(patch)});assert.equal(edited.code,0,edited.stderr);assert.deepEqual(requests[2].body,{record:patch});
 const empty=await run(dir,['key-result','edit',keyResult.id,'--current-metric','','--json']);assert.equal(empty.code,0,empty.stderr);assert.deepEqual(requests[3].body,{record:{current_metric:''}});
});

test('key result validation rejects missing context, parent moves, unsupported fields and invalid numeric input before access',async t=>{
 const {dir,requests}=await setup(t);for(const [action,input] of [[['create'],{name:'x'}],[['create'],{goal_id:'123'}],...[{},{goal_id:'123'},{project_id:'123'},{goal:{}},{progress_source:'manual'},{current_metric:65},{target_metric:null},{progress:'25'},{position:1.5},{position:9007199254740992},{status_id:null},{assigned_to_user_id:123},{watchers:[{id:456}]}].map(input=>[['edit',keyResult.reference_num],input])]){const result=await run(dir,['key-result',...action,'--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,1,JSON.stringify(input));}
 for(const [flag,value] of [['--progress','NaN'],['--position','1.5'],['--progress',' ']])assert.equal((await run(dir,['key-result','edit',keyResult.id,flag,value,'--json'])).code,1);
 const conflict=await run(dir,['key-result','edit',keyResult.id,'--progress','0','--input','-','--json'],{input:'{"progress":20}'});assert.match(conflict.stderr,/either --input/);
 const scopes=await run(dir,['key-result','list','--goal','CLI-G-1','--workspace','CLI','--json']);assert.equal(scopes.code,1);assert.match(scopes.stderr,/Choose --goal or --workspace/);assert.equal(requests.length,0);
});

test('key result lists resolve goal/workspace scopes and preserve filters, fields, cursors and warnings',async t=>{
 let page=0;const {dir,requests}=await setup(t,req=>req.url.startsWith('/api/v3/goals/')||req.url.startsWith('/api/v3/projects/')?{record:{id:'555'}}:{records:[{...keyResult,comments:{records:[],has_more:true}}],pagination:{has_more:++page===1,next_cursor:page===1?'next+/=':null,truncated:true}});
 const result=await run(dir,['key-result','list','--goal','CLI-G-1','--filters','{"eq[status.id]":"123"}','--fields','id,status,goal,comments','--json']);assert.equal(result.code,0,result.stderr);assert.equal(JSON.parse(result.stdout).length,2);assert.match(result.stderr,/incomplete/);assert.match(result.stderr,/truncated/);const query=new URL(requests[2].url,'https://example.test').searchParams;assert.equal(query.get('goal_id'),'555');assert.equal(query.get('filter.eq[status.id]'),'123');assert.equal(query.get('fields'),'id,status,goal,comments');assert.equal(query.get('after'),'next+/=');
 const scoped=await run(dir,['key-result','list','--workspace','CLI','--json']);assert.equal(scoped.code,0,scoped.stderr);assert.match(requests[3].url,/projects\/CLI/);assert.equal(new URL(requests[4].url,'https://example.test').searchParams.get('project_id'),'555');
});

test('key result list refuses repeated or missing cursors without printing partial results',async t=>{
 for(const cursor of [null,'same']){
  const {dir,requests}=await setup(t,()=>({records:[keyResult],pagination:{has_more:true,next_cursor:cursor}}));const result=await run(dir,['key-result','list','--json']);assert.equal(result.code,1);assert.match(result.stderr,/incomplete/);assert.equal(result.stdout,'');assert.equal(requests.length,cursor?2:1);
 }
});

test('key result views show goal, text metrics and owner while JSON keeps HTML intact',async t=>{
 const {dir}=await setup(t,()=>({record:keyResult}));const result=await run(dir,['key-result','view',keyResult.reference_num]);assert.equal(result.code,0,result.stderr);assert.match(result.stdout,/Goal: CLI-G-1: Retention/);assert.match(result.stdout,/Owner: Owner/);assert.match(result.stdout,/Starting metric: 50%/);assert.match(result.stdout,/Current metric: 65%/);assert.match(result.stdout,/Target metric: 80%/);assert.match(result.stdout,/Progress: 50/);assert.match(result.stdout,/Keep & grow/);assert.doesNotMatch(result.stdout,/<p>/);assert.deepEqual(JSON.parse((await run(dir,['key-result','view',keyResult.id,'--json'])).stdout),keyResult);
});

test('key result deletion requires confirmation and uses the fetched numeric string ID',async t=>{
 const {dir,requests}=await setup(t,()=>({record:keyResult}));assert.equal((await run(dir,['key-result','delete',keyResult.reference_num,'--json'])).code,1);assert.equal(requests.length,0);
 const canceled=await run(dir,['key-result','delete',keyResult.reference_num],{confirm:false});assert.equal(canceled.code,0,canceled.stderr);assert.equal(requests.length,1);
 const deleted=await run(dir,['key-result','delete',keyResult.reference_num,'--yes','--json']);assert.equal(deleted.code,0,deleted.stderr);assert.deepEqual(JSON.parse(deleted.stdout),{id:keyResult.id,deleted:true});assert.equal(requests.at(-1).method,'DELETE');assert.equal(requests.at(-1).url,'/api/v3/key_results/'+keyResult.id);
});

test('key result capability/permission failures are actionable and never retry through v1',async t=>{
 const {dir,requests}=await setup(t,()=>({status:403,error:'Access denied'}));
 for(const args of [['list'],['view',keyResult.id],['create','--goal','123','--title','x'],['edit',keyResult.id,'--progress','25'],['delete',keyResult.id,'--yes']]){const before=requests.length;const result=await run(dir,['key-result',...args,'--json']);assert.equal(result.code,1);assert.match(result.stderr,/HTTP 403/);assert.match(result.stderr,/Enterprise\+/);assert.match(result.stderr,/permission to access the goal/);assert.equal(result.stdout,'');assert.equal(requests.length,before+1);}
 assert.ok(requests.every(r=>r.url.startsWith('/api/v3/key_results')));
 const missing=await setup(t,()=>({status:404,error:'Not found'}));const result=await run(missing.dir,['key-result','view',keyResult.id,'--json']);assert.equal(result.code,1);assert.match(result.stderr,/HTTP 404/);assert.doesNotMatch(result.stderr,/Enterprise/);
});
