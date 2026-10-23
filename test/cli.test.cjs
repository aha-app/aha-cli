const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { setup, run } = require('./helpers.cjs');

test('space-separated create assigns a standalone to-do to the current user', async t => {
  const { dir, requests } = await setup(t);
  const result = await run(dir, [
    'todo',
    'create',
    '-t',
    'Review notes',
    '-b',
    'A < B & C\nNext line',
    '--due',
    '2028-02-29',
    '-s',
    'local',
  ]);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /https:\/\/example.test\/tasks\/99/);
  assert.deepEqual(requests, [
    {
      method: 'GET',
      url: '/api/v1/me',
      auth: 'Bearer test-key',
      body: undefined,
    },
    {
      method: 'POST',
      url: '/api/v3/tasks',
      auth: 'Bearer test-key',
      body: {
        record: {
          name: 'Review notes',
          description: '<p>A &lt; B &amp; C<br>Next line</p>',
          assigned_to: [{ id: '1234567890123456789', type: 'user' }],
          due_date: '2028-02-29',
        },
      },
    },
  ]);
});

test('colon-separated create supports a minimal to-do', async t => {
  const { dir, requests } = await setup(t);
  const result = await run(dir, ['todo:create', '--title=Review notes']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(requests[1].body.record, {
    name: 'Review notes',
    description: '<p></p>',
    assigned_to: [{ id: '1234567890123456789', type: 'user' }],
  });
});

test('existing auth and extension commands support both formats and identical help', async t => {
  const { dir, requests } = await setup(t);
  assert.equal((await run(dir, ['auth', 'check'])).code, 0);
  assert.equal((await run(dir, ['auth:check'])).code, 0);
  const spaced = await run(dir, ['extension', 'build', '--help']);
  const colon = await run(dir, ['extension:build', '--help']);
  assert.equal(spaced.code, 0);
  assert.equal(colon.code, 0);
  assert.equal(spaced.stdout, colon.stdout);
  assert.match(spaced.stdout, /aha extension build/);
  assert.equal(requests.length, 2);
});

test('invalid input fails before any API requests', async t => {
  const { dir, requests } = await setup(t);
  assert.match(
    (await run(dir, ['todo', 'create'])).stderr,
    /title is required/
  );
  assert.match(
    (await run(dir, ['todo', 'create', '-t', '   '])).stderr,
    /title is required/
  );
  assert.match(
    (await run(dir, ['todo', 'create', '-t', 'x', '--due', '2026-02-29']))
      .stderr,
    /valid date/
  );
  assert.match(
    (await run(dir, ['todo', 'create', '-t', 'x', '--due', 'tomorrow'])).stderr,
    /valid date/
  );
  assert.match(
    (await run(dir, ['todo', 'create', '-t', 'x', '--typo', 'value'])).stderr,
    /Unexpected arguments/
  );
  assert.match(
    (await run(dir, ['todo', 'create', '--title', '--due', '2026-11-01']))
      .stderr,
    /requires a value/
  );
  assert.equal(requests.length, 0);
});

test('a failed current-user lookup never creates a to-do', async t => {
  const { dir, requests } = await setup(t, () => ({
    status: 401,
    error: 'Unauthorized',
  }));
  const result = await run(dir, ['todo', 'create', '-t', 'Review notes']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /HTTP 401/);
  assert.equal(requests.length, 1);
});

test('missing current-user identity never creates an unassigned to-do', async t => {
  const { dir, requests } = await setup(t, () => ({ user: {} }));
  const result = await run(dir, ['todo', 'create', '-t', 'Review notes']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Could not determine/);
  assert.equal(requests.length, 1);
});

test('create failures return an error without success output or a retry', async t => {
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '123' } }
      : { status: 422, error: 'Validation failed' }
  );
  const result = await run(dir, ['todo', 'create', '-t', 'Review notes']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /HTTP 422/);
  assert.doesNotMatch(result.stdout, /Created/);
  assert.equal(requests.length, 2);
});

test('API key login verifies and saves credentials without printing the key', async t => {
  const { dir } = await setup(t);
  const result = await run(
    dir,
    [
      'auth',
      'login',
      '--with-token',
      '--url',
      'https://new-account.ahalocalhost.com:3080/',
    ],
    {
      input: 'secret-test-key\n',
      response: { body: { user: { email: 'me@example.test' } } },
    }
  );
  assert.equal(result.code, 0, result.stderr);
  assert.match(
    result.stdout,
    /Logged in to https:\/\/new-account.ahalocalhost.com:3080/
  );
  assert.doesNotMatch(result.stdout + result.stderr, /secret-test-key/);
  const saved = await readFile(join(dir, '.netrc'), 'utf8');
  assert.match(saved, /token secret-test-key/);
  assert.match(saved, /url https:\/\/new-account.ahalocalhost.com:3080/);
});

