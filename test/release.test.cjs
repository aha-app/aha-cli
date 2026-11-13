const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');
const release = { id: '7702173770823077592', reference_num: 'CLI-R-1', name: 'CLI release', html_url: 'https://example.test/releases/CLI-R-1' };

test('release create resolves workspace, rollup parent and owner without losing string IDs', async t => {
  const { dir, requests } = await setup(t, req => req.url === '/api/v1/me' ? {user: {id: '789'}} : {record: req.method === 'GET' ? {id: '7702173770823077591'} : release});
  const input = { name: 'Launch', type: 'rollup_release', project_id: 'CLI', parent_id: 'CLI-R-2', owner_id: '@me', release_date: '2026-11-30', external_release_date: '2026-12-01', external_date_resolution: 'month', released_on: '2026-11-30', development_started_on: '2026-11-01', duration_source: 'manual', progress_source: 'manual', progress: 25, position: 2, description: '<p>Details</p>', custom_fields: {test: 'Value'}, watchers: [{id: '123'}] };
  const result = await run(dir, ['release:create', '--input', '-', '--json'], {input: JSON.stringify(input)});
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), release);
  assert.deepEqual(requests.at(-1).body, {record: {...input, project_id: '7702173770823077591', parent_id: '7702173770823077591', owner_id: '789'}});
  assert.deepEqual(requests.map(r => r.method), ['GET', 'GET', 'GET', 'POST']);
});

test('release edits convert explicit parking-lot flags and send only requested metadata', async t => {
  const {dir, requests} = await setup(t, () => ({record: release}));
  const flags = await run(dir, ['release', 'edit', 'CLI-R-1', '--parking-lot', 'false', '--release-date', '2026-11-30', '--external-date-resolution', 'sync', '--json']);
  assert.equal(flags.code, 0, flags.stderr);
  assert.deepEqual(requests[0].body, {record: {parking_lot: false, release_date: '2026-11-30', external_date_resolution: 'sync'}});
  const patch = {owner_id: '456', watchers: [{id: '123', _destroy: true}]};
  const edited = await run(dir, ['release', 'edit', 'CLI-R-1', '--input', '-', '--json'], {input: JSON.stringify(patch)});
  assert.equal(edited.code, 0, edited.stderr);
  assert.deepEqual(requests[1].body, {record: patch});
  const created = await run(dir, ['release', 'create', '--workspace', '123', '-t', 'Later', '--parking-lot', 'true', '--json']);
  assert.equal(created.code, 0, created.stderr);
  assert.deepEqual(requests[2].body, {record: {project_id: '123', name: 'Later', parking_lot: true}});
});

test('release validation rejects invalid dates, read-only fields and missing parents before API access', async t => {
  const {dir, requests} = await setup(t);
  for (const [action, input] of [
    [['create'], {name: 'Release'}],
    [['create'], {name: 'Release', project_id: '123', type: 'feature'}],
    ...[{project_id: '123'}, {type: 'release'}, {features: []}, {release_date: '2026-02-30'}, {external_release_date: 'tomorrow'}, {released_on: '2026-13-01'}, {development_started_on: '2026-11-31'}, {parking_lot: 'false'}, {external_date_resolution: 'daily'}, {owner_id: 123}, {owner_id: null}, {parent_id: null}].map(input => [['edit', 'CLI-R-1'], input]),
  ]) {
    const result = await run(dir, ['release', ...action, '--input', '-', '--json'], {input: JSON.stringify(input)});
    assert.equal(result.code, 1, JSON.stringify(input));
  }
  const conflict = await run(dir, ['release', 'edit', 'CLI-R-1', '--parking-lot', 'true', '--input', '-', '--json'], {input: '{"parking_lot":false}'});
  assert.equal(conflict.code, 1);
  assert.match(conflict.stderr, /either --input/);
  assert.equal(requests.length, 0);
});

test('release list resolves workspace and preserves parking-lot filters across pages', async t => {
  let page = 0;
  const {dir, requests} = await setup(t, req => req.url.startsWith('/api/v3/projects/CLI') ? {record: {id: '123'}} : {records: [release], pagination: {has_more: ++page === 1, next_cursor: page === 1 ? 'opaque+/=' : null}});
  const result = await run(dir, ['release', 'list', '--workspace', 'CLI', '--filters', '{"eq[parking_lot]":"true"}', '--fields', 'id,name', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).length, 2);
  const query = new URL(requests[2].url, 'https://example.test').searchParams;
  assert.equal(query.get('project_id'), '123');
  assert.equal(query.get('after'), 'opaque+/=');
  assert.equal(query.get('filter.eq[parking_lot]'), 'true');
});

test('release deletion requires confirmation, resolves its ID, and surfaces API denials', async t => {
  const {dir, requests} = await setup(t, req => req.url.includes('missing') ? {status: 404, error: 'Not found'} : req.method === 'DELETE' ? {status: 403, error: 'Not permitted'} : {record: release});
  const denied = await run(dir, ['release', 'delete', 'CLI-R-1', '--json']);
  assert.equal(denied.code, 1);
  assert.equal(requests.length, 0);
  const missing = await run(dir, ['release', 'view', 'CLI-missing-1', '--json']);
  assert.equal(missing.code, 1);
  assert.match(missing.stderr, /404/);
  const forbidden = await run(dir, ['release', 'delete', 'CLI-R-1', '--yes', '--json']);
  assert.equal(forbidden.code, 1);
  assert.match(forbidden.stderr, /403/);
  assert.equal(forbidden.stdout, '');
  assert.equal(requests.at(-1).url, '/api/v3/releases/' + release.id);
});
