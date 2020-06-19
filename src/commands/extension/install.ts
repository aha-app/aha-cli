import BaseCommand from '../../base';
import ux from "cli-ux";
import * as fs from 'fs';
import { readConfiguration, identifierFromConfiguration } from '../../utils/extensionUtils';

export default class Install extends BaseCommand {
  static description = "install the extension from the current directory";

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    // TODO: Perhaps the installation should upload the "contributes" section
    // from the package.json file as-is. The server can then track exactly
    // what the extension needs. If the extension creates a custom field then
    // perhaps we could link the field back to the extension, so you could see
    // where it came from, and optionally remove the field if the extension
    // is removed.

    // Read the script sources.
    const source = [];
    const configuration = readConfiguration();
    this.log(`Extension '${configuration.name}'`);
    const contributions = configuration.ahaExtension.contributes;
    for (let contributionType in contributions) {
      for (let contributionName in contributions[contributionType]) {
        const contribution = contributions[contributionType][contributionName];
        this.log(`   contributes ${contributionType}: '${contributionName}'`);
        source.push({
          entryPoint: contribution.entryPoint,
          script: fs.readFileSync(contribution.entryPoint, { encoding: "UTF-8" }),
        });
      }
    }

    // Upload to the server.
    ux.action.start('Uploading')
    await this.api.post(`/api/v2/extensions`, {
      body: {
        data: {
          type: "extensions",
          attributes: {
            identifier: identifierFromConfiguration(configuration),
            name: configuration.description,
            version: configuration.version,
            configuration: configuration.ahaExtension,
            source,
          },
        },
      },
      "content-type": "application/vnd.api+json",
    });
    ux.action.stop('done') 
  }
}
