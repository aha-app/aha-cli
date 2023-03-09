import { Command, Flags } from '@oclif/core';
import { Input } from '@oclif/parser';
import netrc from 'netrc-parser';
import { prompt } from 'inquirer';
import AhaAPI from './api';

interface ApiAuth {
  token: string;
  url: string;
}

abstract class BaseCommand extends Command {
  static needsAuth = false;

  static flags = {
    subdomain: Flags.string({
      char: 's',
      description: 'Aha! subdomain to use for authentication',
    }),
  };

  flags?: any;

  _auth?: ApiAuth;

  _api?: AhaAPI;

  async init() {
    // do some initialization
    const { flags } = this.parse(this.constructor as Input<any>);
    this.flags = flags;

    const { needsAuth } = this.constructor as typeof BaseCommand;
    if (needsAuth) {
      await this.initAPI();
    }
  }

  get api(): AhaAPI {
    if (this._api) {
      return this._api;
    }

    throw new Error(
      'API not initialized. Set static needsAuth = true in your command.'
    );
  }

  async initAPI(): Promise<AhaAPI> {
    const { url, token } = await this.loadAuth();

    this._api = new AhaAPI({ baseURL: url });
    this._api.defaults.headers = {
      authorization: `Bearer ${token}`,
    };
    return this._api;
  }

  resetAPI() {
    this._api = undefined;
    this._auth = undefined;
  }

  async loadAuth(): Promise<ApiAuth> {
    if (this._auth) {
      return this._auth;
    }

    const subdomain = this.flags?.subdomain;
    let machine;

    netrc.loadSync();
    const { machines } = netrc;
    if (subdomain) {
      // User specified the domain on the command line.
      machine = machines[subdomain];
      if (!machine) {
        throw new Error(
          `No credentials found for ${subdomain}, use "aha auth:login -s ${subdomain}" to login first`
        );
      }
    } else {
      const machineOptions = Object.keys(machines).filter(
        key => machines[key].type === 'aha'
      );
      machine = machines[machineOptions[0]];

      if (machineOptions.length > 1) {
        ({ machine } = await prompt({
          type: 'list',
          name: 'machine',
          message: 'Which Aha! account do you want to use?',
          default: machine,
          choices: machineOptions.map(key => ({
            name: key,
            value: machines[key],
          })),
        }));
      }
    }

    if (!machine || !machine.token || !machine.url)
      throw new Error(
        `No credentials found, use "aha auth:login" to login first`
      );

    this._auth = { url: machine.url, token: machine.token };
    return this._auth;
  }

  // Catch all unhandled errors and display to the user in a reasonable way.
  async catch(error: Error) {
    this.error(error.message, { exit: 1 });
  }
}

export default BaseCommand;
