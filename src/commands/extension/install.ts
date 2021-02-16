import BaseCommand from '../../base';
import { flags } from '@oclif/command';
import { installExtension } from '../../utils/extension-utils';

export default class Install extends BaseCommand {
  static description = 'Install the extension from the current directory';

  static flags = {
    ...BaseCommand.flags,
    dumpCode: flags.boolean({
      description: 'dump all code as it is uploaded',
    }),
  };

  async run() {
    await installExtension(this, this.flags.dumpCode);
  }
}
