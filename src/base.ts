import { Netrc } from 'netrc-parser';
const netrc = new Netrc();
import { prompt } from 'inquirer';
import AhaAPI from './api';
import { FlagDefinition, Flags } from './lib/flags';
import { ParsedArgs, parseArgs } from './lib/parse';

interface ApiAuth {
  token: string;
  url: string;
}

abstract class BaseCommand {
  static description = '';
  static needsAuth = false;

  static flags: Record<string, FlagDefinition> = {
    subdomain: Flags.string({
      char: 's',
      description: 'Aha! subdomain to use for authentication',
    }),
  };

  argv: string[];
  flags: Record<string, string | boolean> = {};

  _auth?: ApiAuth;
  _api?: AhaAPI;

  constructor(argv: string[]) {
    this.argv = argv;
  }

  async execute() {
    await this.init();
    try {
      await this.run();
    } catch (error) {
      await this.catch(error);
    }
  }

  async init() {
    const { flags } = this.parse(this.constructor as typeof BaseCommand);
    this.flags = flags;

    const { needsAuth } = this.constructor as typeof BaseCommand;
    if (needsAuth) {
      await this.initAPI();
    }
  }

  parse(cmdClass?: typeof BaseCommand): ParsedArgs {
    const klass = (cmdClass || this.constructor) as typeof BaseCommand;
    const flagDefs = klass.flags || {};
    return parseArgs(this.argv, flagDefs);
  }

  abstract run(): Promise<void>;

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

    const subdomain =
      typeof this.flags.subdomain === 'string'
        ? this.flags.subdomain
        : undefined;
    let machine;

    netrc.loadSync();
    const { machines } = netrc;
    if (subdomain) {
      machine = machines[subdomain];
      if (!machine) {
        throw new Error(
          `No credentials found for ${subdomain}, use "aha auth login -s ${subdomain}" to login first`
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
        `No credentials found, use "aha auth login" to login first`
      );

    this._auth = { url: machine.url, token: machine.token };
    return this._auth;
  }

  log(message = '', ...args: unknown[]) {
    console.log(message, ...args);
  }

  error(input: string | Error, options: { exit?: number | false } = {}): void {
    const msg = input instanceof Error ? input.message : input;
    console.error(`Error: ${msg}`);
    if (options.exit !== false) {
      process.exit(typeof options.exit === 'number' ? options.exit : 1);
    }
  }

  async catch(error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.error(err.message, { exit: 1 });
  }
}

export default BaseCommand;
