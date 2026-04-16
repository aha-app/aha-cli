import BaseCommand from '../../base';

interface TaskResponse {
  task: {
    id: string;
    name: string;
    status: string;
  };
}

export default class TodoDone extends BaseCommand {
  static needsAuth = true;
  static description = 'Mark a to-do as complete';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const { argv } = this.parse(this.constructor as any);
    const id = argv[0];

    if (!id) {
      this.error('Usage: aha todo done <id>');
    }

    const result = await this.api.put(`/api/v1/tasks/${id}`, {
      body: { task: { status: 'complete' } },
    });

    const task = (result.body as TaskResponse).task;
    this.log(`Completed: ${task.name}`);
  }
}
