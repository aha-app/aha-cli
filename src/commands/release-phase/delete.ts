import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  releasePhaseFlags,
  releasePhaseIdentifier,
  fetchReleasePhase,
} from '../../lib/release-phase-api';

export default class ReleasePhaseDelete extends BaseCommand {
  static description =
    'Delete a release phase or milestone (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: releasePhaseFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = releasePhaseIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a release phase or milestone without an interactive confirmation.'
      );
    await this.initAPI();
    const phase = await fetchReleasePhase(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof phase.id !== 'string' || !/^\d+$/.test(phase.id))
      throw new Error(
        'The API did not return a valid release phase ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${phase.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(
      `/api/v3/release_phases/${encodeURIComponent(phase.id)}`
    );
    if (this.flags.json)
      this.log(JSON.stringify({ id: phase.id, deleted: true }, null, 2));
    else this.log(`Deleted release phase: ${phase.reference_num || phase.id}`);
  }
}
