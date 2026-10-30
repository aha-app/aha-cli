import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  FeatureRecord,
  featureFlags,
  featureEditFlags,
  featurePatch,
  resolveFeatureIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/feature-api';

export default class FeatureCreate extends BaseCommand {
  static description = 'Create a feature in an explicit workspace or release';
  static flags = {
    ...featureFlags,
    ...featureEditFlags,
    workspace: Flags.string({
      description: 'Workspace ID/reference (uses its default release)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error(
        'Use --title and --workspace or --release to create a feature.'
      );
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await featurePatch(flags, true);
    await this.initAPI();
    await resolveFeatureIds(this.api, patch);
    const result = await this.api.post(`/api/v3/features?${query}`, {
      body: { record: patch },
    });
    const feature = (result.body as { record: FeatureRecord }).record;
    warnEmbedded(feature);
    printRecordResult(this, feature, 'Created feature');
  }
}
