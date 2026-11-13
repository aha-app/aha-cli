import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  ReleaseRecord,
  releaseFlags,
  releaseEditFlags,
  releasePatch,
  resolveReleaseIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/release-api';

export default class ReleaseCreate extends BaseCommand {
  static description =
    'Create a release or parking lot in an explicit workspace';
  static flags = {
    ...releaseFlags,
    ...releaseEditFlags,
    type: Flags.string({
      description: 'release or rollup_release (create only)',
    }),
    workspace: Flags.string({
      description: 'Workspace ID/reference',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --workspace to create a release.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await releasePatch(flags, true);
    await this.initAPI();
    await resolveReleaseIds(this.api, patch);
    const result = await this.api.post(`/api/v3/releases?${query}`, {
      body: { record: patch },
    });
    const release = (result.body as { record: ReleaseRecord }).record;
    warnEmbedded(release);
    printRecordResult(this, release, 'Created release');
  }
}
