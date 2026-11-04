import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  requirementFlags,
  resolveRequirementIds,
} from '../../lib/requirement-api';
import { recordListFlags, listRecords } from '../../lib/record-list';

export default class RequirementList extends BaseCommand {
  static description =
    'List requirements across all cursor pages, with API v3 filters';
  static flags = {
    ...requirementFlags,
    ...recordListFlags,
    feature: Flags.string({ description: 'Filter by feature ID/reference' }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha requirement list [flags]');
    const parents: Record<string, unknown> = {};
    if (typeof this.flags.feature === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.feature))
        throw new Error('Invalid --feature.');
      parents.feature_id = this.flags.feature;
    }
    await this.initAPI();
    await resolveRequirementIds(this.api, parents);
    await listRecords(this, 'requirements', 'requirement', parents);
  }
}
