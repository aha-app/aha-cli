import BaseCommand from '../../base';

export default class Create extends BaseCommand {
  static description = 'create an example extension'

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    this.log(`TODO: create`)
  }
}
