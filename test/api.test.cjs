const {test}=require('node:test');
const assert=require('node:assert/strict');
const API=require('../lib/api').default;
const {parseJSONWithStringIds}=require('../lib/lib/json-ids');

test('API JSON parsing preserves large numeric score-fact IDs and ordinary values/HTML',async t=>{
 const body=String.raw`{"record":{"id":7702173770823077592,"score_facts":{"records":[{"scoring_system_metric_id":7712114766279100687,"scoring_system_id":420001850772881408,"value":2.5}]},"description":{"body":"<p>literal \"id\": 9007199254740993 &amp; text</p>"},"progress":25,"enabled":true,"parent_id":null}}`;
 t.mock.method(global,'fetch',async()=>new Response(body,{headers:{'content-type':'application/json'}}));
 const api=new API({baseURL:'https://example.test'});const result=await api.get('/api/v3/initiatives/1');
 assert.equal(result.body.record.id,'7702173770823077592');const fact=result.body.record.score_facts.records[0];assert.equal(fact.scoring_system_metric_id,'7712114766279100687');assert.equal(fact.scoring_system_id,'420001850772881408');assert.equal(fact.value,2.5);assert.equal(result.body.record.progress,25);assert.equal(result.body.record.enabled,true);assert.equal(result.body.record.parent_id,null);assert.equal(result.body.record.description.body,'<p>literal "id": 9007199254740993 &amp; text</p>');
});

test('identifier normalization handles nested objects, escaped keys, zero IDs and unrelated arrays',()=>{
 const body=String.raw`{"\u0069d":123,"nested":{"time_frame_id":0,"id":"456"},"values":[1,2.5,{"metric_id":9007199254740993}],"label":"id","score":10.25}`;
 assert.deepEqual(parseJSONWithStringIds(body),{id:'123',nested:{time_frame_id:'0',id:'456'},values:[1,2.5,{metric_id:'9007199254740993'}],label:'id',score:10.25});
 assert.throws(()=>parseJSONWithStringIds('{"id":01}'),SyntaxError);
 assert.throws(()=>parseJSONWithStringIds('{"id":1.5}'),/non-integer numeric identifier/);
});

test('API errors retain precise identifiers while text and no-content responses remain compatible',async t=>{
 let mode='error';t.mock.method(global,'fetch',async()=>mode==='error'?new Response('{"error":{"record_id":7712114766279100687,"status":403}}',{status:403,headers:{'content-type':'application/json'}}):mode==='text'?new Response('plain id: 123',{headers:{'content-type':'text/plain'}}):new Response(null,{status:204}));const api=new API({baseURL:'https://example.test'});
 await assert.rejects(api.get('/api/v3/initiatives/1'),error=>{assert.equal(error.http.body.error.record_id,'7712114766279100687');assert.equal(error.http.statusCode,403);return true;});
 mode='text';assert.equal((await api.get('/plain')).body,'plain id: 123');mode='empty';assert.equal((await api.delete('/api/v3/initiatives/1')).body,null);
});