test('API key login preserves credentials when a default or explicit alias belongs to another origin', async t => {
  const { dir } = await setup(t);
  const authenticate = (url, flags = []) =>
    run(dir, ['auth:login', '--with-token', '--url', url, ...flags], {
      input: 'new-test-key',
      response: { body: { user: { email: 'me@example.test' } } },
    });
  const first = await authenticate('https://acme.aha.io');
  assert.equal(first.code, 0, first.stderr);
  const before = await readFile(join(dir, '.netrc'), 'utf8');
  for (const [url, flags] of [
    ['https://acme.ahalocalhost.com:3080', []],
    ['https://acme.aha.io:3080', []],
    ['https://acme.ahalocalhost.com:3080', ['--subdomain', 'acme']],
  ]) {
    const result = await authenticate(url, flags);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Use --subdomain with a different alias/);
    assert.doesNotMatch(result.stdout + result.stderr, /new-test-key/);
    assert.equal(await readFile(join(dir, '.netrc'), 'utf8'), before);
  }
  const separate = await authenticate('https://acme.ahalocalhost.com:3080', [
    '--subdomain',
    'acme-local',
  ]);
  assert.equal(separate.code, 0, separate.stderr);
  const saved = await readFile(join(dir, '.netrc'), 'utf8');
  assert.match(saved, /machine acme\s/);
  assert.match(saved, /url https:\/\/acme\.aha\.io/);
  assert.match(saved, /machine acme-local\s/);
  assert.match(saved, /url https:\/\/acme\.ahalocalhost\.com:3080/);
});

test('API key login can refresh credentials for the same normalized origin', async t => {
  const { dir } = await setup(t);
  for (const [url, token] of [
    ['https://acme.aha.io', 'old-test-key'],
    ['https://ACME.aha.io:443/', 'replacement-test-key'],
  ]) {
    const result = await run(
      dir,
      ['auth:login', '--with-token', '--url', url],
      {
        input: token,
        response: { body: { user: { email: 'me@example.test' } } },
      }
    );
    assert.equal(result.code, 0, result.stderr);
  }
  const saved = await readFile(join(dir, '.netrc'), 'utf8');
  assert.match(saved, /token replacement-test-key/);
  assert.doesNotMatch(saved, /old-test-key/);
  assert.equal((saved.match(/machine acme\s/g) || []).length, 1);
});

test('API key login leaves credentials unchanged when authentication fails', async t => {
  const { dir } = await setup(t);
  const before = await readFile(join(dir, '.netrc'), 'utf8');
  const result = await run(
    dir,
    ['auth:login', '--with-token', '--url', 'https://local.aha.io'],
    {
      input: 'bad-test-key',
      response: { status: 401, body: { error: 'Unauthorized' } },
    }
  );
  assert.equal(result.code, 1);
  assert.equal(await readFile(join(dir, '.netrc'), 'utf8'), before);
});

test('API key login rejects missing keys and unsafe or ambiguous URLs', async t => {
  const { dir } = await setup(t);
  assert.match(
    (await run(dir, ['auth', 'login', '--with-token'])).stderr,
    /requires --url/
  );
  assert.match(
    (
      await run(
        dir,
        ['auth', 'login', '--with-token', '--url', 'http://local.aha.io'],
        { input: 'key' }
      )
    ).stderr,
    /HTTPS instance URL/
  );
  assert.match(
    (
      await run(
        dir,
        ['auth', 'login', '--with-token', '--url', 'https://local.aha.io/path'],
        { input: 'key' }
      )
    ).stderr,
    /HTTPS instance URL/
  );
  assert.match(
    (
      await run(dir, [
        'auth',
        'login',
        '--with-token',
        '--url',
        'https://local.aha.io',
      ])
    ).stderr,
    /single API key/
  );
  assert.match(
    (await run(dir, ['auth', 'login', '--url', 'https://local.aha.io'])).stderr,
    /requires --with-token/
  );
});

