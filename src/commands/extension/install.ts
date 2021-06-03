import BaseCommand from '../../base';
import { flags } from '@oclif/command';
import {
  fetchRemoteTypes,
  installExtension,
} from '../../utils/extension-utils';

export default class Install extends BaseCommand {
  static needsAuth = true;

  static description = 'Install the extension from the current directory';

  static flags = {
    ...BaseCommand.flags,
    dumpCode: flags.boolean({
      description: 'dump all code as it is uploaded',
    }),
    noCache: flags.boolean({
      description: 'skip cached http imports',
    }),
  };

  async run() {
    await fetchRemoteTypes();
    await installExtension(this, this.flags.dumpCode, this.flags.noCache);
  }
}
