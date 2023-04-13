import BaseCommand from '../../base';
import { Flags, ux } from '@oclif/core';
import netrc from 'netrc-parser';
import * as open from 'open';
import * as crypto from 'crypto';
import { HTTP } from 'http-call';

interface NetrcEntry {
  token: string;
  url: string;
  email: string;
}

interface TokenInfo {
  url: string;
  token: string;
  domain: string;
  email: string;
}

class Login extends BaseCommand {
  static description = `Login to Aha! and save credentials for other commands
Credentials are saved in ~/.netrc`;

  static flags = {
    ...BaseCommand.flags,
    authServer: Flags.string({
      description: 'server to use for authentication',
      default: 'https://secure.aha.io',
    }),
    browser: Flags.string({
      description: "browser to use for login, e.g. 'safari' or 'firefox'",
    }),
  };

  async run() {
    const cliToken = crypto.randomBytes(36).toString('hex');

    process.stderr.write(
      'Opening browser to login to Aha! and authorize the CLI\n'
    );

    let url = `${this.flags.authServer}/external/cli/start?cli_token=${cliToken}`;

    if (this.flags.subdomain) {
      url += `&requested_domain=${this.flags.subdomain}`;
    }

    const cp = await open(url, {
      app: this.flags.browser,
      wait: false,
    });
    cp.on('error', err => {
      ux.warn(err);
      ux.warn('Cannot open browser');
    });
    ux.action.start('Waiting for login');

    let subdomain;
    while (true) {
      try {
        const { body }: { body: TokenInfo } = await HTTP.get(
          `${this.flags.authServer}/external/cli/poll?cli_token=${cliToken}`
        );

        const { url, token, domain, email } = body;

        this.saveToken(domain, { token, url, email });
        subdomain = domain;

        break;
      } catch (error) {
        if (!error.http || error.http.statusCode !== 408) throw error;

        // Sleep a little before polling again
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    ux.action.stop('complete.');

    // Try to use the token.
    ux.action.start('Testing login');
    this.flags.subdomain = subdomain;
    this.resetAPI();
    await this.initAPI();
    await this.api.get('/api/v1/me');
    ux.action.stop('Success!');
  }

  private saveToken(host: string, entry: NetrcEntry) {
    netrc.loadSync();

    if (!netrc.machines[host]) netrc.machines[host] = {};
    netrc.machines[host].type = 'aha';
    netrc.machines[host].email = entry.email;
    netrc.machines[host].token = entry.token;
    netrc.machines[host].url = entry.url;

    netrc.saveSync();
  }
}

export default Login;
