const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');
const phase = { id: '7702173770823077592', reference_num: 'CLI-P-1', name: 'Build', type: 'phase', release: {id: '7702173770823077591', reference_num: 'CLI-R-1'}, html_url: 'https://example.test/release_phases/CLI-P-1' };

test('release phase creation resolves release references and preserves the full writable payload', async t => {
  const {dir, requests} = await setup(t, req => ({record: req.method === 'GET' ? phase.release : phase}));
  const input = {name: 'Build', type: 'phase', release_id: 'CLI-R-1', start_date: '2026-12-01', end_date: '2026-12-15', position: 2, color: '#336699', progress_source: 'manual', progress: 25.5, duration_source: 'manual', description: '<p>Build details</p>', custom_fields: {test: 'Value'}};
  const result = await run(dir, ['release-phase:create', '--input', '-', '--json'], {input: JSON.stringify(input)});
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), phase);
  assert.equal(requests[0].url, '/api/v3/releases/CLI-R-1?fields=id');
  assert.equal(requests[1].method, 'POST');
  assert.deepEqual(requests[1].body, {record: {...input, release_id: phase.release.id}});
});

test('phase edits send only supplied fields and convert numeric flags without losing zero', async t => {
  const {dir, requests} = await setup(t, () => ({record: phase}));
  const result = await run(dir, ['release-phase', 'edit', 'CLI-P-1', '--type', 'milestone', '--start-date', '2026-12-15', '--position', '0', '--progress', '0', '--color', '#ff8800', '--progress-source', 'manual', '--duration-source', 'manual', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(requests[0].method, 'PUT');
  assert.deepEqual(requests[0].body, {record: {type: 'milestone', start_date: '2026-12-15', position: 0, progress: 0, color: '#ff8800', progress_source: 'manual', duration_source: 'manual'}});
  const patch = {description: '<p>Updated</p>', custom_fields: {test: null}};
  const edited = await run(dir, ['release-phase', 'edit', 'CLI-P-1', '--input', '-', '--json'], {input: JSON.stringify(patch)});
  assert.equal(edited.code, 0, edited.stderr);
  assert.deepEqual(requests[1].body, {record: patch});
});

test('phase validation rejects invalid types, associations and metadata before API access', async t => {
  const {dir, requests} = await setup(t);
  for (const [action, input] of [
    [['create'], {name: 'Build', type: 'phase'}],
    [['create'], {name: 'Build', release_id: '123'}],
    [['create'], {name: 'Build', release_id: null, type: 'phase'}],
    ...[{}, {release_id: '123'}, {type: 'release'}, {type: ['phase']}, {type: null}, {start_date: '2026-02-30'}, {end_date: 'tomorrow'}, {position: 1.5}, {position: '2'}, {progress: '25'}, {progress_source: ['manual']}, {duration_source: 'automatic'}, {color: 123}, {features: []}].map(input => [['edit', 'CLI-P-1'], input]),
  ]) {
    const result = await run(dir, ['release-phase', ...action, '--input', '-', '--json'], {input: JSON.stringify(input)});
    assert.equal(result.code, 1, JSON.stringify(input));
  }
  for (const flags of [['--position', '1.5'], ['--progress', 'NaN'], ['--progress', 'Infinity']]) {
    const result = await run(dir, ['release-phase', 'edit', 'CLI-P-1', ...flags, '--json']);
    assert.equal(result.code, 1);
  }
  const conflict = await run(dir, ['release-phase', 'edit', 'CLI-P-1', '--progress', '10', '--input', '-', '--json'], {input: '{"progress":20}'});
  assert.equal(conflict.code, 1);
  assert.match(conflict.stderr, /either --input/);
  assert.equal(requests.length, 0);
});

test('phase lists scope to a release and pass through type filters and field selection', async t => {
  const {dir, requests} = await setup(t, req => req.url.startsWith('/api/v3/releases/') ? {record: phase.release} : {records: [phase], pagination: {has_more: false, next_cursor: null}});
  const result = await run(dir, ['release-phase', 'list', '--release', 'CLI-R-1', '--filters', '{"eq[type]":"milestone"}', '--fields', 'id,name,type', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [phase]);
  const query = new URL(requests[1].url, 'https://example.test').searchParams;
  assert.equal(query.get('release_id'), phase.release.id);
  assert.equal(query.get('filter.eq[type]'), 'milestone');
  assert.equal(query.get('fields'), 'id,name,type');
});

test('phase deletion confirms and uses the resolved ID, while API errors remain actionable', async t => {
  const {dir, requests} = await setup(t, req => req.url.includes('missing') ? {status: 404, error: 'Not found'} : req.method === 'DELETE' ? {status: 403, error: 'Not permitted'} : {record: phase});
  const denied = await run(dir, ['release-phase', 'delete', 'CLI-P-1', '--json']);
  assert.equal(denied.code, 1);
  assert.equal(requests.length, 0);
  const missing = await run(dir, ['release-phase', 'view', 'CLI-missing-1', '--json']);
  assert.equal(missing.code, 1);
  assert.match(missing.stderr, /404/);
  const forbidden = await run(dir, ['release-phase', 'delete', 'CLI-P-1', '--yes', '--json']);
  assert.equal(forbidden.code, 1);
  assert.match(forbidden.stderr, /403/);
  assert.equal(forbidden.stdout, '');
  assert.equal(requests.at(-1).url, '/api/v3/release_phases/' + phase.id);
});


test('phase views preserve zero metadata and omit unavailable milestone progress', async t => {
  const {dir} = await setup(t, req => ({record: req.url.includes('CLI-P-2') ? {...phase, type: 'milestone', progress: null} : {...phase, position: 0, progress: 0}}));
  const duration = await run(dir, ['release-phase', 'view', 'CLI-P-1']);
  assert.equal(duration.code, 0, duration.stderr);
  assert.match(duration.stdout, /Position: 0/);
  assert.match(duration.stdout, /Progress: 0/);
  const milestone = await run(dir, ['release-phase', 'view', 'CLI-P-2']);
  assert.equal(milestone.code, 0, milestone.stderr);
  assert.match(milestone.stdout, /Type: milestone/);
  assert.doesNotMatch(milestone.stdout, /Progress:/);
});
