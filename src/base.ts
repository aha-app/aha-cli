import Command, {flags, ParserOutput} from '@oclif/command';
import AhaAPI from './api';
import netrc from 'netrc-parser';
import Debug from "debug";
const debug = Debug("aha");

abstract class BaseCommand extends Command {
  _api: AhaAPI | null;
  flags: ParserOutput;

  static flags = {
    domain: flags.string({
      char: 'd',
      description: 'Aha! domain to connect to (mycompany.aha.io)'
    }),
    development: flags.boolean({
      description: 'whether to treat domains as development servers'
    }),
  }

  async init() {
    // do some initialization
    const {flags} = this.parse(this.constructor)
    this.flags = flags
    this._api = null;
  }

  get api(): AhaAPI {
    if (this._api) {
      return this._api;
    } else {
      this._api = this.prepareAPI()
      return this._api
    }
  }

  prepareAPI(): AhaAPI {
    const { domain, token } = this.loadAuth();
    let baseURL;

    if (this.flags.development) {
      baseURL = `http://${domain.replace(/\.aha\.io/, '.lvh.me')}:3000`;
    } else {
      baseURL = `https://${domain}`;
    }
    const newAPI = new AhaAPI({ baseURL })
    newAPI.defaults.headers = {
      authorization: `Bearer ${token}`,
    }
    return newAPI;
  }
  resetAPI() {
    this._api = null;
  }

  loadAuth() {
    netrc.loadSync()

    let domain = this.flags.domain;
    let token = null;
    let email = null;
    if (domain) {
      // User specified the domain on the command line.
      if (!netrc.machines[domain]) {
        throw new Error(`No credentials found for ${domain}, use "aha auth:login" to login first`);
      }
      token = netrc.machines[domain].token;
      email = netrc.machines[domain].email;
    } else {
      // Use the first .aha.io domain we find.
      for (domain in netrc.machines) {
        if (domain.match(/.+\.aha\.io$/)) {
          debug(`using credentials for ${domain}`)
          token = netrc.machines[domain].token;
          email = netrc.machines[domain].email;
          break;
        }
      }
    }

    if (!token)
      throw new Error(`No credentials found, use "aha auth:login" to login first`);

    return {domain, token, email};
  }

}

export default BaseCommand;
