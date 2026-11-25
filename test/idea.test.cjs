const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup,run}=require('./helpers.cjs');
const idea={id:'7712000000000000001',reference_num:'CLI-I-1',name:'Improve onboarding',status:{id:'123',name:'Under review'},project:{id:'555',name:'Platform'},assigned_to_user:{id:'456',name:'Owner'},submitted_idea_portal:{id:'789',name:'Customer feedback'},contributor:{id:'456',name:'Contributor',type:'aha'},description:{body:'<p>Reduce &amp; simplify</p>'},score:'12.5',endorsements_count:0,spam:false,visibility:'public',score_facts:{records:[{scoring_system_metric_id:'7712114766279100687',name:'Value',value:4}],has_more:false},comments:{records:[{id:'101'}],has_more:true},portal_comments:{records:[{id:'102'},{id:'103'}],has_more:false},watchers:{records:[],has_more:false},custom_fields:{note:'<p>Custom HTML</p>'},html_url:'https://example.test/ideas/CLI-I-1'};

test('idea lists resolve workspace refs into nested project filters and follow cursor pages',async t=>{
 let page=0;const {dir,requests}=await setup(t,req=>req.url.startsWith('/api/v3/projects/')?{record:{id:'555'}}:{records:[idea],pagination:{has_more:++page===1,next_cursor:page===1?'next+/=':null}});
 const result=await run(dir,['idea:list','--workspace','CLI','--search','onboarding','--filters','{"eq[status.id]":"123","eq[visibility]":"public"}','--fields','id,status,project,description,portal_comments','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),[idea,idea]);assert.equal(requests[0].url,'/api/v3/projects/CLI?fields=id');const query=new URL(requests[2].url,'https://example.test').searchParams;assert.equal(query.get('filter.eq[project.id]'),'555');assert.equal(query.get('project_id'),null);assert.equal(query.get('filter.eq[status.id]'),'123');assert.equal(query.get('filter.eq[visibility]'),'public');assert.equal(query.get('filter.contains[name]'),'onboarding');assert.equal(query.get('fields'),'id,status,project,description,portal_comments');assert.equal(query.get('after'),'next+/=');assert.ok(requests.every(r=>r.method==='GET'));
});

test('idea view renders associated metadata, separate comment counts and readable HTML while JSON preserves API fields',async t=>{
 const {dir,requests}=await setup(t,()=>({record:idea}));const result=await run(dir,['idea','view',idea.reference_num]);assert.equal(result.code,0,result.stderr);for(const text of ['Status: Under review','Workspace: Platform','Owner: Owner','Submitted portal: Customer feedback','Contributor: Contributor (aha)','Score: 12.5','Endorsements: 0','Spam: no','Visibility: public','Reduce & simplify','Internal comments shown: 1','Portal comments shown: 2','7712114766279100687',idea.html_url])assert.ok(result.stdout.includes(text),text);assert.match(result.stderr,/comments is incomplete/);assert.doesNotMatch(result.stdout,/<p>/);
 const resultJSON=await run(dir,['idea','view',idea.id,'--fields','default,custom_fields,score_facts','--json']);assert.equal(resultJSON.code,0,resultJSON.stderr);assert.deepEqual(JSON.parse(resultJSON.stdout),idea);assert.equal(new URL(requests[1].url,'https://example.test').searchParams.get('fields'),'default,custom_fields,score_facts');assert.ok(requests.every(r=>r.method==='GET'));
});

test('idea human output handles absent associations and retains zero scores and true spam',async t=>{
 const record={id:idea.id,name:'Minimal',score:0,spam:true,endorsements_count:0};const {dir}=await setup(t,()=>({record}));const result=await run(dir,['idea','view',idea.id]);assert.equal(result.code,0,result.stderr);assert.match(result.stdout,/Score: 0/);assert.match(result.stdout,/Spam: yes/);assert.match(result.stdout,/Endorsements: 0/);assert.doesNotMatch(result.stdout,/undefined|null/);
});

test('idea list validation rejects conflicting workspace scopes and malformed options before access',async t=>{
 const {dir,requests}=await setup(t);for(const args of [['list','--workspace','CLI','--filters','{"eq[project.id]":"555"}'],['list','--workspace','bad/slash'],['list','--per-page','0'],['list','--descending'],['list','--filters','{"eq[spam]":true}'],['view','bad/slash'],['view',idea.id,'--fields','']]){const result=await run(dir,['idea',...args,'--json']);assert.equal(result.code,1,JSON.stringify(args));assert.equal(result.stdout,'');}assert.equal(requests.length,0);
});

test('idea lists warn about sorted truncation and preserve empty-array output',async t=>{
 const {dir,requests}=await setup(t,()=>({records:[],pagination:{has_more:false,next_cursor:null,truncated:true}}));const result=await run(dir,['idea','list','--workspace','555','--sort','score','--descending','--json']);assert.equal(result.code,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),[]);assert.match(result.stderr,/truncated/);const query=new URL(requests[0].url,'https://example.test').searchParams;assert.equal(query.get('sort.desc'),'score');assert.equal(query.get('filter.eq[project.id]'),'555');assert.equal(requests.length,1);
});

test('idea lists refuse missing or repeated cursors without returning partial results',async t=>{
 for(const cursor of [null,'same']){const {dir,requests}=await setup(t,()=>({records:[idea],pagination:{has_more:true,next_cursor:cursor}}));const result=await run(dir,['idea','list','--json']);assert.equal(result.code,1);assert.match(result.stderr,/incomplete/);assert.equal(result.stdout,'');assert.equal(requests.length,cursor?2:1);}
});

test('idea writes are not registered or suggested, and never access the API',async t=>{
 const {dir,requests}=await setup(t);for(const action of ['create','edit','delete','promote','vote']){const result=await run(dir,['idea',action,idea.id,'--json']);assert.equal(result.code,1);assert.equal(result.stdout,'');}const help=await run(dir,['idea','--help']);assert.equal(help.code,0);assert.match(help.stdout,/read-only/);assert.match(help.stdout,/list/);assert.match(help.stdout,/view/);assert.doesNotMatch(help.stdout,/idea (create|edit|delete|promote|vote)/);assert.equal(requests.length,0);
});

test('idea permission and not-found failures remain read-only v3 errors',async t=>{
 const {dir,requests}=await setup(t,req=>req.url.includes('missing')?{status:404,error:'Not found'}:{status:403,error:'Not permitted'});for(const args of [['list'],['view',idea.id],['view','CLI-missing-1']]){const result=await run(dir,['idea',...args,'--json']);assert.equal(result.code,1);assert.match(result.stderr,/HTTP (403|404)/);assert.equal(result.stdout,'');}assert.ok(requests.every(r=>r.method==='GET'&&r.url.startsWith('/api/v3/ideas')));
});
