import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { ux } from '../../lib/ux';
import { Netrc } from 'netrc-parser';
const netrc = new Netrc();
import open from 'open';
import crypto from 'crypto';

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
    const authServer =
      typeof this.flags.authServer === 'string'
        ? this.flags.authServer
        : 'https://secure.aha.io';
    const browser =
      typeof this.flags.browser === 'string' ? this.flags.browser : undefined;
    const requestedSubdomain =
      typeof this.flags.subdomain === 'string'
        ? this.flags.subdomain
        : undefined;

    process.stderr.write(
      'Opening browser to login to Aha! and authorize the CLI\n'
    );
    process.stderr.write('If the browser does not open, visit this URL:\n');

    let url = `${authServer}/external/cli/start?cli_token=${cliToken}`;

    if (requestedSubdomain) {
      url += `&requested_domain=${requestedSubdomain}`;
    }

    process.stderr.write(`${url}\n`);

    try {
      await open(url, { app: browser, wait: false });
    } catch {
      // Browser open failed — user can use the URL above
    }
    ux.action.start('Waiting for login');

    let authenticatedSubdomain: string | undefined;
    while (true) {
      try {
        const response = await fetch(
          `${authServer}/external/cli/poll?cli_token=${cliToken}`
        );

        if (!response.ok) {
          if (response.status === 408) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const body: TokenInfo = (await response.json()) as TokenInfo;
        const { url, token, domain, email } = body;

        this.saveToken(domain, { token, url, email });
        authenticatedSubdomain = domain;

        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const statusCode =
          typeof error === 'object' && error !== null && 'http' in error
            ? (error as { http?: { statusCode?: number } }).http?.statusCode
            : undefined;

        // Check if it's an HTTP 408 timeout
        if (statusCode === 408 || message.includes('408')) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        throw error;
      }
    }
    ux.action.stop('complete.');

    // Try to use the token.
    ux.action.start('Testing login');
    this.flags.subdomain = authenticatedSubdomain ?? '';
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
