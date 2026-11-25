const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,run}=require('./helpers.cjs');
const persona={id:'7712000000000000001',reference_num:'CLI-P-1',name:'Product leader',occupation:'Product manager',quote:'Help me understand & prioritize',color:'#123456',project:{id:'7712000000000000002',name:'Platform'},html_url:'https://example.test/personas/CLI-P-1'};

test('persona creation resolves workspace context and preserves the complete published input',async t=>{
 const {dir,requests}=await setup(t,req=>({record:req.method==='GET'?{id:persona.project.id}:persona}));const input={name:'Product leader',project_id:'CLI',occupation:'Product manager',quote:'Help me understand & prioritize',color:'#123456',watchers:[{id:'456'}],custom_fields:{description:'<p>HTML custom field</p>'}};
 const result=await run(dir,['persona:create','--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),persona);assert.equal(requests[0].url,'/api/v3/projects/CLI?fields=id');assert.deepEqual(requests[1].body,{record:{...input,project_id:persona.project.id}});
 const flags=await run(dir,['persona','create','--workspace',persona.project.id,'-t','Another','--occupation','Leader','--quote','Plan & act','--color','#000000','--json']);assert.equal(flags.code,0,flags.stderr);assert.deepEqual(requests[2].body,{record:{name:'Another',project_id:persona.project.id,occupation:'Leader',quote:'Plan & act',color:'#000000'}});
});

test('persona partial edits retain plain quote text, empty clears and collection item patches',async t=>{
 const {dir,requests}=await setup(t,()=>({record:persona}));const result=await run(dir,['persona','edit',persona.reference_num,'--occupation','','--quote','<literal> & text','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(requests[0].body,{record:{occupation:'',quote:'<literal> & text'}});
 const input={watchers:[{id:'456',_destroy:true}],custom_fields:{description:'<p>New HTML</p>'}};const patch=await run(dir,['persona','edit',persona.id,'--input','-','--json'],{input:JSON.stringify(input)});assert.equal(patch.code,0,patch.stderr);assert.deepEqual(requests[1].body,{record:input});
});

test('persona validation rejects missing context, unsupported description/image/document fields and moves before access',async t=>{
 const {dir,requests}=await setup(t);
 for(const [action,input] of [[['create'],{name:'x'}],[['create'],{project_id:'123'}],...[{},{project_id:'123'},{description:'<p>no</p>'},{image:'x'},{image_url:'x'},{documents:[]},{position:2},{status_id:'123'},{occupation:null},{quote:123},{color:123},{color:'blue'},{color:'#12'},{watchers:[{id:456}]}].map(input=>[['edit',persona.reference_num],input])]){const result=await run(dir,['persona',...action,'--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,1,JSON.stringify(input));}
 const conflict=await run(dir,['persona','edit',persona.id,'--quote','a','--input','-','--json'],{input:'{"quote":"b"}'});assert.match(conflict.stderr,/either --input/);
 const body=await run(dir,['persona','edit',persona.id,'--body','Unsupported','--json']);assert.equal(body.code,1);assert.match(body.stderr,/Usage: aha persona edit/);assert.equal(requests.length,0);
});

test('persona lists support workspace refs, filters, field selection, cursor pages and incomplete-data warnings',async t=>{
 let page=0;const {dir,requests}=await setup(t,req=>req.url.startsWith('/api/v3/projects/')?{record:{id:persona.project.id}}:{records:[{...persona,watchers:{records:[],has_more:true}}],pagination:{has_more:++page===1,next_cursor:page===1?'next+/=':null,truncated:true}});
 const result=await run(dir,['persona','list','--workspace','CLI','--filters','{"eq[occupation]":"Product manager"}','--fields','id,name,occupation,watchers','--json']);assert.equal(result.code,0,result.stderr);assert.equal(JSON.parse(result.stdout).length,2);assert.match(result.stderr,/incomplete/);assert.match(result.stderr,/truncated/);const query=new URL(requests[2].url,'https://example.test').searchParams;assert.equal(query.get('project_id'),persona.project.id);assert.equal(query.get('filter.eq[occupation]'),'Product manager');assert.equal(query.get('fields'),'id,name,occupation,watchers');assert.equal(query.get('after'),'next+/=');
});

test('persona list refuses repeated cursors without returning a partial array',async t=>{
 const {dir}=await setup(t,()=>({records:[persona],pagination:{has_more:true,next_cursor:'same'}}));const result=await run(dir,['persona','list','--json']);assert.equal(result.code,1);assert.match(result.stderr,/incomplete/);assert.equal(result.stdout,'');
});

test('persona views show workspace, occupation, quote and color while JSON retains API values',async t=>{
 const {dir}=await setup(t,()=>({record:persona}));const result=await run(dir,['persona','view',persona.reference_num]);assert.equal(result.code,0,result.stderr);assert.match(result.stdout,/Workspace: Platform/);assert.match(result.stdout,/Occupation: Product manager/);assert.match(result.stdout,/Quote: Help me understand & prioritize/);assert.match(result.stdout,/Color: #123456/);const json=await run(dir,['persona','view',persona.id,'--json']);assert.equal(json.code,0,json.stderr);assert.deepEqual(JSON.parse(json.stdout),persona);
});

test('persona deletion requires confirmation, respects cancellation and emits the shared JSON result',async t=>{
 const {dir,requests}=await setup(t,()=>({record:persona}));const denied=await run(dir,['persona','delete',persona.reference_num,'--json']);assert.equal(denied.code,1);assert.equal(requests.length,0);const canceled=await run(dir,['persona','delete',persona.reference_num],{confirm:false});assert.equal(canceled.code,0);assert.equal(requests.length,1);const result=await run(dir,['persona','delete',persona.reference_num,'--yes','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),{id:persona.id,deleted:true});assert.equal(requests.at(-1).url,'/api/v3/personas/'+persona.id);assert.equal(requests.at(-1).method,'DELETE');
});

test('persona permission, not-found and validation failures remain errors without legacy fallback',async t=>{
 const {dir,requests}=await setup(t,req=>req.url.includes('missing')?{status:404,error:'Not found'}:req.method==='PUT'?{status:400,error:'Invalid field'}:req.method==='DELETE'?{status:403,error:'Not permitted'}:{record:persona});
 for(const args of [['view','CLI-missing-1'],['edit',persona.id,'--quote','New'],['delete',persona.id,'--yes']]){const result=await run(dir,['persona',...args,'--json']);assert.equal(result.code,1);assert.match(result.stderr,/HTTP (403|404|400)/);assert.equal(result.stdout,'');}
 assert.ok(requests.every(r=>r.url.startsWith('/api/v3/personas/')));
});
