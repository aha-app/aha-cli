import BaseCommand from "../../base";
import * as chokidar from "chokidar";
import { installExtension } from "../../utils/extensionUtils";

export default class Create extends BaseCommand {
  static description =
    "watch the current directory for changes and install the extension each time a file changes";

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    this.log("Watching for changes in the current directory ...");
    chokidar
      .watch(".", { ignoreInitial: true })
      .on("all", async (event, changedPath) => {
        this.log(`... detected file change: ${changedPath}`);
        await installExtension(this.api, false);
      });
  }
}
