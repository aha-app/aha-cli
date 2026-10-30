const { test } = require('node:test');
const assert = require('node:assert/strict');
const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const { setup, run } = require('./helpers.cjs');

const feature = {
  id: '7702173770823077592', reference_num: 'CLI-12', name: 'CLI feature',
  html_url: 'https://example.test/features/CLI-12',
};

test('feature create resolves friendly release references through v3 and preserves string IDs', async t => {
  const { dir, requests } = await setup(t, req => {
    if (req.url.startsWith('/api/v3/releases/CLI-R-1')) return { record: { id: '7702173770823077591' } };
    return { record: feature };
  });
  const result = await run(dir, ['feature', 'create', '--release', 'CLI-R-1', '--title', ' CLI feature ', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), feature);
  assert.deepEqual(requests.map(r => r.method), ['GET', 'POST']);
  assert.deepEqual(requests[1].body, { record: { release_id: '7702173770823077591', name: 'CLI feature' } });
  assert.ok(requests.every(r => r.url.startsWith('/api/v3/')));
});

test('workspace creation and input expose estimates, collections and custom fields without replacing other associations', async t => {
  const { dir, requests } = await setup(t, () => ({ record: feature }));
  const input = {
    name: 'Detailed feature', project_id: '123', description: '<p>Description</p>',
    initial_estimate: 5, detailed_estimate: 8, remaining_estimate: 3,
    tags: [{ name: 'CLI' }], goals: [{ reference_num: 'CLI-G-1' }],
    key_results: [{ reference_num: 'CLI-KR-1' }],
    custom_fields: { test_value: 'Example' },
  };
  await writeFile(join(dir, 'feature.json'), JSON.stringify(input));
  const result = await run(dir, ['feature:create', '--input', join(dir, 'feature.json'), '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests[0].body, { record: input });
  assert.equal(requests.length, 1);
});

test('feature edit sends only requested changes and server collection patches', async t => {
  const { dir, requests } = await setup(t, () => ({ record: feature }));
  const patch = { assigned_to_user_id: null, tags: [{ id: '5', _destroy: true }], goals: [{ reference_num: 'CLI-G-2' }], description: '', start_date: null };
  const result = await run(dir, ['feature', 'edit', 'CLI-12', '--input', '-', '--json'], { input: JSON.stringify(patch) });
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests.map(r => r.method), ['PUT']);
  assert.deepEqual(requests[0].body, { record: patch });
  assert.ok(requests[0].url.startsWith('/api/v3/features/CLI-12?'));
});

test('owner @me is the documented v1 exception, while the feature write uses v3', async t => {
  const { dir, requests } = await setup(t, req => req.url === '/api/v1/me' ? { user: { id: '123' } } : { record: feature });
  const result = await run(dir, ['feature', 'edit', 'CLI-12', '--owner', '@me', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests.map(r => r.url.split('?')[0]), ['/api/v1/me', '/api/v3/features/CLI-12']);
  assert.deepEqual(requests[1].body, { record: { assigned_to_user_id: '123' } });
});

test('v3 reference resolution failure prevents writes and does not retry through v1', async t => {
  const { dir, requests } = await setup(t, () => ({ status: 403, error: 'Not permitted' }));
  const result = await run(dir, ['feature', 'edit', 'CLI-12', '--release', 'CLI-R-2', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /403.*Not permitted/);
  assert.equal(requests.length, 1);
  assert.ok(requests[0].url.startsWith('/api/v3/releases/CLI-R-2'));
});

test('invalid feature input fails before any API request', async t => {
  const { dir, requests } = await setup(t);
  const cases = [
    { args: ['create', '--title', 'Test'], pattern: /workspace.*release/ },
    { args: ['create', '--workspace', '123', '--release', '456', '--title', 'Test'], pattern: /exactly one/ },
    { args: ['create', '--workspace', '123', '--title', ''], pattern: /nonempty title/ },
    { args: ['edit', 'CLI-12'], pattern: /at least one/ },
    { args: ['edit', 'CLI-12', '--start-date', '2026-02-30'], pattern: /real date/ },
    { args: ['edit', 'CLI-12', '--status', 'In progress'], pattern: /string ID/ },
    { args: ['edit', 'CLI-12', '--input', '-'], input: '{"release_id":7702173770823077592}', pattern: /must be a string/ },
    { args: ['edit', 'CLI-12', '--input', '-'], input: '{"project_id":"123"}', pattern: /cannot be edited/ },
    { args: ['edit', 'CLI-12', '--input', '-'], input: '{"record":{"name":"Test"}}', pattern: /read-only.*record/ },
    { args: ['edit', 'CLI-12', '--input', '-'], input: '[]', pattern: /JSON object/ },
    { args: ['edit', 'CLI-12', '--title', 'A', '--input', '-'], input: '{"name":"B"}', pattern: /not both/ },
    { args: ['view'], pattern: /Usage/ },
    { args: ['list', '--filters', '[]'], pattern: /JSON object/ },
    { args: ['list', '--descending'], pattern: /requires --sort/ },
    { args: ['list', '--per-page', '201'], pattern: /1 and 200/ },
    { args: ['list', '--workspace', '123', '--release', '456'], pattern: /not both/ },
  ];
  for (const item of cases) {
    const result = await run(dir, ['feature', ...item.args, '--json'], { input: item.input || '' });
    assert.equal(result.code, 1, item.args.join(' '));
    assert.match(result.stderr, item.pattern);
  }
  assert.equal(requests.length, 0);
});

test('feature list follows opaque cursors and retains filters and field selections', async t => {
  let page = 0;
  const { dir, requests } = await setup(t, () => ++page === 1
    ? { records: [feature], pagination: { has_more: true, next_cursor: 'opaque+/= value' } }
    : { records: [{ ...feature, id: '2', reference_num: 'CLI-13' }], pagination: { has_more: false, next_cursor: null } });
  const result = await run(dir, ['feature', 'list', '--workspace', '123', '--search', 'CLI', '--fields', 'id,name', '--filters', '{"eq[status.id]":"456"}', '--json']);
  assert.equal(result.code, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.records.length, 2);
  assert.equal(output.records[0].id, feature.id);
  assert.equal(output.pagination.has_more, false);
  assert.equal(requests.length, 2);
  const query = new URL(requests[1].url, 'https://example.test').searchParams;
  assert.equal(query.get('after'), 'opaque+/= value');
  assert.equal(query.get('project_id'), '123');
  assert.equal(query.get('filter.contains[name]'), 'CLI');
  assert.equal(query.get('filter.eq[status.id]'), '456');
  assert.equal(query.get('fields'), 'id,name');
});

test('sorted truncation and capped embedded collections remain visible in JSON mode', async t => {
  const { dir } = await setup(t, () => ({ records: [{ ...feature, requirements: { records: [], has_more: true } }], pagination: { has_more: false, next_cursor: null, truncated: true, truncated_message: 'Sorted results are limited.' } }));
  const result = await run(dir, ['feature', 'list', '--sort', 'name', '--json']);
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.stdout).pagination.truncated, true);
  assert.match(result.stderr, /Sorted results are limited/);
  assert.match(result.stderr, /requirements.*incomplete/);
});

test('invalid or repeated pagination cursors fail without presenting partial JSON as complete', async t => {
  const { dir, requests } = await setup(t, () => ({ records: [feature], pagination: { has_more: true, next_cursor: 'repeat' } }));
  const result = await run(dir, ['feature', 'list', '--json']);
  assert.equal(result.code, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /invalid pagination cursor/);
  assert.equal(requests.length, 2);
});

test('feature view selects fields and reports not-found errors without v1 fallback', async t => {
  const { dir, requests } = await setup(t, () => ({ status: 404, error: 'Feature not found' }));
  const result = await run(dir, ['feature:view', 'CLI-999', '--fields', 'id,name', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /404.*Feature not found/);
  assert.equal(requests.length, 1);
  assert.equal(new URL(requests[0].url, 'https://example.test').searchParams.get('fields'), 'id,name');
});

test('feature delete requires confirmation before API calls and accepts explicit --yes', async t => {
  const { dir, requests } = await setup(t, req => req.method === 'DELETE' ? {} : { record: feature });
  const denied = await run(dir, ['feature', 'delete', 'CLI-12', '--json']);
  assert.equal(denied.code, 1);
  assert.match(denied.stderr, /--yes/);
  assert.equal(requests.length, 0);
  const result = await run(dir, ['feature', 'delete', 'CLI-12', '--yes', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { id: feature.id, deleted: true });
  assert.deepEqual(requests.map(r => r.method), ['GET', 'DELETE']);
  assert.equal(requests[1].url, '/api/v3/features/' + feature.id);
});

test('interactive cancellation prevents deletion, including --yes=false', async t => {
  const { dir, requests } = await setup(t, () => ({ record: feature }));
  const result = await run(dir, ['feature', 'delete', 'CLI-12', '--yes=false'], { confirm: false });
  assert.equal(result.code, 0);
  assert.match(result.stdout, /canceled/);
  assert.deepEqual(requests.map(r => r.method), ['GET']);
});

test('feature validation errors do not print success or retry mutations', async t => {
  const { dir, requests } = await setup(t, () => ({ status: 422, errors: ['Invalid release'] }));
  const result = await run(dir, ['feature', 'create', '--release', '123', '--title', 'Test', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /422.*Invalid release/);
  assert.equal(result.stdout, '');
  assert.equal(requests.length, 1);
});

test('noninteractive feature commands require an account when several are saved, even without JSON', async t => {
  const { dir, requests } = await setup(t);
  await writeFile(join(dir, '.netrc'), 'machine first\n  type aha\n  token test-key\n  url http://127.0.0.1:1\nmachine second\n  type aha\n  token test-key-2\n  url http://127.0.0.1:2\n');
  const result = await run(dir, ['feature', 'view', 'CLI-12']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /--subdomain/);
  assert.equal(result.stdout, '');
  assert.equal(requests.length, 0);
});
