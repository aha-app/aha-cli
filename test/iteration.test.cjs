const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');
const iteration = { id: '7702173770823077592', reference_num: 'CLI-SP-1', name: 'Sprint 1', status: 'planning', html_url: 'https://example.test/iterations/CLI-SP-1' };

test('iteration creation resolves a workspace reference and preserves the writable payload', async t => {
  const {dir, requests} = await setup(t, req => ({record: req.method === 'GET' ? {id: '7702173770823077591'} : iteration}));
  const input = {name: 'Sprint 1', project_id: 'TEAM', status: 'planning', start_date: '2026-12-01', duration: 14, goal: 'Ship the release', progress: 25, description: '<p>Sprint details</p>'};
  const result = await run(dir, ['iteration:create', '--input', '-', '--json'], {input: JSON.stringify(input)});
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), iteration);
  assert.equal(requests[0].url, '/api/v3/projects/TEAM?fields=id');
  assert.equal(requests[1].method, 'POST');
  assert.deepEqual(requests[1].body, {record: {...input, project_id: '7702173770823077591'}});
});

test('iteration edits convert numeric flags, support end dates, and send only requested fields', async t => {
  const {dir, requests} = await setup(t, () => ({record: iteration}));
  const result = await run(dir, ['iteration', 'edit', 'CLI-SP-1', '--status', 'started', '--duration', '7', '--goal', 'New goal', '--progress', '0', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(requests[0].method, 'PUT');
  assert.deepEqual(requests[0].body, {record: {status: 'started', duration: 7, goal: 'New goal', progress: 0}});
  const patch = {end_date: '2026-12-20', description: '<p>Updated</p>'};
  const edited = await run(dir, ['iteration', 'edit', 'CLI-SP-1', '--input', '-', '--json'], {input: JSON.stringify(patch)});
  assert.equal(edited.code, 0, edited.stderr);
  assert.deepEqual(requests[1].body, {record: patch});
});

test('iteration validation rejects ambiguous dates, unsupported associations, and malformed metadata before access', async t => {
  const {dir, requests} = await setup(t);
  for (const [action, input] of [
    [['create'], {name: 'Sprint'}],
    [['create'], {name: 'Sprint', project_id: null}],
    ...[{}, {project_id: '123'}, {features: []}, {requirements: []}, {start_date: '2026-02-30'}, {duration: 1.5}, {duration: '14'}, {duration: 14, end_date: '2026-12-15'}, {goal: []}, {status: {name: 'planning'}}, {progress: '50'}].map(input => [['edit', 'CLI-SP-1'], input]),
  ]) {
    const result = await run(dir, ['iteration', ...action, '--input', '-', '--json'], {input: JSON.stringify(input)});
    assert.equal(result.code, 1, JSON.stringify(input));
  }
  const invalid = await run(dir, ['iteration', 'edit', 'CLI-SP-1', '--duration', '1.5', '--json']);
  assert.equal(invalid.code, 1);
  const conflict = await run(dir, ['iteration', 'edit', 'CLI-SP-1', '--progress', '10', '--input', '-', '--json'], {input: '{"progress":20}'});
  assert.equal(conflict.code, 1);
  assert.match(conflict.stderr, /either --input/);
  assert.equal(requests.length, 0);
});

test('iteration lists resolve workspace scope and pass filters and fields to API v3', async t => {
  const {dir, requests} = await setup(t, req => req.url.startsWith('/api/v3/projects/') ? {record: {id: '123'}} : {records: [iteration], pagination: {has_more: false, next_cursor: null}});
  const result = await run(dir, ['iteration', 'list', '--workspace', 'TEAM', '--filters', '{"eq[status]":"planning"}', '--fields', 'id,status,name', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [iteration]);
  const query = new URL(requests[1].url, 'https://example.test').searchParams;
  assert.equal(query.get('project_id'), '123');
  assert.equal(query.get('filter.eq[status]'), 'planning');
  assert.equal(query.get('fields'), 'id,status,name');
});

test('iteration deletion requires confirmation and surfaces not-found and permission failures', async t => {
  const {dir, requests} = await setup(t, req => req.url.includes('missing') ? {status: 404, error: 'Not found'} : req.method === 'DELETE' ? {status: 403, error: 'Not permitted'} : {record: iteration});
  const denied = await run(dir, ['iteration', 'delete', 'CLI-SP-1', '--json']);
  assert.equal(denied.code, 1);
  assert.equal(requests.length, 0);
  const missing = await run(dir, ['iteration', 'view', 'CLI-missing-1', '--json']);
  assert.equal(missing.code, 1);
  assert.match(missing.stderr, /404/);
  const forbidden = await run(dir, ['iteration', 'delete', 'CLI-SP-1', '--yes', '--json']);
  assert.equal(forbidden.code, 1);
  assert.match(forbidden.stderr, /403/);
  assert.equal(forbidden.stdout, '');
  assert.equal(requests.at(-1).url, '/api/v3/iterations/' + iteration.id);
});
