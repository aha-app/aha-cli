const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');
const epic = { id: '7702173770823077592', reference_num: 'CLI-E-1', name: 'CLI epic', html_url: 'https://example.test/epics/CLI-E-1' };

test('epic creation resolves a release reference and preserves string IDs', async t => {
  const { dir, requests } = await setup(t, req => req.url.startsWith('/api/v3/releases/CLI-R-1') ? { record: { id: '7702173770823077591' } } : { record: epic });
  const result = await run(dir, ['epic', 'create', '--release', 'CLI-R-1', '-t', ' CLI epic ', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), epic);
  assert.deepEqual(requests.map(r => r.method), ['GET', 'POST']);
  assert.deepEqual(requests[1].body, { record: { release_id: '7702173770823077591', name: 'CLI epic' } });
  assert.ok(requests.every(r => r.url.startsWith('/api/v3/')));
});

test('epic workspace creation and edits preserve structured writable fields and collection patches', async t => {
  const { dir, requests } = await setup(t, () => ({ record: epic }));
  const input = { name: 'Epic', project_id: '123', description: '<p>Details</p>', initial_estimate: 2, detailed_estimate: 3, remaining_estimate: 1, work_done: 1, progress_source: 'manual', progress: 50, duration_source: 'manual', estimate_source: 'manual', team_id: '456', team_status_id: '789', iteration_id: '234', tags: [{name: 'CLI'}], goals: [{reference_num: 'CLI-G-1'}], key_results: [{reference_num: 'CLI-KR-1'}], custom_fields: {test_value: 'Example'} };
  const created = await run(dir, ['epic:create', '--input', '-', '--json'], {input: JSON.stringify(input)});
  assert.equal(created.code, 0, created.stderr);
  assert.deepEqual(requests[0].body, {record: input});
  const patch = { assigned_to_user_id: null, release_id: '567', tags: [{id: '5', _destroy: true}], description: '', start_date: null };
  const edited = await run(dir, ['epic', 'edit', 'CLI-E-1', '--input', '-', '--json'], {input: JSON.stringify(patch)});
  assert.equal(edited.code, 0, edited.stderr);
  assert.deepEqual(requests[1].body, {record: patch});
  assert.ok(requests[1].url.startsWith('/api/v3/epics/CLI-E-1?'));
});

test('epics reject unsupported feature-only fields and invalid parents before API access', async t => {
  const {dir, requests} = await setup(t);
  for (const [action, input] of [
    [['create'], {name: 'Epic'}],
    [['create'], {name: 'Epic', project_id: '123', release_id: '456'}],
    [['edit', 'CLI-E-1'], {project_id: '123'}],
    [['edit', 'CLI-E-1'], {type_id: '123'}],
    [['edit', 'CLI-E-1'], {epic_id: '123'}],
    [['edit', 'CLI-E-1'], {features: []}],
  ]) {
    const result = await run(dir, ['epic', ...action, '--input', '-', '--json'], {input: JSON.stringify(input)});
    assert.equal(result.code, 1);
  }
  assert.equal(requests.length, 0);
});

test('epic list resolves workspace and follows cursors while preserving filters', async t => {
  let page = 0;
  const {dir, requests} = await setup(t, req => req.url.startsWith('/api/v3/projects/CLI') ? {record: {id: '123'}} : {records: [epic], pagination: {has_more: ++page === 1, next_cursor: page === 1 ? 'opaque+/=' : null}});
  const result = await run(dir, ['epic', 'list', '--workspace', 'CLI', '--search', 'CLI', '--fields', 'id,name', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).length, 2);
  const query = new URL(requests[2].url, 'https://example.test').searchParams;
  assert.equal(query.get('project_id'), '123');
  assert.equal(query.get('after'), 'opaque+/=');
  assert.equal(query.get('fields'), 'id,name');
  assert.equal(query.get('filter.contains[name]'), 'CLI');
});

test('epic views preserve capped features and display their references without claiming completeness', async t => {
  const record = {...epic, features: {records: [{id: '123', reference_num: 'CLI-12', name: 'Feature'}], has_more: true}};
  const {dir} = await setup(t, () => ({record}));
  const json = await run(dir, ['epic', 'view', 'CLI-E-1', '--json']);
  assert.equal(json.code, 0, json.stderr);
  assert.deepEqual(JSON.parse(json.stdout), record);
  assert.match(json.stderr, /features.*incomplete/);
  assert.match(json.stderr, /aha feature list/);
  const human = await run(dir, ['epic', 'view', 'CLI-E-1']);
  assert.equal(human.code, 0, human.stderr);
  assert.match(human.stdout, /CLI-12/);
  assert.match(human.stdout, /More features/);
});

test('epic API errors remain errors without a legacy retry', async t => {
  const {dir, requests} = await setup(t, () => ({status: 403, error: 'Not permitted'}));
  const result = await run(dir, ['epic:view', 'CLI-E-1', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /403.*Not permitted/);
  assert.equal(result.stdout, '');
  assert.equal(requests.length, 1);
});

test('epic deletion requires confirmation and deletes only the resolved ID', async t => {
  const {dir, requests} = await setup(t, req => req.method === 'DELETE' ? {} : {record: epic});
  const denied = await run(dir, ['epic', 'delete', 'CLI-E-1', '--json']);
  assert.equal(denied.code, 1);
  assert.equal(requests.length, 0);
  const canceled = await run(dir, ['epic', 'delete', 'CLI-E-1', '--yes=false'], {confirm: false});
  assert.equal(canceled.code, 0, canceled.stderr);
  assert.equal(requests.length, 1);
  const deleted = await run(dir, ['epic', 'delete', 'CLI-E-1', '--yes', '--json']);
  assert.equal(deleted.code, 0, deleted.stderr);
  assert.deepEqual(JSON.parse(deleted.stdout), {id: epic.id, deleted: true});
  assert.equal(requests[2].url, '/api/v3/epics/' + epic.id);
});
