import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { fetchTodo, todoFlags, todoIdentifier } from '../../lib/todo-api';

export default class TodoDelete extends BaseCommand {
  static description = 'Delete the entire to-do, including all assignments';
  static args = '<id-or-reference>';
  static flags = {
    ...todoFlags,
    yes: Flags.boolean({
      char: 'y',
      description: 'Skip the deletion confirmation (required in scripts)',
    }),
  };

  async run() {
    const id = todoIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json)) {
      throw new Error(
        'Use --yes to delete the entire to-do without an interactive confirmation.'
      );
    }
    await this.initAPI();
    const todo = await fetchTodo(this.api, id);
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${todo.name}" and all its assignments?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/tasks/${encodeURIComponent(todo.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: todo.id, deleted: true }, null, 2));
    else this.log(`Deleted to-do: ${todo.name}`);
  }
}
