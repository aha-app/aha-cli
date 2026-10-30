import BaseCommand from '../../base';
import {
  FeatureRecord,
  featureFlags,
  featureEditFlags,
  featureIdentifier,
  featurePatch,
  resolveFeatureIds,
  fieldQuery,
  printFeature,
} from '../../lib/feature-api';

export default class FeatureEdit extends BaseCommand {
  static description =
    'Edit only the supplied feature fields and collection patches';
  static args = '<id-or-reference>';
  static flags = { ...featureFlags, ...featureEditFlags };
  async run() {
    const id = featureIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await featurePatch(this.flags, false);
    await this.initAPI();
    await resolveFeatureIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/features/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    printFeature(
      this,
      (result.body as { record: FeatureRecord }).record,
      'Updated feature'
    );
  }
}
