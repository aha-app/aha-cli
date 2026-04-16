import BaseCommand from '../../base';

export default class TodoDelete extends BaseCommand {
  static needsAuth = true;
  static description = 'Delete a to-do';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const { argv } = this.parse(this.constructor as any);
    const id = argv[0];

    if (!id) {
      this.error('Usage: aha todo delete <id>');
    }

    await this.api.delete(`/api/v1/tasks/${id}`);
    this.log(`Deleted task ${id}`);
  }
}
