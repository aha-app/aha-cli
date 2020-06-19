import BaseCommand from '../../base';
import ux from "cli-ux";
import { readConfiguration, identifierFromConfiguration } from '../../utils/extensionUtils';

export default class Uninstall extends BaseCommand {
  static description = "uninstall the extension in the current directory from Aha!";

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const configuration = readConfiguration();
    const identifier = identifierFromConfiguration(configuration);

    // Convert the identifier into the ID and then delete.
    ux.action.start('Uninstalling')
    const { body } = await this.api.get(`/api/v2/extensions?filter[identifier]=${identifier}`, {
      "content-type": "application/vnd.api+json",
    });
    if (body.data.length == 0) {
      ux.action.stop('done') 
      process.stderr.write(`No extension found with identifier '${identifier}'\n`);
      return;
    }
    await this.api.delete(`/api/v2/extensions/${body.data[0].id}`, {
      "content-type": "application/vnd.api+json",
    });
    ux.action.stop('done') 
  }
}
