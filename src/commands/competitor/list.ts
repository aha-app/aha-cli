import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  competitorFlags,
  resolveCompetitorIds,
} from '../../lib/competitor-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';

export default class CompetitorList extends BaseCommand {
  static description = 'List competitors across all cursor pages';
  static flags = {
    ...competitorFlags,
    ...recordListFlags,
    workspace: Flags.string({
      description: 'Filter by workspace ID/reference',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha competitor list [flags]');
    const query = recordListQuery(this.flags);
    const parents: Record<string, unknown> = {};
    if (typeof this.flags.workspace === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.workspace))
        throw new Error('Invalid --workspace.');
      parents.project_id = this.flags.workspace;
    }
    await this.initAPI();
    await resolveCompetitorIds(this.api, parents);
    await listRecords(this, 'competitors', 'competitor', parents, query);
  }
}
