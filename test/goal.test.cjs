const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,run}=require('./helpers.cjs');
const goal={id:'7702173770823077592',reference_num:'CLI-G-1',name:'Retention',status:{id:'123',name:'In progress'},project:{id:'7702173770823077591',name:'Platform'},time_frame:{id:'124',name:'2026'},description:{body:'<p>Keep &amp; grow</p>'},success_metric_name:'Renewals',success_metric_description:'<p>Above <strong>90%</strong></p>',progress_source:'manual',progress:40,effort:35,value:85};

test('goal creation resolves a workspace reference and preserves the entire published input',async t=>{
 const {dir,requests}=await setup(t,req=>({record:req.method==='GET'?{id:goal.project.id}:goal}));
 const input={name:'Retention',project_id:'CLI',position:2,color:'#123abc',effort:35,value:85,progress_source:'manual',progress:40,status_id:'123',time_frame_id:'124',description:'<p>Keep &amp; grow</p>',success_metric_name:'Renewals',success_metric_description:'<p>Above 90%</p>',custom_fields:{goal_note:'Important'}};
 const result=await run(dir,['goal:create','--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),goal);assert.equal(requests[0].url,'/api/v3/projects/CLI?fields=id');assert.deepEqual(requests[1].body,{record:{...input,project_id:goal.project.id}});
});

test('goal numeric flags retain zeros and edits send only requested fields',async t=>{
 const {dir,requests}=await setup(t,()=>({record:goal}));
 const result=await run(dir,['goal','edit','CLI-G-1','--effort','0','--value','100','--progress','0','--progress-source','manual','--position','2','--status','123','--time-frame','124','--success-metric-name','Renewals','--json']);assert.equal(result.code,0,result.stderr);assert.equal(requests[0].method,'PUT');assert.deepEqual(requests[0].body,{record:{effort:0,value:100,progress:0,progress_source:'manual',position:2,status_id:'123',time_frame_id:'124',success_metric_name:'Renewals'}});
 const partial=await run(dir,['goal','edit',goal.id,'--input','-','--json'],{input:'{"success_metric_description":"<p>New metric</p>"}'});assert.equal(partial.code,0,partial.stderr);assert.deepEqual(requests[1].body,{record:{success_metric_description:'<p>New metric</p>'}});
});

test('goal validation rejects missing context, malformed numeric fields and read-only associations before access',async t=>{
 const {dir,requests}=await setup(t);
 for(const [action,input] of [[['create'],{name:'Goal'}],[['create'],{project_id:'123'}],...[{}, {project_id:'123'},{features:[]},{rollup_goals:[]},{key_results:[]},{effort:1.5},{value:101},{effort:-1},{progress:'25'},{position:9007199254740992},{success_metric_description:null},{status_id:123},{time_frame_id:null}].map(input=>[['edit','CLI-G-1'],input])]){
  const result=await run(dir,['goal',...action,'--input','-','--json'],{input:JSON.stringify(input)});assert.equal(result.code,1,JSON.stringify(input));
 }
 for(const [flag,value] of [['--effort','1.5'],['--progress','NaN'],['--value',' ']]){const result=await run(dir,['goal','edit','CLI-G-1',flag,value,'--json']);assert.equal(result.code,1);}
 const conflict=await run(dir,['goal','edit','CLI-G-1','--effort','10','--input','-','--json'],{input:'{"effort":20}'});assert.match(conflict.stderr,/either --input/);assert.equal(requests.length,0);
});

test('goal lists resolve workspace scope and retain requested fields, status filters and cursors',async t=>{
 let page=0;const {dir,requests}=await setup(t,req=>req.url.startsWith('/api/v3/projects/')?{record:{id:goal.project.id}}:{records:[goal],pagination:{has_more:++page===1,next_cursor:page===1?'next+/=':null}});
 const result=await run(dir,['goal','list','--workspace','CLI','--filters','{"eq[status.id]":"123"}','--fields','id,status,time_frame,progress_source','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),[goal,goal]);const query=new URL(requests[2].url,'https://example.test').searchParams;assert.equal(query.get('project_id'),goal.project.id);assert.equal(query.get('filter.eq[status.id]'),'123');assert.equal(query.get('fields'),'id,status,time_frame,progress_source');assert.equal(query.get('after'),'next+/=');
});

test('goal view renders the full metric and metadata while JSON retains original HTML',async t=>{
 const {dir}=await setup(t,()=>({record:goal}));const human=await run(dir,['goal','view','CLI-G-1']);assert.equal(human.code,0,human.stderr);assert.match(human.stdout,/Timeframe: 2026/);assert.match(human.stdout,/Success metric: Renewals/);assert.match(human.stdout,/Metric description: Above 90%/);assert.match(human.stdout,/Keep & grow/);assert.match(human.stdout,/Effort: 35/);assert.doesNotMatch(human.stdout,/<p>/);const result=await run(dir,['goal','view',goal.id,'--json']);assert.deepEqual(JSON.parse(result.stdout),goal);
});

test('goal deletion confirms and API failures do not retry through legacy endpoints',async t=>{
 const {dir,requests}=await setup(t,req=>req.url.includes('missing')?{status:404,error:'Not found'}:req.method==='PUT'?{status:400,error:'Wrong status workflow'}:req.method==='DELETE'?{status:403,error:'Not permitted'}:{record:goal});
 const canceled=await run(dir,['goal','delete','CLI-G-1','--json']);assert.equal(canceled.code,1);assert.equal(requests.length,0);
 const denied=await run(dir,['goal','delete','CLI-G-1','--yes','--json']);assert.equal(denied.code,1);assert.match(denied.stderr,/HTTP 403/);assert.equal(denied.stdout,'');
 const missing=await run(dir,['goal','view','CLI-missing-1','--json']);assert.equal(missing.code,1);assert.match(missing.stderr,/HTTP 404/);
 const status=await run(dir,['goal','edit','CLI-G-1','--status','123','--json']);assert.equal(status.code,1);assert.match(status.stderr,/HTTP 400/);assert.ok(requests.every(r=>r.url.startsWith('/api/v3/goals/')));
});
