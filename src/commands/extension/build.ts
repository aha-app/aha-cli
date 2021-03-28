import BaseCommand from '../../base';
import { buildExtension } from '../../utils/extension-utils';

export default class Install extends BaseCommand {
  static description = 'Build an extension into a zip file for ease of distribution';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    await buildExtension(this);
  }
}
