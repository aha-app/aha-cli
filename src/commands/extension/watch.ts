import BaseCommand from '../../base';
import * as chokidar from 'chokidar';
import { installExtension } from '../../utils/extension-utils';

const WAIT_TIMEOUT = 250;
export default class Create extends BaseCommand {
  static description =
    'Watch the current directory for changes and install the extension each time a file changes';

  static flags = {
    ...BaseCommand.flags,
  };

  changedPaths?: string[] | null;

  timeoutHandle?: NodeJS.Timeout | null;

  performingInstall = false;

  async run() {
    this.log('Watching for changes in the current directory ...');

    chokidar
      .watch('.', { ignoreInitial: true, ignored: '.git' })
      .on('all', async (event, changedPath) => {
        if (this.timeoutHandle) {
          (this.changedPaths || []).push(changedPath);
          clearTimeout(this.timeoutHandle);
        } else {
          this.changedPaths = [changedPath];
        }

        this.timeoutHandle = setTimeout(
          () => this.performInstall(),
          WAIT_TIMEOUT
        );
      });
  }

  async performInstall() {
    // Prevent reentry
    if (this.performingInstall) {
      this.timeoutHandle = setTimeout(
        () => this.performInstall(),
        WAIT_TIMEOUT
      );
      return;
    }

    this.performingInstall = true;

    if (this.changedPaths) {
      if (this.changedPaths.length > 1) {
        this.log(`... detected ${this.changedPaths.length} files changed`);
      } else {
        this.log(`... detected file change: ${this.changedPaths[0]}`);
      }
    }
    this.changedPaths = null;
    this.timeoutHandle = null;
    // Put no async code above this line. The instance variables must be updated before awaiting

    try {
      await installExtension(this, false);
    } catch (error) {
      // Do nothing if the compile fails
    } finally {
      this.performingInstall = false;
    }
  }
}
