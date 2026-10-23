import BaseCommand from '../../base';
import { fetchTodo, todoFlags, todoIdentifier } from '../../lib/todo-api';
import { descriptionText } from '../../lib/todo-fields';

export default class TodoView extends BaseCommand {
  static description = 'View a to-do';
  static args = '<id-or-reference>';
  static flags = todoFlags;

  async run() {
    const id = todoIdentifier(this.parse().argv, 'view');
    await this.initAPI();
    const todo = await fetchTodo(this.api, id);
    if (this.flags.json) {
      this.log(JSON.stringify(todo, null, 2));
      return;
    }
    this.log(`${todo.reference_num || todo.id}: ${todo.name}`);
    this.log(`Status: ${todo.status || '—'}`);
    this.log(`Due: ${todo.due_date || '—'}`);
    this.log(
      `Parent: ${
        todo.record
          ? `${todo.record.type} ${
              todo.record.reference_num || todo.record.id
            }${todo.record.name ? ` — ${todo.record.name}` : ''}`
          : 'None'
      }`
    );
    this.log('Assignees:');
    for (const assignee of todo.assigned_to.records) {
      this.log(
        `  ${assignee.name || assignee.id} (${assignee.type} ${assignee.id}): ${
          assignee.status
        }`
      );
    }
    if (!todo.assigned_to.records.length) this.log('  None');
    if (todo.assigned_to.has_more)
      this.log('  More assignees were not included in the API response.');
    this.log(
      `\n${descriptionText(todo.description?.body || '') || '(No description)'}`
    );
    if (todo.html_url) this.log(`\n${todo.html_url}`);
  }
}
