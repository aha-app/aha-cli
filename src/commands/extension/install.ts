import BaseCommand from "../../base";
import { installExtension } from "../../utils/extensionUtils";

export default class Install extends BaseCommand {
  static description = "install the extension from the current directory";

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    installExtension(this.api);
  }
}
