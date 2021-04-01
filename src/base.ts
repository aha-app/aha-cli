import Command, { flags } from '@oclif/command';
import { Input, OutputFlags } from '@oclif/parser';
import AhaAPI from './api';
import netrc from 'netrc-parser';

abstract class BaseCommand extends Command {
  static flags = {
    subdomain: flags.string({
      char: 's',
      description: 'Aha! subdomain to use for authentication',
    }),
  };

  flags?: any;
  _api?: AhaAPI;

  async init() {
    // do some initialization
    const { flags } = this.parse(<Input<any>>this.constructor);
    this.flags = flags;
  }

  get api(): AhaAPI {
    if (this._api) {
      return this._api;
    } else {
      this._api = this.prepareAPI();
      return this._api;
    }
  }

  prepareAPI(): AhaAPI {
    const { url, token } = this.loadAuth();

    const newAPI = new AhaAPI({ baseURL: url });
    newAPI.defaults.headers = {
      authorization: `Bearer ${token}`,
    };
    return newAPI;
  }
  resetAPI() {
    this._api = undefined;
  }

  loadAuth(): { url: string; token: string } {
    let subdomain = this.flags?.subdomain;
    let token = null;
    let url = null;

    netrc.loadSync();
    if (subdomain) {
      // User specified the domain on the command line.
      if (!netrc.machines[subdomain]) {
        throw new Error(
          `No credentials found for ${subdomain}, use "aha auth:login" to login first`
        );
      }
      token = netrc.machines[subdomain].token;
      url = netrc.machines[subdomain].url;
    } else {
      // Use the first type=aha url we find.
      for (subdomain in netrc.machines) {
        if (netrc.machines[subdomain].type === 'aha') {
          token = netrc.machines[subdomain].token;
          url = netrc.machines[subdomain].url;
          break;
        }
      }
    }

    if (!token || !url)
      throw new Error(
        `No credentials found, use "aha auth:login" to login first`
      );

    return { url, token };
  }

  // Catch all unhandled errors and display to the user in a reasonable way.
  async catch(error: Error) {
    this.error(error.message, { exit: 1 });
  }
}

export default BaseCommand;
