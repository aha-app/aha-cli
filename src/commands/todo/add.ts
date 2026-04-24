import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';

interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskCreateResponse {
  task: {
    id: string;
    name: string;
  };
}

interface TaskCreateRequest {
  task: {
    name: string;
    body: string;
    assigned_to_users: Array<{ email: string }>;
    due_date?: string;
  };
}

export default class TodoAdd extends BaseCommand {
  static needsAuth = true;
  static description = 'Create a new to-do';

  static flags = {
    ...BaseCommand.flags,
    due: Flags.string({
      description: 'due date in YYYY-MM-DD format',
    }),
  };

  async run() {
    const { argv } = this.parse(this.constructor as typeof BaseCommand);
    const name = argv[0];

    if (!name) {
      this.error('Usage: aha todo add <name> [--due YYYY-MM-DD]');
    }

    // Get current user email for assignment
    const meResult = await this.api.get('/api/v1/me');
    const me = meResult.body as MeResponse;

    const taskData: TaskCreateRequest = {
      task: {
        name,
        body: '<p></p>',
        assigned_to_users: [{ email: me.user.email }],
      },
    };

    if (typeof this.flags.due === 'string') {
      taskData.task.due_date = this.flags.due;
    }

    const result = await this.api.post('/api/v1/tasks', { body: taskData });
    const task = (result.body as TaskCreateResponse).task;
    this.log(`Created: ${task.name}`);
  }
}
