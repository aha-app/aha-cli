const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');

const feature = { id: '999', reference_num: 'CLI-12', name: 'A title\nwith spacing', status: { name: 'In progress' } };
const requirement = { ...feature, id: '777', reference_num: 'CLI-12-1' };
const todo = { id: '888', reference_num: 'PERSONAL-TODO-1', name: feature.name, assigned_to: { records: [{ id: '123', type: 'user', status: 'pending' }], has_more: false } };

test('record lists share the bare-array JSON contract', async t => {
  const { dir } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '123' } };
    return { records: [req.url.startsWith('/api/v3/tasks') ? todo : req.url.startsWith('/api/v3/requirements') ? requirement : feature], pagination: { has_more: false, next_cursor: null } };
  });
  for (const [resource, record] of Object.entries({ feature, requirement, todo })) {
    const result = await run(dir, [resource, 'list', '--json']);
    assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), [record]);
  }
});

test('record lists share aligned headers and single-line rows', async t => {
  const { dir } = await setup(t, req => {
    if (req.url === '/api/v1/me') return { user: { id: '123' } };
    return { records: [req.url.startsWith('/api/v3/tasks') ? todo : req.url.startsWith('/api/v3/requirements') ? requirement : feature], pagination: { has_more: false, next_cursor: null } };
  });
  for (const resource of ['feature', 'requirement', 'todo']) {
    const result = await run(dir, [resource, 'list']);
    assert.equal(result.code, 0, result.stderr);
    const lines = result.stdout.trimEnd().split('\n');
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0].split(/\s+/), resource === 'todo' ? ['ID', 'DUE', 'STATE', 'TITLE'] : ['ID', 'STATE', 'TITLE']);
    assert.equal(lines[0].indexOf('TITLE'), lines[1].indexOf('A title'));
    assert.match(lines[1], /A title with spacing$/);
  }
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

test('requirements share title/body, view and human result contracts', async t => {
 const record = {...feature, reference_num: 'CLI-12-1', html_url: 'https://example.test/requirements/CLI-12-1', description: {body: '<p>One &amp; two</p>'}};
 const {dir, requests} = await setup(t, () => ({record}));
 const created = await run(dir, ['requirement', 'create', '--feature', '123', '-t', 'Title', '-b', '<literal> & text']);
 assert.equal(created.code, 0, created.stderr);
 assert.match(created.stdout, /CLI-12-1/);
 assert.match(created.stdout, /https:\/\/example.test\/requirements\/CLI-12-1/);
 assert.equal(requests[0].body.record.description, '<p>&lt;literal&gt; &amp; text</p>');
 const human = await run(dir, ['requirement', 'view', 'CLI-12-1']);
 assert.match(human.stdout, /One & two/);
 const json = await run(dir, ['requirement', 'view', 'CLI-12-1', '--json']);
 assert.deepEqual(JSON.parse(json.stdout), record);
});

test('invalid list options fail before resolving parent references', async t => {
  const { dir, requests } = await setup(t);
  for (const [resource, parent] of [['feature', '--workspace'], ['requirement', '--feature']]) {
    const result = await run(dir, [resource, 'list', parent, 'CLI-12', '--per-page', '201', '--json']);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /1 and 200/);
    assert.equal(result.stdout, '');
  }
  assert.equal(requests.length, 0);
});
