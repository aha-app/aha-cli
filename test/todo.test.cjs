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

test('edit sends only the supplied fields and outputs a JSON record', async t => {
  const { dir, requests } = await setup(t, () => ({
    record: { ...todo, name: 'New title' },
  }));
  const result = await run(dir, [
    'todo:edit',
    'DEMO-TODO-1',
    '--title',
    'New title',
    '--json',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).name, 'New title');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'PUT');
  assert.deepEqual(requests[0].body, { record: { name: 'New title' } });
});

test('edit can clear the description, due date, and parent without touching assignments', async t => {
  const { dir, requests } = await setup(t, () => ({ record: todo }));
  const result = await run(dir, [
    'todo',
    'edit',
    '123',
    '--body=',
    '--clear-due',
    '--clear-record',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests[0].body, {
    record: {
      description: '<p></p>',
      due_date: null,
      record_id: null,
      record_type: null,
    },
  });
});

test('edit patches specific assignments without replacing or resetting omitted assignees', async t => {
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me' ? { user: { id: '111' } } : { record: todo }
  );
  const result = await run(dir, [
    'todo',
    'edit',
    '123',
    '--add-assignee',
    '222,222',
    '--remove-assignee',
    '@me',
    '--record',
    '456',
    '--record-type',
    'requirement',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests[1].body, {
    record: {
      record_id: '456',
      record_type: 'requirement',
      assigned_to: [
        { id: '222', type: 'user' },
        { id: '111', type: 'user', _destroy: true },
      ],
    },
  });
  assert.equal(requests.length, 2);
});

test('assignment conflicts resolved through @me do not reach the write API', async t => {
  const { dir, requests } = await setup(t, () => ({ user: { id: '111' } }));
  const result = await run(dir, [
    'todo',
    'edit',
    '123',
    '--add-assignee',
    '@me',
    '--remove-assignee',
    '111',
  ]);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Cannot add and remove/);
  assert.equal(requests.length, 1);
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

test('edit with --clear-record=false preserves the parent record', async t => {
  const { dir, requests } = await setup(t, () => ({ record: todo }));
  const result = await run(dir, [
    'todo',
    'edit',
    '123',
    '--title',
    'New title',
    '--clear-record=false',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests.find(request => request.method === 'PUT').body, {
    record: { name: 'New title' },
  });
});

test('complete and reopen JSON return records, including an already-completed record', async t => {
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : req.method === 'PUT'
      ? { record: { ...todo, status: 'pending' } }
      : { record: todo }
  );
  const completed = await run(dir, ['todo', 'complete', '123', '--json']);
  assert.equal(completed.code, 0, completed.stderr);
  assert.deepEqual(JSON.parse(completed.stdout), todo);
  assert.equal(requests.length, 2);
  const reopened = await run(dir, ['todo', 'reopen', '123', '--json']);
  assert.equal(reopened.code, 0, reopened.stderr);
  assert.equal(JSON.parse(reopened.stdout).status, 'pending');
  assert.equal(requests[4].body.record.assigned_to[0].status, 'pending');
});

test('invalid edits, list options, assignees, and parent combinations fail before API calls', async t => {
  const { dir, requests } = await setup(t);
  assert.match(
    (await run(dir, ['todo', 'edit', '123'])).stderr,
    /at least one edit/
  );
  assert.match(
    (await run(dir, ['todo', 'edit', '123', '--due', '2026-02-30'])).stderr,
    /valid date/
  );
  assert.match(
    (
      await run(dir, [
        'todo',
        'edit',
        '123',
        '--due',
        '2026-11-01',
        '--clear-due',
      ])
    ).stderr,
    /either --due/
  );
  assert.match(
    (await run(dir, ['todo', 'edit', '123', '--record', 'DEMO-1'])).stderr,
    /provided together/
  );
  assert.match(
    (
      await run(dir, [
        'todo',
        'edit',
        '123',
        '--record',
        'DEMO-1',
        '--record-type',
        'feature',
        '--clear-record',
      ])
    ).stderr,
    /either --record/
  );
  assert.match(
    (await run(dir, ['todo', 'create', '-t', 'x', '--assignee', 'bad'])).stderr,
    /numeric user IDs/
  );
  assert.match(
    (
      await run(dir, [
        'todo',
        'create',
        '-t',
        'x',
        '--assignee',
        '@me',
        '--unassigned',
      ])
    ).stderr,
    /either --assignee/
  );
  assert.match(
    (await run(dir, ['todo', 'list', '--state', 'closed'])).stderr,
    /pending, completed, or all/
  );
  assert.match(
    (await run(dir, ['todo', 'list', '--search='])).stderr,
    /nonempty/
  );
  assert.match((await run(dir, ['todo', 'view', '../me'])).stderr, /Usage/);
  assert.equal(requests.length, 0);
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
