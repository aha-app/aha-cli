const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');

const feature = { id: '999', reference_num: 'CLI-12', name: 'A title\nwith spacing', status: { name: 'In progress' } };
const todo = { id: '888', reference_num: 'PERSONAL-TODO-1', name: feature.name, assigned_to: { records: [{ id: '123', type: 'user', status: 'pending' }], has_more: false } };

test('feature and to-do JSON lists share the bare-array contract', async t => {
  const { dir } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '123' } };
    return { records: [req.url.startsWith('/api/v3/tasks') ? todo : feature], pagination: { has_more: false, next_cursor: null } };
  });
  const features = await run(dir, ['feature', 'list', '--json']);
  const todos = await run(dir, ['todo', 'list', '--json']);
  assert.equal(features.code, 0, features.stderr);
  assert.equal(todos.code, 0, todos.stderr);
  assert.deepEqual(JSON.parse(features.stdout), [feature]);
  assert.deepEqual(JSON.parse(todos.stdout), [todo]);
});

test('feature and to-do human lists share aligned headers and single-line rows', async t => {
  const { dir } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '123' } };
    return { records: [req.url.startsWith('/api/v3/tasks') ? todo : feature], pagination: { has_more: false, next_cursor: null } };
  });
  const features = await run(dir, ['feature', 'list']);
  const todos = await run(dir, ['todo', 'list']);
  assert.equal(features.code, 0, features.stderr);
  assert.equal(todos.code, 0, todos.stderr);
  const featureLines = features.stdout.trimEnd().split('\n');
  const todoLines = todos.stdout.trimEnd().split('\n');
  assert.equal(featureLines.length, 2);
  assert.equal(todoLines.length, 2);
  assert.match(featureLines[0], /^ID\s+STATE\s+TITLE$/);
  assert.match(todoLines[0], /^ID\s+DUE\s+STATE\s+TITLE$/);
  assert.equal(featureLines[0].indexOf('TITLE'), featureLines[1].indexOf('A title'));
  assert.equal(todoLines[0].indexOf('TITLE'), todoLines[1].indexOf('A title'));
  assert.match(featureLines[1], /A title with spacing$/);
  assert.match(todoLines[1], /A title with spacing$/);
});

test('feature body and short title/body flags use the existing plain-text convention', async t => {
  const { dir, requests } = await setup(t, () => ({ record: feature }));
  const result = await run(dir, ['feature', 'create', '--release', '123', '-t', 'Title', '-b', '<literal> & text\nsecond line', '--json']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(requests[0].body.record.description, '<p>&lt;literal&gt; &amp; text<br>second line</p>');
  assert.equal(requests[0].body.record.name, 'Title');
});

test('feature and to-do creates can prompt for a title only in interactive non-JSON mode', async t => {
  const { dir, requests } = await setup(t, req => req.url === '/api/v1/me' ? { user: { id: '123' } } : { record: feature });
  const features = await run(dir, ['feature', 'create', '--release', '123'], { answers: { title: 'Prompted feature' } });
  const todos = await run(dir, ['todo', 'create'], { answers: { title: 'Prompted to-do' } });
  assert.equal(features.code, 0, features.stderr);
  assert.equal(todos.code, 0, todos.stderr);
  assert.equal(requests[0].body.record.name, 'Prompted feature');
  assert.equal(requests[2].body.record.name, 'Prompted to-do');
  const before = requests.length;
  const scripted = await run(dir, ['feature', 'create', '--release', '123', '--json'], { answers: { title: 'Must not prompt' } });
  assert.equal(scripted.code, 1);
  assert.equal(requests.length, before);
});

test('feature views render readable descriptions and JSON retains the original HTML', async t => {
  const record = { ...feature, description: { body: '<p>One &amp; two</p><p>Next line</p>' } };
  const { dir } = await setup(t, () => ({ record }));
  const human = await run(dir, ['feature', 'view', 'CLI-12']);
  assert.equal(human.code, 0, human.stderr);
  assert.match(human.stdout, /One & two\nNext line/);
  assert.doesNotMatch(human.stdout, /<p>/);
  const json = await run(dir, ['feature', 'view', 'CLI-12', '--json']);
  assert.equal(json.code, 0, json.stderr);
  assert.equal(JSON.parse(json.stdout).description.body, record.description.body);
});
