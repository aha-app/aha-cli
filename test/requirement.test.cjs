const { test } = require('node:test');
const assert = require('node:assert/strict');
const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const { setup, run } = require('./helpers.cjs');

const requirement = {
  id: '7702173770823077592', reference_num: 'CLI-12', name: 'CLI requirement',
  html_url: 'https://example.test/requirements/CLI-12',
};

test('requirement create resolves friendly feature references through v3 and preserves string IDs', async t => {
  const { dir, requests } = await setup(t, req => {
    if (req.url.startsWith('/api/v3/features/CLI-12')) return { record: { id: '7702173770823077591' } };
    return { record: requirement };
  });
  const result = await run(dir, ['requirement', 'create', '--feature', 'CLI-12', '--title', ' CLI requirement ', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), requirement);
  assert.deepEqual(requests.map(r => r.method), ['GET', 'POST']);
  assert.deepEqual(requests[1].body, { record: { feature_id: '7702173770823077591', name: 'CLI requirement' } });
  assert.ok(requests.every(r => r.url.startsWith('/api/v3/')));
});

test('structured requirement creation supports full writable fields and file input', async t => {
  const { dir, requests } = await setup(t, () => ({ record: requirement }));
  const input = { name: 'Details', feature_id: '123', description: '<p>HTML</p>', position: 1, initial_estimate: 5, detailed_estimate: 8, remaining_estimate: 3, work_done: 1, tags: [{ name: 'CLI' }], custom_fields: { test_value: 'Example' }, team_id: '789', team_status_id: '456', iteration_id: '111' };
  await writeFile(join(dir, 'requirement.json'), JSON.stringify(input));
  const result = await run(dir, ['requirement:create', '--input', join(dir, 'requirement.json'), '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests[0].body, { record: input });
});

test('requirement edit sends only requested changes and server collection patches', async t => {
  const { dir, requests } = await setup(t, () => ({ record: requirement }));
  const patch = { assigned_to_user_id: null, tags: [{ id: '5', _destroy: true }], description: '', start_date: null };
  const result = await run(dir, ['requirement', 'edit', 'CLI-12', '--input', '-', '--json'], { input: JSON.stringify(patch) });
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests.map(r => r.method), ['PUT']);
  assert.deepEqual(requests[0].body, { record: patch });
  assert.ok(requests[0].url.startsWith('/api/v3/requirements/CLI-12?'));
});

test('owner @me is the documented v1 exception, while the requirement write uses v3', async t => {
  const { dir, requests } = await setup(t, req => req.url === '/api/v1/me' ? { user: { id: '123' } } : { record: requirement });
  const result = await run(dir, ['requirement', 'edit', 'CLI-12', '--owner', '@me', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests.map(r => r.url.split('?')[0]), ['/api/v1/me', '/api/v3/requirements/CLI-12']);
  assert.deepEqual(requests[1].body, { record: { assigned_to_user_id: '123' } });
});

test('v3 reference resolution failure prevents writes and does not retry through v1', async t => {
  const { dir, requests } = await setup(t, () => ({ status: 403, error: 'Not permitted' }));
  const result = await run(dir, ['requirement', 'edit', 'CLI-12', '--feature', 'CLI-13', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /403.*Not permitted/);
  assert.equal(requests.length, 1);
  assert.ok(requests[0].url.startsWith('/api/v3/features/CLI-13'));
});

test('invalid requirement input fails before any API request', async t => {
  const { dir, requests } = await setup(t);
  const cases = [
    { args: ['create', '--title', 'Test'], pattern: /requires --feature/ },
    { args: ['create', '--feature', '123', '--title', ''], pattern: /nonempty title/ },
    { args: ['edit', 'CLI-12-1'], pattern: /at least one/ },
    { args: ['edit', 'CLI-12-1', '--start-date', '2026-02-30'], pattern: /real date/ },
    { args: ['edit', 'CLI-12-1', '--status', 'In progress'], pattern: /string ID/ },
    { args: ['edit', 'CLI-12-1', '--input', '-'], input: '{"feature_id":7702173770823077592}', pattern: /must be a string/ },
    { args: ['edit', 'CLI-12-1', '--input', '-'], input: '{"feature_id":null}', pattern: /must belong/ },
    { args: ['edit', 'CLI-12-1', '--input', '-'], input: '{"release_id":"123"}', pattern: /read-only/ },
    { args: ['edit', 'CLI-12-1', '--input', '-'], input: '{"record":{"name":"Test"}}', pattern: /read-only.*record/ },
    { args: ['edit', 'CLI-12-1', '--input', '-'], input: '[]', pattern: /JSON object/ },
    { args: ['edit', 'CLI-12-1', '--title', 'A', '--input', '-'], input: '{"name":"B"}', pattern: /not both/ },
    { args: ['view'], pattern: /Usage/ },
    { args: ['list', '--filters', '[]'], pattern: /JSON object/ },
    { args: ['list', '--descending'], pattern: /requires --sort/ },
    { args: ['list', '--per-page', '201'], pattern: /1 and 200/ },
  ];
  for (const item of cases) {
    const result = await run(dir, ['requirement', ...item.args, '--json'], { input: item.input || '' });
    assert.equal(result.code, 1, item.args.join(' '));
    assert.match(result.stderr, item.pattern);
  }
  assert.equal(requests.length, 0);
});

test('requirement list follows opaque cursors and retains filters and field selections', async t => {
  let page = 0;
  const { dir, requests } = await setup(t, () => ++page === 1
    ? { records: [requirement], pagination: { has_more: true, next_cursor: 'opaque+/= value' } }
    : { records: [{ ...requirement, id: '2', reference_num: 'CLI-13' }], pagination: { has_more: false, next_cursor: null } });
  const result = await run(dir, ['requirement', 'list', '--feature', '123', '--search', 'CLI', '--fields', 'id,name', '--filters', '{"eq[status.id]":"456"}', '--json']);
  assert.equal(result.code, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.ok(Array.isArray(output));
  assert.equal(output.length, 2);
  assert.equal(output[0].id, requirement.id);
  assert.equal(requests.length, 2);
  const query = new URL(requests[1].url, 'https://example.test').searchParams;
  assert.equal(query.get('after'), 'opaque+/= value');
  assert.equal(query.get('feature_id'), '123');
  assert.equal(query.get('filter.contains[name]'), 'CLI');
  assert.equal(query.get('filter.eq[status.id]'), '456');
  assert.equal(query.get('fields'), 'id,name');
});

test('JSON lists remain arrays while truncation and capped collections warn on stderr', async t => {
  const { dir } = await setup(t, () => ({ records: [{ ...requirement, requirements: { records: [], has_more: true } }], pagination: { has_more: false, next_cursor: null, truncated: true, truncated_message: 'Sorted results are limited.' } }));
  const result = await run(dir, ['requirement', 'list', '--sort', 'name', '--json']);
  assert.equal(result.code, 0);
  assert.ok(Array.isArray(JSON.parse(result.stdout)));
  assert.equal(JSON.parse(result.stdout)[0].requirements.has_more, true);
  assert.match(result.stderr, /Sorted results are limited/);
  assert.match(result.stderr, /requirements.*incomplete/);
});

test('invalid or repeated pagination cursors fail without presenting partial JSON as complete', async t => {
  const { dir, requests } = await setup(t, () => ({ records: [requirement], pagination: { has_more: true, next_cursor: 'repeat' } }));
  const result = await run(dir, ['requirement', 'list', '--json']);
  assert.equal(result.code, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /invalid pagination cursor/);
  assert.equal(requests.length, 2);
});

test('requirement view selects fields and reports not-found errors without v1 fallback', async t => {
  const { dir, requests } = await setup(t, () => ({ status: 404, error: 'Requirement not found' }));
  const result = await run(dir, ['requirement:view', 'CLI-999', '--fields', 'id,name', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /404.*Requirement not found/);
  assert.equal(requests.length, 1);
  assert.equal(new URL(requests[0].url, 'https://example.test').searchParams.get('fields'), 'id,name');
});

test('requirement delete requires confirmation before API calls and accepts explicit --yes', async t => {
  const { dir, requests } = await setup(t, req => req.method === 'DELETE' ? {} : { record: requirement });
  const denied = await run(dir, ['requirement', 'delete', 'CLI-12', '--json']);
  assert.equal(denied.code, 1);
  assert.match(denied.stderr, /--yes/);
  assert.equal(requests.length, 0);
  const result = await run(dir, ['requirement', 'delete', 'CLI-12', '--yes', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { id: requirement.id, deleted: true });
  assert.deepEqual(requests.map(r => r.method), ['GET', 'DELETE']);
  assert.equal(requests[1].url, '/api/v3/requirements/' + requirement.id);
});

test('interactive cancellation prevents deletion, including --yes=false', async t => {
  const { dir, requests } = await setup(t, () => ({ record: requirement }));
  const result = await run(dir, ['requirement', 'delete', 'CLI-12', '--yes=false'], { confirm: false });
  assert.equal(result.code, 0);
  assert.match(result.stdout, /canceled/);
  assert.deepEqual(requests.map(r => r.method), ['GET']);
});

test('requirement validation errors do not print success or retry mutations', async t => {
  const { dir, requests } = await setup(t, () => ({ status: 422, errors: ['Invalid feature'] }));
  const result = await run(dir, ['requirement', 'create', '--feature', '123', '--title', 'Test', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /422.*Invalid feature/);
  assert.equal(result.stdout, '');
  assert.equal(requests.length, 1);
});

test('noninteractive requirement commands require an account when several are saved, even without JSON', async t => {
  const { dir, requests } = await setup(t);
  await writeFile(join(dir, '.netrc'), 'machine first\n  type aha\n  token test-key\n  url http://127.0.0.1:1\nmachine second\n  type aha\n  token test-key-2\n  url http://127.0.0.1:2\n');
  const result = await run(dir, ['requirement', 'view', 'CLI-12']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /--subdomain/);
  assert.equal(result.stdout, '');
  assert.equal(requests.length, 0);
});

test('requirement position is a numeric integer and rejects imprecise values', async t => {
 const {dir, requests} = await setup(t, () => ({record: requirement}));
 const good = await run(dir, ['requirement','edit','CLI-12-1','--position','2','--json']);
 assert.equal(good.code, 0, good.stderr);
 assert.equal(requests[0].body.record.position, 2);
 for (const value of ['top','1.2','9007199254740993']) {
  const result = await run(dir, ['requirement','edit','CLI-12-1','--position',value,'--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /integer/);
 }
 assert.equal(requests.length, 1);
});
