import BaseCommand from '../../base';

export default class Check extends BaseCommand {
  static description = `check if the stored credentials work`

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    await this.api.get('/api/v1/me');
    process.stderr.write("Success!\n");
  }
}
