import { printTable } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  currentUserId,
  ownAssignment,
  todoFields,
  todoFlags,
  Todo,
} from '../../lib/todo-api';
import { Flags } from '../../lib/flags';

interface TasksResponse {
  records: Todo[];
  pagination: { has_more: boolean; next_cursor: string | null };
}

export default class TodoList extends BaseCommand {
  static description = 'List your to-dos';
  static flags = {
    ...todoFlags,
    state: Flags.string({
      description: 'Filter by pending, completed, or all',
      default: 'pending',
    }),
    search: Flags.string({ description: 'Search for text in the to-do title' }),
  };

  async run() {
    const { argv } = this.parse();
    if (argv.length) {
      throw new Error(
        `Unexpected arguments: ${argv.join(' ')}. Usage: aha todo list`
      );
    }

    const state = this.flags.state;
    if (state !== 'pending' && state !== 'completed' && state !== 'all')
      throw new Error('--state must be pending, completed, or all.');
    const search =
      typeof this.flags.search === 'string'
        ? this.flags.search.trim()
        : undefined;
    if (search === '') throw new Error('--search requires nonempty text.');
    await this.initAPI();
    const userId = await currentUserId(this.api);
    const tasks: Todo[] = [];
    const assignmentStatuses = new Map<string, string>();
    const query = new URLSearchParams({
      fields: this.flags.json
        ? todoFields
        : 'id,reference_num,name,due_date,assigned_to',
      'filter.eq[type]': 'task',
      'filter.eq[assigned_to.id]': userId,
      'filter.eq[assigned_to.type]': 'user',
      per_page: '100',
    });
    if (state !== 'all') query.set('filter.eq[assigned_to.status]', state);
    if (search) query.set('filter.contains[name]', search);
    const cursors = new Set<string>();
    while (true) {
      const result = await this.api.get(`/api/v3/tasks?${query}`);
      const body = result.body as TasksResponse;
      // Collection filters can match different assignees on the same task.
      // Check that the pending assignment belongs to this user.
      for (const todo of body.records) {
        const assignment = await ownAssignment(this.api, todo, userId);
        if (assignment && (state === 'all' || assignment.status === state)) {
          tasks.push(todo);
          assignmentStatuses.set(todo.id, assignment.status);
        }
      }
      if (!body.pagination.has_more) break;
      const cursor = body.pagination.next_cursor;
      if (!cursor || cursors.has(cursor)) {
        throw new Error(
          'The API returned an invalid pagination cursor. Could not list all to-dos.'
        );
      }
      cursors.add(cursor);
      query.set('after', cursor);
    }

    if (this.flags.json) {
      this.log(JSON.stringify(tasks, null, 2));
      return;
    }
    if (!tasks.length) {
      this.log(
        `No ${state === 'all' ? '' : `${state} `}to-dos${
          search ? ' matching your search' : ''
        }.`
      );
      return;
    }

    printTable(
      this,
      ['ID', 'DUE', 'STATE', 'TITLE'],
      tasks.map(task => [
        task.reference_num || task.id,
        task.due_date || '—',
        assignmentStatuses.get(task.id) || '—',
        task.name,
      ])
    );
  }
}
