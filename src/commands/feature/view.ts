import BaseCommand from '../../base';
import {
  featureFlags,
  featureIdentifier,
  fieldQuery,
  fetchFeature,
  printFeature,
} from '../../lib/feature-api';

export default class FeatureView extends BaseCommand {
  static description = 'View a feature by ID or reference';
  static args = '<id-or-reference>';
  static flags = featureFlags;
  async run() {
    const id = featureIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printFeature(this, await fetchFeature(this.api, id, query));
  }
}
