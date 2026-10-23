import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  printTodoResult,
  todoFields,
  todoFlags,
  TodoResponse,
} from '../../lib/todo-api';
import {
  assigneeValues,
  assignmentPatch,
  editableTodoFlags,
  editableTodoPatch,
} from '../../lib/todo-fields';

export default class TodoCreate extends BaseCommand {
  static description =
    'Create a to-do (defaults to My work, assigned to yourself)';

  static flags = {
    ...todoFlags,
    ...editableTodoFlags,
    assignee: Flags.string({
      char: 'a',
      description: 'Comma-separated user IDs or @me (default: @me)',
    }),
    unassigned: Flags.boolean({
      description: 'Create without assigning anyone',
    }),
  };

  async run() {
    const { argv } = this.parse();
    if (argv.length) {
      throw new Error(
        `Unexpected arguments: ${argv.join(
          ' '
        )}. Use --title for the to-do title.`
      );
    }

    let title =
      typeof this.flags.title === 'string' ? this.flags.title.trim() : '';
    if (
      !title &&
      this.flags.title === undefined &&
      process.stdin.isTTY &&
      !this.flags.json
    ) {
      const answers = await prompt<{ title: string }>({
        type: 'input',
        name: 'title',
        message: 'Title',
        validate: (value: string) =>
          Boolean(value.trim()) || 'A title is required',
      });
      title = answers.title.trim();
    }
    if (!title) throw new Error('A title is required. Use --title "My to-do".');

    const patch = editableTodoPatch({ ...this.flags, title });
    const assignees = assigneeValues(this.flags.assignee, 'assignee');
    if (this.flags.unassigned && this.flags.assignee !== undefined) {
      throw new Error('Use either --assignee or --unassigned.');
    }
    await this.initAPI();
    patch.description ??= '<p></p>';
    patch.assigned_to = await assignmentPatch(
      this.api,
      this.flags.unassigned ? [] : assignees.length ? assignees : ['@me']
    );
    const path = this.flags.json
      ? `/api/v3/tasks?fields=${todoFields}`
      : '/api/v3/tasks';
    const { body } = await this.api.post(path, { body: { record: patch } });
    printTodoResult(this, (body as TodoResponse).record, 'Created to-do');
  }
}
