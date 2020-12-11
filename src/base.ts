import Command, { flags, ParserOutput } from "@oclif/command";
import AhaAPI from "./api";
import netrc from "netrc-parser";
import Debug from "debug";
const debug = Debug("aha");

abstract class BaseCommand extends Command {
  _api: AhaAPI | null;
  flags: ParserOutput;

  static flags = {
    server: flags.string({
      char: "s",
      description: "Aha! server to connect to (mycompany.aha.io)",
    }),
    development: flags.boolean({
      char: "d",
      description: "whether to treat domains as development servers",
    }),
  };

  async init() {
    // do some initialization
    const { flags } = this.parse(this.constructor);
    this.flags = flags;
    this._api = null;
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
    const { server, token } = this.loadAuth();
    let baseURL;

    if (this.flags.development) {
      baseURL = `http://${server}`;
    } else {
      baseURL = `https://${server}`;
    }
    const newAPI = new AhaAPI({ baseURL });
    newAPI.defaults.headers = {
      authorization: `Bearer ${token}`,
    };
    return newAPI;
  }
  resetAPI() {
    this._api = null;
  }

  loadAuth() {
    netrc.loadSync();

    let server = this.flags.server;
    let token = null;
    let email = null;
    if (server) {
      // User specified the domain on the command line.
      if (!netrc.machines[server]) {
        throw new Error(
          `No credentials found for ${server}, use "aha auth:login" to login first`
        );
      }
      token = netrc.machines[server].token;
      email = netrc.machines[server].email;
    } else {
      // Use the first .aha.io domain we find.
      for (server in netrc.machines) {
        if (server.match(/.+\.aha\.io$/)) {
          debug(`using credentials for ${server}`);
          token = netrc.machines[server].token;
          email = netrc.machines[server].email;
          break;
        }
      }
    }

    if (!token)
      throw new Error(
        `No credentials found, use "aha auth:login" to login first`
      );

    return { server, token, email };
  }
}

export default BaseCommand;
