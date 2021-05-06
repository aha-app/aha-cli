import BaseCommand from '../../base';
import { flags } from '@oclif/command';
import { buildExtension } from '../../utils/extension-utils';

export default class Install extends BaseCommand {
  static description = 'Build an extension into a zip file for ease of distribution';

  static flags = {
    ...BaseCommand.flags,
    noCache: flags.boolean({
      description: 'skip cached http imports',
    }),
  };

  async run() {
    await buildExtension(this, this.flags.noCache);
  }
}
