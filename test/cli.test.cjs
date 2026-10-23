const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { setup, run } = require('./helpers.cjs');

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
