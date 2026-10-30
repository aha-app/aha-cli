import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  featureFlags,
  featureIdentifier,
  fetchFeature,
} from '../../lib/feature-api';

export default class FeatureDelete extends BaseCommand {
  static description = 'Delete a feature (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: featureFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = featureIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a feature without an interactive confirmation.'
      );
    await this.initAPI();
    const feature = await fetchFeature(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof feature.id !== 'string' || !/^\d+$/.test(feature.id))
      throw new Error(
        'The API did not return a valid feature ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${feature.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/features/${encodeURIComponent(feature.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: feature.id, deleted: true }, null, 2));
    else this.log(`Deleted feature: ${feature.reference_num || feature.id}`);
  }
}
