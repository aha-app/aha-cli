import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  initiativeFlags,
  resolveInitiativeIds,
} from '../../lib/initiative-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';

export default class InitiativeList extends BaseCommand {
  static description = 'List initiatives across all cursor pages';
  static flags = {
    ...initiativeFlags,
    ...recordListFlags,
    workspace: Flags.string({
      description: 'Filter by workspace ID/reference',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha initiative list [flags]');
    const query = recordListQuery(this.flags);
    const parents: Record<string, unknown> = {};
    if (typeof this.flags.workspace === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.workspace))
        throw new Error('Invalid --workspace.');
      parents.project_id = this.flags.workspace;
    }
    await this.initAPI();
    await resolveInitiativeIds(this.api, parents);
    await listRecords(this, 'initiatives', 'initiative', parents, query);
  }
}
