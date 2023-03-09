import BaseCommand from '../../base';
import { Flags } from '@oclif/core';
import { buildExtension } from '../../utils/extension-utils';

export default class Build extends BaseCommand {
  static description =
    'Build an extension into a zip file for ease of distribution';

  static flags = {
    ...BaseCommand.flags,
    noCache: Flags.boolean({
      description: 'skip cached http imports',
    }),
  };

  async run() {
    await buildExtension(this, this.flags.noCache);
  }
}