test('list uses v3 assignee filters and follows opaque cursors through every page', async t => {
  const { dir, requests } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '111' } };
    const url = new URL(req.url, 'http://localhost');
    assert.equal(url.pathname, '/api/v3/tasks');
    assert.equal(
      url.searchParams.get('fields'),
      'id,reference_num,name,due_date,assigned_to'
    );
    assert.equal(url.searchParams.get('filter.eq[type]'), 'task');
    assert.equal(url.searchParams.get('filter.eq[assigned_to.id]'), '111');
    assert.equal(url.searchParams.get('filter.eq[assigned_to.type]'), 'user');
    assert.equal(
      url.searchParams.get('filter.eq[assigned_to.status]'),
      'pending'
    );
    assert.equal(url.searchParams.get('per_page'), '100');
    const next = url.searchParams.get('after');
    if (next) assert.equal(next, 'opaque+cursor/=');
    return {
      records: next
        ? [
            {
              id: '456',
              name: 'Follow up\nwith team',
              due_date: null,
              assigned_to: {
                records: [{ id: '111', type: 'user', status: 'pending' }],
                has_more: false,
              },
            },
          ]
        : [
            {
              id: '123',
              reference_num: 'PERSONAL-TODO-1',
              name: 'Review notes',
              due_date: '2026-11-01',
              assigned_to: {
                records: [{ id: '111', type: 'user', status: 'pending' }],
                has_more: false,
              },
            },
          ],
      pagination: {
        has_more: !next,
        next_cursor: next ? null : 'opaque+cursor/=',
      },
    };
  });
  const result = await run(dir, ['todo', 'list', '-s', 'local']);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /ID\s+DUE\s+STATE\s+TITLE/);
  assert.match(
    result.stdout,
    /PERSONAL-TODO-1\s+2026-11-01\s+pending\s+Review notes/
  );
  assert.match(result.stdout, /456\s+—\s+pending\s+Follow up with team/);
  assert.equal(requests.length, 3);
  assert.equal(requests[1].method, 'GET');
  assert.equal(requests[2].method, 'GET');
});

test('colon-separated list explains when there are no pending to-dos', async t => {
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : { records: [], pagination: { has_more: false, next_cursor: null } }
  );
  const result = await run(dir, ['todo:list']);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /No pending to-dos/);
  assert.equal(requests.length, 2);
});

test('list fails without printing an incomplete list when a later page fails', async t => {
  const { dir } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : !new URL(req.url, 'http://localhost').searchParams.has('after')
      ? {
          records: [
            {
              id: '123',
              name: 'Review notes',
              assigned_to: {
                records: [{ id: '111', type: 'user', status: 'pending' }],
                has_more: false,
              },
            },
          ],
          pagination: { has_more: true, next_cursor: 'next-page' },
        }
      : { status: 500, error: 'Server error' }
  );
  const result = await run(dir, ['todo', 'list']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /HTTP 500/);
  assert.equal(result.stdout, '');
});

test('v3 list checks my assignment rather than another assignee and still follows cursors', async t => {
  const { dir, requests } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '111' } };
    const after = new URL(req.url, 'http://localhost').searchParams.get(
      'after'
    );
    return {
      records: after
        ? [
            {
              id: '456',
              name: 'My pending task',
              assigned_to: {
                records: [{ id: '111', type: 'user', status: 'pending' }],
                has_more: false,
              },
            },
          ]
        : [
            {
              id: '123',
              name: 'My completed task',
              assigned_to: {
                records: [
                  { id: '111', type: 'user', status: 'completed' },
                  { id: '222', type: 'user', status: 'pending' },
                ],
                has_more: false,
              },
            },
            {
              id: '124',
              name: 'Project assignment',
              assigned_to: {
                records: [
                  { id: '111', type: 'project', status: 'pending' },
                  { id: '222', type: 'user', status: 'pending' },
                ],
                has_more: false,
              },
            },
          ],
      pagination: { has_more: !after, next_cursor: after ? null : 'page-two' },
    };
  });
  const result = await run(dir, ['todo', 'list']);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /My pending task/);
  assert.doesNotMatch(result.stdout, /My completed task|Project assignment/);
  assert.equal(requests.length, 3);
});

test('list refuses an invalid fallback response instead of silently omitting a task', async t => {
  const { dir } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : {
          records: [
            {
              id: '123',
              name: 'Many assignees',
              assigned_to: {
                records: [{ id: '222', type: 'user', status: 'pending' }],
                has_more: true,
              },
            },
          ],
          pagination: { has_more: false, next_cursor: null },
        }
  );
  const result = await run(dir, ['todo', 'list']);
  assert.equal(result.code, 1);
  assert.match(
    result.stderr,
    /Could not retrieve the full to-do assignment list/
  );
  assert.equal(result.stdout, '');
});

test('v3 list rejects a repeated cursor rather than looping or showing a partial list', async t => {
  const { dir, requests } = await setup(t, req =>
    req.url === '/api/v1/me'
      ? { user: { id: '111' } }
      : {
          records: [],
          pagination: { has_more: true, next_cursor: 'same-cursor' },
        }
  );
  const result = await run(dir, ['todo', 'list']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /invalid pagination cursor/);
  assert.equal(result.stdout, '');
  assert.equal(requests.length, 3);
});
