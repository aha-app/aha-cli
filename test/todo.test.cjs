const { test } = require('node:test');
const assert = require('node:assert/strict');
const { appendFile } = require('node:fs/promises');
const { join } = require('node:path');
const { setup, run } = require('./helpers.cjs');

const todo = {
  id: '123',
  reference_num: 'DEMO-TODO-1',
  name: 'Review notes',
  type: 'task',
  html_url: 'https://example.test/tasks/DEMO-TODO-1',
  status: 'partially_complete',
  due_date: '2026-11-01',
  description: { body: '<p>A &lt; B &amp; C<br>Next line</p>' },
  record: {
    id: '456',
    type: 'feature',
    reference_num: 'DEMO-1',
    name: 'Launch',
  },
  assigned_to: {
    records: [
      { id: '111', type: 'user', name: 'Me', status: 'completed' },
      { id: '222', type: 'user', name: 'Teammate', status: 'pending' },
    ],
    has_more: false,
  },
};

test('view renders details, descriptions, parent records, and individual assignment states', async t => {
  const { dir, requests } = await setup(t, () => ({ record: todo }));
  const result = await run(dir, ['todo', 'view', 'DEMO-TODO-1']);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Status: partially_complete/);
  assert.match(result.stdout, /Due: 2026-11-01/);
  assert.match(result.stdout, /Parent: feature DEMO-1 — Launch/);
  assert.match(result.stdout, /Me \(user 111\): completed/);
  assert.match(result.stdout, /Teammate \(user 222\): pending/);
  assert.match(result.stdout, /A < B & C\nNext line/);
  assert.match(result.stdout, /https:\/\/example.test\/tasks\/DEMO-TODO-1/);
  assert.match(requests[0].url, /^\/api\/v3\/tasks\/DEMO-TODO-1\?fields=/);
  assert.equal(requests.length, 1);
});

test('view JSON returns the v3 record without prose', async t => {
  const { dir } = await setup(t, () => ({ record: todo }));
  const result = await run(dir, ['todo:view', '123', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), todo);
});

test('create can explicitly assign several users and link to a parent record', async t => {
  const { dir, requests } = await setup(t, () => ({ record: todo }));
  const result = await run(dir, [
    'todo',
    'create',
    '-t',
    'Review notes',
    '-a',
    '111,222,111',
    '--record',
    'DEMO-1',
    '--record-type',
    'feature',
    '--json',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), todo);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].body, {
    record: {
      name: 'Review notes',
      description: '<p></p>',
      record_id: 'DEMO-1',
      record_type: 'feature',
      assigned_to: [
        { id: '111', type: 'user' },
        { id: '222', type: 'user' },
      ],
    },
  });
});

test('create supports unassigned tasks without looking up the current user', async t => {
  const { dir, requests } = await setup(t, () => ({ record: todo }));
  const result = await run(dir, [
    'todo:create',
    '-t',
    'Unassigned',
    '--unassigned',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].body.record.assigned_to, []);
});

test('list all returns my pending and completed tasks as JSON and encodes title searches', async t => {
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : { records: [todo], pagination: { has_more: false, next_cursor: null } }
  );
  const result = await run(dir, [
    'todo',
    'list',
    '--state',
    'all',
    '--search',
    'A & B / C',
    '--json',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [todo]);
  const query = new URL(requests[1].url, 'http://localhost').searchParams;
  assert.equal(query.get('filter.contains[name]'), 'A & B / C');
  assert.equal(query.has('filter.eq[assigned_to.status]'), false);
  assert.equal(query.get('filter.eq[assigned_to.id]'), '111');
});

test('list completed uses my assignment status rather than the shared task status', async t => {
  const pending = {
    ...todo,
    id: '124',
    name: 'Still mine',
    assigned_to: {
      records: [
        { id: '111', type: 'user', status: 'pending' },
        { id: '222', type: 'user', status: 'completed' },
      ],
      has_more: false,
    },
  };
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : {
          records: [todo, pending],
          pagination: { has_more: false, next_cursor: null },
        }
  );
  const result = await run(dir, [
    'todo:list',
    '--state',
    'completed',
    '--json',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [todo]);
  assert.equal(
    new URL(requests[1].url, 'http://localhost').searchParams.get(
      'filter.eq[assigned_to.status]'
    ),
    'completed'
  );
});

test('empty JSON lists are arrays without the human empty-list message', async t => {
  const { dir } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : { records: [], pagination: { has_more: false, next_cursor: null } }
  );
  const result = await run(dir, ['todo', 'list', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), []);
});

test('JSON mode requires an explicit account when several accounts are saved', async t => {
  const { dir, requests } = await setup(t);
  await appendFile(
    join(dir, '.netrc'),
    'machine another\n  type aha\n  token another-test-key\n  url https://another.example.test\n'
  );
  const result = await run(dir, ['todo', 'list', '--json']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Use --subdomain/);
  assert.equal(result.stdout, '');
  assert.equal(requests.length, 0);
});
