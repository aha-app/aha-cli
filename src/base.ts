import Command, { flags, ParserOutput } from "@oclif/command";
import AhaAPI from "./api";
import netrc from "netrc-parser";
import Debug from "debug";
const debug = Debug("aha");

abstract class BaseCommand extends Command {
  _api: AhaAPI | null;
  flags: ParserOutput;

  static flags = {
    subdomain: flags.string({
      char: "s",
      description: "Aha! subdomain to use for authentication",
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
    const { url, token } = this.loadAuth();

    const newAPI = new AhaAPI({ baseURL: url });
    newAPI.defaults.headers = {
      authorization: `Bearer ${token}`,
    };
    return newAPI;
  }
  resetAPI() {
    this._api = null;
  }

  loadAuth() {
    let subdomain = this.flags.subdomain;
    let token = null;
    let url = null;

    netrc.loadSync();
    if (subdomain) {
      // User specified the domain on the command line.
      if (!netrc.machines[subdomain]) {
        throw new Error(
          `No credentials found for ${server}, use "aha auth:login" to login first`
        );
      }
      token = netrc.machines[subdomain].token;
      url = netrc.machines[subdomain].url;
    } else {
      // Use the first type=aha url we find.
      for (subdomain in netrc.machines) {
        if (netrc.machines[subdomain].type === "aha") {
          debug(`using credentials for ${subdomain}`);
          token = netrc.machines[subdomain].token;
          url = netrc.machines[subdomain].url;
          break;
        }
      }
    }

    if (!token)
      throw new Error(
        `No credentials found, use "aha auth:login" to login first`
      );

    return { url, token };
  }
}

export default BaseCommand;
