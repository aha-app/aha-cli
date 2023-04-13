import BaseCommand from '../../base';
import { Flags } from '@oclif/core';
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
    await installExtension(this, this.flags.dumpCode, this.flags.noCache);
    await fetchRemoteTypes();
  }
}
