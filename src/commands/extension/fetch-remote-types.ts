import BaseCommand from '../../base';
import { fetchRemoteTypes } from '../../utils/extension-utils';

export default class Install extends BaseCommand {
  static needsAuth = true;

  static description = 'Fetch remote type files';

  static hidden = true;

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    await fetchRemoteTypes({ cdn: this.flags.cdn });
  }
}
