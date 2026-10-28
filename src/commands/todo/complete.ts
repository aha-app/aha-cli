import BaseCommand from '../../base';
import { updateTodoStatus } from '../../lib/todo-status';
import { todoFlags } from '../../lib/todo-api';

export default class TodoComplete extends BaseCommand {
  static description = 'Mark your assignment on a to-do complete';
  static args = '<id-or-reference>';
  static flags = todoFlags;

  async run() {
    await updateTodoStatus(this, 'completed');
  }
}
