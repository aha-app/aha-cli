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
