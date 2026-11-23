import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  ReleasePhaseRecord,
  releasePhaseFlags,
  releasePhaseEditFlags,
  releasePhasePatch,
  resolveReleasePhaseIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/release-phase-api';

export default class ReleasePhaseCreate extends BaseCommand {
  static description = 'Create a phase or milestone in an explicit release';
  static flags = {
    ...releasePhaseFlags,
    ...releasePhaseEditFlags,
    release: Flags.string({ description: 'Release ID/reference (required)' }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error(
        'Use --title, --release and --type to create a phase or milestone.'
      );
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await releasePhasePatch(flags, true);
    await this.initAPI();
    await resolveReleasePhaseIds(this.api, patch);
    const result = await this.api.post(`/api/v3/release_phases?${query}`, {
      body: { record: patch },
    });
    const phase = (result.body as { record: ReleasePhaseRecord }).record;
    warnEmbedded(phase);
    printRecordResult(this, phase, 'Created release phase');
  }
}
