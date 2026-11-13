const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, run } = require('./helpers.cjs');

const feature = { id: '999', reference_num: 'CLI-12', name: 'A title\nwith spacing', html_url: 'https://example.test/features/CLI-12', status: { name: 'In progress' } };
const requirement = { ...feature, id: '777', reference_num: 'CLI-12-1', html_url: 'https://example.test/requirements/CLI-12-1' };
const epic = { ...feature, id: '666', reference_num: 'CLI-E-1', html_url: 'https://example.test/epics/CLI-E-1' };
const todo = { id: '888', reference_num: 'PERSONAL-TODO-1', name: feature.name, assigned_to: { records: [{ id: '123', type: 'user', status: 'pending' }], has_more: false } };
const records = { feature, requirement, epic, todo };
const parents = { feature: ['--release', '123'], requirement: ['--feature', '123'], epic: ['--workspace', '123'], todo: [] };

test('record lists share the bare-array JSON contract', async t => {
  for (const [resource, record] of Object.entries(records)) {
    const { dir } = await setup(t, req => req.url === '/api/v1/me' ? {user: {id: '123'}} : {records: [record], pagination: {has_more: false, next_cursor: null}});
    const result = await run(dir, [resource, 'list', '--json']);
    assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), [record]);
  }
});

test('record lists share aligned headers and single-line rows', async t => {
  for (const [resource, record] of Object.entries(records)) {
    const { dir } = await setup(t, req => req.url === '/api/v1/me' ? {user: {id: '123'}} : {records: [record], pagination: {has_more: false, next_cursor: null}});
    const result = await run(dir, [resource, 'list']);
    assert.equal(result.code, 0, result.stderr);
    const lines = result.stdout.trimEnd().split('\n');
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0].split(/\s+/), resource === 'todo' ? ['ID', 'DUE', 'STATE', 'TITLE'] : ['ID', 'STATE', 'TITLE']);
    assert.equal(lines[0].indexOf('TITLE'), lines[1].indexOf('A title'));
    assert.match(lines[1], /A title with spacing$/);
  }
});

test('record creates share plain-text title/body flags and human references', async t => {
  for (const [resource, record] of Object.entries({feature, requirement, epic})) {
    const {dir, requests} = await setup(t, () => ({record}));
    const result = await run(dir, [resource, 'create', ...parents[resource], '-t', 'Title', '-b', '<literal> & text\nsecond line']);
    assert.equal(result.code, 0, result.stderr);
    assert.equal(requests[0].body.record.name, 'Title');
    assert.equal(requests[0].body.record.description, '<p>&lt;literal&gt; &amp; text<br>second line</p>');
    assert.ok(result.stdout.includes(record.reference_num));
    assert.ok(result.stdout.includes(record.html_url));
  }
});

test('record creates prompt for a title only in interactive non-JSON mode', async t => {
  for (const [resource, record] of Object.entries(records)) {
    const {dir, requests} = await setup(t, req => req.url === '/api/v1/me' ? {user: {id: '123'}} : {record});
    const result = await run(dir, [resource, 'create', ...parents[resource]], {answers: {title: 'Prompted title'}});
    assert.equal(result.code, 0, result.stderr);
    assert.equal(requests.at(-1).body.record.name, 'Prompted title');
    const before = requests.length;
    const scripted = await run(dir, [resource, 'create', ...parents[resource], '--json'], {answers: {title: 'Must not prompt'}});
    assert.equal(scripted.code, 1);
    assert.equal(requests.length, before);
  }
});

test('record views render readable descriptions and JSON retains the original HTML', async t => {
  for (const [resource, base] of Object.entries({feature, requirement, epic})) {
    const record = {...base, description: {body: '<p>One &amp; two</p><p>Next line</p>'}};
    const {dir} = await setup(t, () => ({record}));
    const human = await run(dir, [resource, 'view', record.reference_num]);
    assert.equal(human.code, 0, human.stderr);
    assert.match(human.stdout, /One & two\nNext line/);
    assert.doesNotMatch(human.stdout, /<p>/);
    const json = await run(dir, [resource, 'view', record.reference_num, '--json']);
    assert.equal(json.code, 0, json.stderr);
    assert.deepEqual(JSON.parse(json.stdout), record);
  }
});

test('invalid list options fail before resolving parent references', async t => {
  const { dir, requests } = await setup(t);
  for (const [resource, parent] of [['feature', '--workspace'], ['requirement', '--feature'], ['epic', '--workspace']]) {
    const result = await run(dir, [resource, 'list', parent, 'CLI-12', '--per-page', '201', '--json']);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /1 and 200/);
    assert.equal(result.stdout, '');
  }
  assert.equal(requests.length, 0);
});
