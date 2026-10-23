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
