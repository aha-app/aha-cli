import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { featureFlags, resolveFeatureIds } from '../../lib/feature-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';

export default class FeatureList extends BaseCommand {
  static description =
    'List features across all cursor pages, with API v3 filters';
  static flags = {
    ...featureFlags,
    ...recordListFlags,
    workspace: Flags.string({
      description: 'Filter by workspace ID/reference',
    }),
    release: Flags.string({ description: 'Filter by release ID/reference' }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha feature list [flags]');
    if (this.flags.workspace !== undefined && this.flags.release !== undefined)
      throw new Error(
        'Use either --workspace or --release as the list parent, not both.'
      );
    const query = recordListQuery(this.flags);
    const parents: Record<string, unknown> = {};
    if (typeof this.flags.workspace === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.workspace))
        throw new Error('Invalid --workspace.');
      parents.project_id = this.flags.workspace;
    }
    if (typeof this.flags.release === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.release))
        throw new Error('Invalid --release.');
      parents.release_id = this.flags.release;
    }
    await this.initAPI();
    await resolveFeatureIds(this.api, parents);
    await listRecords(this, 'features', 'feature', parents, query);
  }
}
