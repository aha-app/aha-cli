import BaseCommand from "../../base";
import { flags } from "@oclif/command";
import { installExtension } from "../../utils/extensionUtils";

export default class Install extends BaseCommand {
  static description = "install the extension from the current directory";

  static flags = {
    ...BaseCommand.flags,
    dumpCode: flags.boolean({
      description: "dump all code as it is uploaded",
    }),
  };

  async run() {
    installExtension(this.api, this.flags.dumpCode);
  }
}
