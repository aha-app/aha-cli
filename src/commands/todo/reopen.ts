import BaseCommand from '../../base';

interface TaskResponse {
  task: {
    id: string;
    name: string;
    status: string;
  };
}

export default class TodoReopen extends BaseCommand {
  static needsAuth = true;
  static description = 'Reopen a completed to-do';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const { argv } = this.parse(this.constructor as any);
    const id = argv[0];

    if (!id) {
      this.error('Usage: aha todo reopen <id>');
    }

    const result = await this.api.put(`/api/v1/tasks/${id}`, {
      body: { task: { status: 'pending' } },
    });

    const task = (result.body as TaskResponse).task;
    this.log(`Reopened: ${task.name}`);
  }
}
