const {test} = require('node:test');
const assert = require('node:assert/strict');
const {setup, run} = require('./helpers.cjs');
const comment = {id: '7702173770823077592', body: '<p>Review &amp; discuss</p>', html_url: 'https://example.test/comments/7702173770823077592', record: {id: '7702173770823077591', type: 'feature', name: 'Owner'}, parent: {id: '7702173770823077590'}, user: {id: '123', name: 'Author'}};

test('comment create resolves owning record references and keeps the reply ID separate', async t => {
 const {dir, requests} = await setup(t, req => ({record: req.method === 'GET' ? {id: comment.record.id} : comment}));
 const result = await run(dir, ['comment', 'create', '--record', 'CLI-1', '--record-type', 'feature', '--reply-to', comment.parent.id, '-b', 'Review <literal> & text\nnext', '--json']);
 assert.equal(result.code, 0, result.stderr);
 assert.deepEqual(JSON.parse(result.stdout), comment);
 assert.equal(requests[0].url, '/api/v3/features/CLI-1?fields=id');
 assert.deepEqual(requests[1].body, {record: {record_id: comment.record.id, record_type: 'feature', parent_id: comment.parent.id, body: '<p>Review &lt;literal&gt; &amp; text<br>next</p>'}});
});

test('comment structured input preserves HTML and edits only the body', async t => {
 const {dir, requests} = await setup(t, () => ({record: comment}));
 const input = {record_id: comment.record.id, record_type: 'feature', parent_id: comment.parent.id, body: '<p><strong>HTML</strong></p>'};
 const created = await run(dir, ['comment:create', '--input', '-', '--json'], {input: JSON.stringify(input)});
 assert.equal(created.code, 0, created.stderr);
 assert.deepEqual(requests[0].body, {record: input});
 const edited = await run(dir, ['comment', 'edit', comment.id, '--input', '-', '--json'], {input: '{"body":"<p>Edited</p>"}'});
 assert.equal(edited.code, 0, edited.stderr);
 assert.equal(requests[1].method, 'PUT');
 assert.deepEqual(requests[1].body, {record: {body: '<p>Edited</p>'}});
 const viewed = await run(dir, ['comment', 'view', comment.id]);
 assert.equal(viewed.code, 0, viewed.stderr);
 assert.match(viewed.stdout, /Review & discuss/);
 assert.match(viewed.stdout, /Reply to comment: 7702173770823077590/);
 assert.match(viewed.stdout, /Record: feature 7702173770823077591: Owner/);
 assert.doesNotMatch(viewed.stdout, /<p>/);
});

test('comment validation rejects missing context/body, numeric JSON IDs and read-only edit fields before access', async t => {
 const {dir, requests} = await setup(t);
 for (const input of [{body: 'x'}, {record_id: '123', body: 'x'}, {record_id: '123', record_type: 'feature'}, {record_id: null, record_type: null, body: 'x'}, {record_id: 123, record_type: 'feature', body: 'x'}, {record_id: '123', record_type: 'feature', parent_id: null, body: 'x'}, {record_id: '123', record_type: 'feature', parent_id: 'CLI-1', body: 'x'}]) {
  const result = await run(dir, ['comment', 'create', '--input', '-', '--json'], {input: JSON.stringify(input)});
  assert.equal(result.code, 1, JSON.stringify(input));
 }
 for (const input of [{}, {body: ''}, {body: 'x', record_id: '123'}, {body: 'x', parent_id: '123'}, {body: 'x', user_id: '123'}]) {
  const result = await run(dir, ['comment', 'edit', comment.id, '--input', '-', '--json'], {input: JSON.stringify(input)});
  assert.equal(result.code, 1, JSON.stringify(input));
 }
 const badScope = await run(dir, ['comment', 'list', '--record', 'CLI-1', '--json']);assert.equal(badScope.code, 1);
 const conflict = await run(dir, ['comment', 'create', '--body', 'x', '--input', '-', '--json'], {input: '{"body":"y","record_id":"123","record_type":"feature"}'});assert.match(conflict.stderr, /either --input/);
 const badPage = await run(dir, ['comment', 'list', '--record', 'CLI-1', '--record-type', 'feature', '--per-page', '201', '--json']);assert.equal(badPage.code, 1);
 assert.equal(requests.length, 0);
});

test('comment list resolves type-specific scope, searches bodies and follows pagination with warnings', async t => {
 let page=0;
 const {dir, requests} = await setup(t, req => req.url.startsWith('/api/v3/requirements/') ? {record: {id: '555'}} : {records: [comment], pagination: {has_more: ++page===1, next_cursor: page===1 ? 'next+/=' : null, truncated: page===2, truncated_message: 'Sorted results were truncated.'}});
 const result = await run(dir, ['comment', 'list', '--record', 'CLI-1-2', '--record-type', 'requirement', '--search', 'Review', '--filters', '{"eq[parent.id]":"123"}', '--fields', 'id,body,parent,record', '--json']);
 assert.equal(result.code, 0, result.stderr);
 assert.deepEqual(JSON.parse(result.stdout), [comment, comment]);
 assert.match(result.stderr, /truncated/);
 assert.equal(requests[0].url, '/api/v3/requirements/CLI-1-2?fields=id');
 const query=new URL(requests[2].url, 'https://example.test').searchParams;
 assert.equal(query.get('filter.eq[record.id]'), '555');assert.equal(query.get('filter.eq[record.type]'), 'requirement');
 assert.equal(query.get('filter.eq[parent.id]'), '123');assert.equal(query.get('filter.contains[body]'), 'Review');assert.equal(query.get('after'), 'next+/=');
});

test('comment delete confirms cascading replies, permits canceling, and returns string IDs on success', async t => {
 const {dir, requests} = await setup(t, () => ({record: comment}));
 const scripted = await run(dir, ['comment', 'delete', comment.id, '--json']);assert.equal(scripted.code, 1);assert.equal(requests.length, 0);
 const canceled = await run(dir, ['comment', 'delete', comment.id], {confirm: false});assert.equal(canceled.code, 0);assert.match(canceled.stdout, /canceled/);assert.equal(requests.length, 1);
 const removed = await run(dir, ['comment', 'delete', comment.id, '--yes', '--json']);assert.equal(removed.code, 0, removed.stderr);assert.deepEqual(JSON.parse(removed.stdout), {id: comment.id, deleted: true});
 assert.equal(requests.at(-1).method, 'DELETE');assert.equal(requests.at(-1).url, '/api/v3/comments/'+comment.id);
});

test('comment API errors surface without successful output or legacy retries', async t => {
 const {dir, requests} = await setup(t, req => ({status: req.method==='POST' ? 422 : req.method==='PUT' ? 403 : 404, error: 'Not permitted or invalid reply'}));
 for (const args of [['view', comment.id], ['edit', comment.id, '-b', 'Edited'], ['create', '--record', '123', '--record-type', 'feature', '--reply-to', '456', '-b', 'Reply']]) {
  const result=await run(dir, ['comment', ...args, '--json']);assert.equal(result.code, 1);assert.match(result.stderr, /HTTP (403|404|422)/);assert.equal(result.stdout, '');
 }
 assert.equal(requests.length, 3);assert.ok(requests.every(r=>r.url.startsWith('/api/v3/')));
});


test('comment reference lookup requires a published type-specific endpoint', async t => {
 const {dir, requests}=await setup(t);
 const result=await run(dir, ['comment', 'list', '--record', 'CLI-1', '--record-type', 'custom_table_record', '--json']);
 assert.equal(result.code, 1);assert.match(result.stderr, /numeric owning record ID/);assert.equal(requests.length, 0);
});
