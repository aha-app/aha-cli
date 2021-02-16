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

    // Convert the identifier into the ID and then delete.
    ux.action.start('Uninstalling');
    const { body }: { body: any } = await this.api.get(
      `/api/v/extensions/${identifier}`,
      {
        'content-type': 'application/json',
      }
    );
    if (body.extension.length === 0) {
      ux.action.stop('done');
      process.stderr.write(
        `No extension found with identifier '${identifier}'\n`
      );
      return;
    }
    await this.api.delete(`/api/v1/extensions/${body.extension.id}`, {
      'content-type': 'application/json',
    });
    ux.action.stop('done');
  }
}
