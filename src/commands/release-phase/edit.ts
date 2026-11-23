import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  ReleasePhaseRecord,
  releasePhaseFlags,
  releasePhaseEditFlags,
  releasePhaseIdentifier,
  releasePhasePatch,
  resolveReleasePhaseIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/release-phase-api';

export default class ReleasePhaseEdit extends BaseCommand {
  static description =
    'Edit only the supplied phase or milestone fields and collection patches';
  static args = '<id-or-reference>';
  static flags = { ...releasePhaseFlags, ...releasePhaseEditFlags };
  async run() {
    const id = releasePhaseIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await releasePhasePatch(this.flags, false);
    await this.initAPI();
    await resolveReleasePhaseIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/release_phases/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const phase = (result.body as { record: ReleasePhaseRecord }).record;
    warnEmbedded(phase);
    printRecordResult(this, phase, 'Updated release phase');
  }
}
