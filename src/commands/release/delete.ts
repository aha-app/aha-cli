import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  releaseFlags,
  releaseIdentifier,
  fetchRelease,
} from '../../lib/release-api';

export default class ReleaseDelete extends BaseCommand {
  static description = 'Delete a release (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: releaseFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = releaseIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a release without an interactive confirmation.'
      );
    await this.initAPI();
    const release = await fetchRelease(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof release.id !== 'string' || !/^\d+$/.test(release.id))
      throw new Error(
        'The API did not return a valid release ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${release.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/releases/${encodeURIComponent(release.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: release.id, deleted: true }, null, 2));
    else this.log(`Deleted release: ${release.reference_num || release.id}`);
  }
}
