const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');
const workspace = {id: '7702173770823077592', reference_prefix: 'CLI', name: 'CLI workspace', type: 'product', line: false, parent: {id: '7702173770823077591', reference_prefix: 'LINE'}, children: {records: [], has_more: false}};

test('workspace creation resolves a parent prefix and preserves every published writable field', async t => {
  const {dir, requests} = await setup(t, req => ({record: req.method === 'GET' ? {id: workspace.parent.id} : workspace}));
  const input = {name: 'CLI workspace', reference_prefix: 'CLI', parent_id: 'LINE', description: '<p>Details</p>', custom_fields: {audience: 'internal'}, watchers: [{id: '123'}, {id: '456', _destroy: true}]};
  const result = await run(dir, ['workspace:create', '--input', '-', '--json'], {input: JSON.stringify(input)});
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), workspace);
  assert.equal(requests[0].url, '/api/v3/projects/LINE?fields=id');
  assert.equal(requests[1].method, 'POST');
  assert.deepEqual(requests[1].body, {record: {...input, parent_id: workspace.parent.id}});
});

test('workspace edits address a prefix and send only requested fields, including clearing a parent', async t => {
  const {dir, requests} = await setup(t, () => ({record: workspace}));
  const result = await run(dir, ['workspace', 'edit', 'CLI', '--prefix', 'NEWCLI', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.ok(requests[0].url.startsWith('/api/v3/projects/CLI?'));
  assert.equal(requests[0].method, 'PUT');
  assert.deepEqual(requests[0].body, {record: {reference_prefix: 'NEWCLI'}});
  const patch = {parent_id: null, watchers: [{id: '123', _destroy: true}]};
  const cleared = await run(dir, ['workspace', 'edit', workspace.id, '--input', '-', '--json'], {input: JSON.stringify(patch)});
  assert.equal(cleared.code, 0, cleared.stderr);
  assert.deepEqual(requests[1].body, {record: patch});
});

test('workspace validation rejects missing prefixes, type changes and unsupported deletion before access', async t => {
  const {dir, requests} = await setup(t);
  for (const [action, input] of [
    [['create'], {name: 'Missing prefix'}], [['create'], {reference_prefix: 'CLI'}],
    ...[{}, {type: 'team'}, {line: true}, {children: []}, {reference_prefix: null}, {reference_prefix: ''}, {parent_id: 123}, {parent_id: ''}].map(input => [['edit', 'CLI'], input]),
  ]) {
    const result = await run(dir, ['workspace', ...action, '--input', '-', '--json'], {input: JSON.stringify(input)});
    assert.equal(result.code, 1, JSON.stringify(input));
  }
  const conflicting = await run(dir, ['workspace', 'edit', 'CLI', '--prefix', 'NEW', '--input', '-', '--json'], {input: '{"reference_prefix":"OTHER"}'});
  assert.equal(conflicting.code, 1);
  assert.match(conflicting.stderr, /either --input/);
  const deleted = await run(dir, ['workspace', 'delete', 'CLI', '--yes', '--json']);
  assert.equal(deleted.code, 1);
  const list = await run(dir, ['workspace', 'list', '--per-page', '201', '--json']);
  assert.equal(list.code, 1);
  assert.equal(requests.length, 0);
});

test('workspace lists follow cursors and filter hierarchy/type while retaining metadata and embedded limits', async t => {
  const {dir, requests} = await setup(t, req => {
    const query = new URL(req.url, 'https://example.test').searchParams;
    return query.has('after') ? {records: [{...workspace, id: '2'}], pagination: {has_more: false, next_cursor: null}} : {records: [{...workspace, children: {records: [], has_more: true}}], pagination: {has_more: true, next_cursor: 'next'}};
  });
  const result = await run(dir, ['workspace', 'list', '--filters', '{"eq[type]":"team","eq[parent.id]":"123"}', '--fields', 'id,reference_prefix,type,parent,children', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).map(r => r.id), [workspace.id, '2']);
  assert.match(result.stderr, /children is incomplete/);
  assert.equal(requests.length, 2);
  const query = new URL(requests[1].url, 'https://example.test').searchParams;
  assert.equal(query.get('after'), 'next');
  assert.equal(query.get('filter.eq[type]'), 'team');
  assert.equal(query.get('filter.eq[parent.id]'), '123');
  assert.equal(query.get('fields'), 'id,reference_prefix,type,parent,children');
});

test('workspace view shows context and propagates permission and missing-record errors', async t => {
  const {dir} = await setup(t, req => req.url.includes('/MISSING?') ? {status: 404, error: 'Not found'} : req.method === 'PUT' ? {status: 403, error: 'Cannot change parent'} : {record: workspace});
  const result = await run(dir, ['workspace', 'view', 'CLI']);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /CLI: CLI workspace/);
  assert.match(result.stdout, /Type: product/);
  assert.match(result.stdout, /Parent: LINE/);
  const missing = await run(dir, ['workspace', 'view', 'MISSING', '--json']);
  assert.equal(missing.code, 1);
  assert.match(missing.stderr, /404/);
  const forbidden = await run(dir, ['workspace', 'edit', 'CLI', '--parent', '123', '--json']);
  assert.equal(forbidden.code, 1);
  assert.match(forbidden.stderr, /403/);
  assert.equal(forbidden.stdout, '');
});
