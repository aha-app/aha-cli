import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  fetchRemoteTypes,
  installExtension,
} from '../../utils/extension-utils';

export default class Install extends BaseCommand {
  static needsAuth = true;

  static description = 'Install the extension from the current directory';

  static flags = {
    ...BaseCommand.flags,
    dumpCode: Flags.boolean({
      description: 'dump all code as it is uploaded',
    }),
    noCache: Flags.boolean({
      description: 'skip cached http imports',
    }),
  };

  async run() {
    const dumpCode = this.flags.dumpCode === true;
    const noCache = this.flags.noCache === true;

    await installExtension(this, dumpCode, noCache);
    await fetchRemoteTypes();
  }
}
