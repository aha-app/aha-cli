const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');

test('create and edit accept dash-prefixed descriptions with long and short flags', async t => {
  const { dir, requests } = await setup(t);
  for (const flag of ['--body', '-b']) {
    for (const body of ['- First item\n- Second item', '--literal', '-']) {
      for (const action of ['create', 'edit']) {
        const result = await run(dir, [
          'todo',
          action,
          ...(action === 'edit' ? ['99'] : []),
          '--title',
          'Bullet list',
          flag,
          body,
        ]);
        assert.equal(result.code, 0, result.stderr);
        assert.equal(
          requests.at(-1).body.record.description,
          `<p>${body.replace(/\n/g, '<br>')}</p>`
        );
      }
    }
  }
});

test('description flags still reject missing values before recognized flags', async t => {
  const { dir, requests } = await setup(t);
  for (const args of [
    ['--body', '--due=2026-11-01'],
    ['-b', '-t', 'Title'],
    ['--body', '--clear-record'],
    ['-b', '--'],
    ['--body'],
  ]) {
    const result = await run(dir, ['todo', 'edit', '123', ...args]);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /requires a value/);
  }
  assert.equal(requests.length, 0);
});

const others = Array.from({ length: 25 }, (_, i) => ({
  id: String(200 + i),
  type: 'user',
  status: 'pending',
}));
const shared = {
  id: '123',
  name: 'Many assignees',
  reference_num: 'DEMO-TODO-1',
  assigned_to: { records: others, has_more: true },
};
const ordinary = {
  id: '456',
  name: 'Ordinary task',
  assigned_to: {
    records: [{ id: '111', type: 'user', status: 'pending' }],
    has_more: false,
  },
};
const fullAssignments = status => ({
  task: {
    assigned_to_users: [
      // The assignment ID is not the user ID; match nested user.id.
      ...others.map((item, i) => ({
        id: i === 0 ? '111' : `9${i}`,
        status: item.status,
        user: { id: item.id },
      })),
      ...(status
        ? [{ id: '999', status, user: { id: '111', name: 'Me' } }]
        : []),
    ],
  },
});

for (const state of ['pending', 'completed', 'all']) {
  test(`list ${state} resolves an assignment beyond the embedded limit`, async t => {
    const status = state === 'all' ? 'completed' : state;
    const { dir, requests } = await setup(t, req => {
      if (req.url === '/api/v1/me') return { user: { id: '111' } };
      if (req.url === '/api/v1/tasks/123?fields=assigned_to_users')
        return fullAssignments(status);
      return { records: [shared, ordinary], pagination: { has_more: false } };
    });
    const result = await run(dir, ['todo', 'list', '--state', state]);
    assert.equal(result.code, 0, result.stderr);
    assert.match(
      result.stdout,
      new RegExp(`DEMO-TODO-1\\s+—\\s+${status}\\s+Many assignees`)
    );
    if (state !== 'completed') assert.match(result.stdout, /Ordinary task/);
    assert.equal(
      requests.filter(req => req.url.startsWith('/api/v1/tasks/')).length,
      1
    );
  });
}

test('list uses the resolved user status and preserves v3 records in JSON', async t => {
  const { dir } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '111' } };
    if (req.url.startsWith('/api/v1/tasks/'))
      return fullAssignments('completed');
    return { records: [shared, ordinary], pagination: { has_more: false } };
  });
  const pending = await run(dir, ['todo', 'list', '--json']);
  assert.equal(pending.code, 0, pending.stderr);
  assert.deepEqual(JSON.parse(pending.stdout), [ordinary]);
  const all = await run(dir, ['todo', 'list', '--state', 'all', '--json']);
  assert.equal(all.code, 0, all.stderr);
  assert.deepEqual(JSON.parse(all.stdout), [shared, ordinary]);
});

for (const action of ['complete', 'reopen']) {
  test(`${action} updates only my assignment beyond the embedded limit`, async t => {
    const status = action === 'complete' ? 'completed' : 'pending';
    const before = action === 'complete' ? 'pending' : 'completed';
    const { dir, requests } = await setup(t, req => {
      if (req.url === '/api/v1/me') return { user: { id: '111' } };
      if (req.url.startsWith('/api/v1/tasks/')) return fullAssignments(before);
      return { record: shared };
    });
    const result = await run(dir, ['todo', action, 'DEMO-TODO-1', '--json']);
    assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), shared);
    assert.deepEqual(requests.at(-1).body, {
      record: { assigned_to: [{ id: '111', type: 'user', status }] },
    });
    assert.equal(requests.at(-1).method, 'PUT');
    assert.match(requests.at(-1).url, /^\/api\/v3\/tasks\/123\?/);
    assert.equal(requests.length, 4);
  });

  test(`${action} skips writes when the resolved assignment already has the requested status`, async t => {
    const { dir, requests } = await setup(t, req => {
      if (req.url === '/api/v1/me') return { user: { id: '111' } };
      if (req.url.startsWith('/api/v1/tasks/'))
        return fullAssignments(action === 'complete' ? 'completed' : 'pending');
      return { record: shared };
    });
    const result = await run(dir, ['todo', action, '123']);
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /Already/);
    assert.ok(requests.every(req => req.method === 'GET'));
  });
}

test('missing assignments are omitted from lists and cannot be completed or reopened', async t => {
  const { dir, requests } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '111' } };
    if (req.url.startsWith('/api/v1/tasks/')) return fullAssignments();
    if (req.url.startsWith('/api/v3/tasks?'))
      return { records: [shared], pagination: { has_more: false } };
    return { record: shared };
  });
  const list = await run(dir, ['todo', 'list', '--json']);
  assert.equal(list.code, 0, list.stderr);
  assert.deepEqual(JSON.parse(list.stdout), []);
  for (const action of ['complete', 'reopen']) {
    const result = await run(dir, ['todo', action, '123']);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /not assigned to you/);
  }
  assert.ok(requests.every(req => req.method === 'GET'));
});

test('fallback HTTP failures do not produce partial lists or status writes', async t => {
  const { dir, requests } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '111' } };
    if (req.url.startsWith('/api/v1/tasks/'))
      return { status: 403, error: 'Forbidden' };
    if (req.url.startsWith('/api/v3/tasks?'))
      return { records: [ordinary, shared], pagination: { has_more: false } };
    return { record: shared };
  });
  for (const args of [['list'], ['complete', '123'], ['reopen', '123']]) {
    const result = await run(dir, ['todo', ...args]);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /HTTP 403/);
    assert.equal(result.stdout, '');
  }
  assert.ok(requests.every(req => req.method === 'GET'));
});

test('a truncated collection containing my assignment needs no fallback', async t => {
  const task = {
    ...ordinary,
    assigned_to: { ...ordinary.assigned_to, has_more: true },
  };
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : { records: [task], pagination: { has_more: false } }
  );
  const result = await run(dir, ['todo', 'list', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [task]);
  assert.equal(requests.length, 2);
});
