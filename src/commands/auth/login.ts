import BaseCommand from "../../base";
import ux from "cli-ux";
import netrc from "netrc-parser";

interface NetrcEntry {
  email: string;
  token: string;
}

class LoginCommand extends BaseCommand {
  static description = `login to Aha! and save credentials for other commands
Credentials are saved in ~/.netrc`;

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    process.stderr.write("Enter your domain and API key information\n");
    const domain = await ux.prompt("Domain (e.g. mycompany.aha.io)");
    const email = await ux.prompt("Email address");
    const token = await ux.prompt(
      `API key (from https://${domain}/settings/api_keys)`,
      { type: "hide" }
    );

    this.saveToken(domain, { email, token });

    // Try to use the token.
    this.resetAPI();
    this.api.get("/api/v1/me");
    process.stderr.write("Success!\n");
  }

  private saveToken(host: string, entry: NetrcEntry) {
    netrc.loadSync();

    if (!netrc.machines[host]) netrc.machines[host] = {};
    netrc.machines[host].login = entry.email;
    netrc.machines[host].token = entry.token;

    netrc.saveSync();
  }
}

export default LoginCommand;
