import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  printTodoResult,
  todoFields,
  todoFlags,
  todoIdentifier,
  TodoResponse,
} from '../../lib/todo-api';
import {
  assigneeValues,
  assignmentPatch,
  editableTodoFlags,
  editableTodoPatch,
} from '../../lib/todo-fields';

export default class TodoEdit extends BaseCommand {
  static description = 'Edit a to-do and its assignments or parent record';
  static args = '<id-or-reference>';
  static flags = {
    ...todoFlags,
    ...editableTodoFlags,
    clearDue: Flags.boolean({ description: 'Clear the due date' }),
    clearRecord: Flags.boolean({
      description: 'Remove the parent record link',
    }),
    addAssignee: Flags.string({
      description: 'Add comma-separated user IDs or @me',
    }),
    removeAssignee: Flags.string({
      description: 'Remove comma-separated user IDs or @me',
    }),
  };

  async run() {
    const id = todoIdentifier(this.parse().argv, 'edit');
    const patch = editableTodoPatch(this.flags);
    const add = assigneeValues(this.flags.addAssignee, 'add-assignee');
    const remove = assigneeValues(this.flags.removeAssignee, 'remove-assignee');
    if (add.some(value => remove.includes(value)))
      throw new Error('Cannot add and remove the same assignee.');
    if (!Object.keys(patch).length && !add.length && !remove.length) {
      throw new Error(
        'Provide at least one edit, e.g. --title, --body, --due, --add-assignee, or --record with --record-type.'
      );
    }
    await this.initAPI();
    if (add.length || remove.length)
      patch.assigned_to = await assignmentPatch(this.api, add, remove);
    const path = `/api/v3/tasks/${encodeURIComponent(id)}${
      this.flags.json ? `?fields=${todoFields}` : ''
    }`;
    const { body } = await this.api.put(path, { body: { record: patch } });
    printTodoResult(this, (body as TodoResponse).record, 'Updated to-do');
  }
}
