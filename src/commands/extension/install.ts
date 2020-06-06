import BaseCommand from "../../base";
const fs = require("fs");

export default class Create extends BaseCommand {
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

    // Use the manifest to find files to upload.
    // Process each file.
    const contributions = this.readConfiguration().contributes;
    for (let contributionType in contributions) {
      for (let contributionName in contributions[contributionType]) {
        const contribution = contributions[contributionType][contributionName];
        this.log(contribution);
        this.update(`:${contributionName}`, contribution.entryPoint);
      }
    }
  }

  private async update(key, filePath) {
    this.log(`Loading: ${filePath}`);
    const script = fs.readFileSync(filePath, { encoding: "UTF-8" });

    this.api.put(`/api/v1/customizations/${key}`, {
      body: {
        cfd_key: key,
        script,
      },
    });
  }

  private readConfiguration() {
    const json = JSON.parse(
      fs.readFileSync("package.json", { encoding: "UTF-8" })
    );
    return json.ahaExtension;
  }
}
