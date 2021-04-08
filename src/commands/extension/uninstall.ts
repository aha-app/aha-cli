import BaseCommand from '../../base';
import ux from 'cli-ux';
import {
  readConfiguration,
  identifierFromConfiguration,
} from '../../utils/extension-utils';

export default class Uninstall extends BaseCommand {
  static description = 'Uninstall the extension in the current directory';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const configuration = readConfiguration();
    const identifier = identifierFromConfiguration(configuration);

    ux.action.start('Uninstalling');
    await this.api.delete(`/api/v1/extensions/${identifier}`, {
      'content-type': 'application/json',
    });
    ux.action.stop('done');
  }
}
