import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  ReleaseRecord,
  releaseFlags,
  releaseEditFlags,
  releaseIdentifier,
  releasePatch,
  resolveReleaseIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/release-api';

export default class ReleaseEdit extends BaseCommand {
  static description =
    'Edit only the supplied release fields and collection patches';
  static args = '<id-or-reference>';
  static flags = { ...releaseFlags, ...releaseEditFlags };
  async run() {
    const id = releaseIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await releasePatch(this.flags, false);
    await this.initAPI();
    await resolveReleaseIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/releases/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const release = (result.body as { record: ReleaseRecord }).record;
    warnEmbedded(release);
    printRecordResult(this, release, 'Updated release');
  }
}
