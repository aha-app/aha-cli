import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { iterationFlags, resolveIterationIds } from '../../lib/iteration-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';

export default class IterationList extends BaseCommand {
  static description = 'List iterations across all cursor pages';
  static flags = {
    ...iterationFlags,
    ...recordListFlags,
    workspace: Flags.string({
      description: 'Filter by team workspace ID/reference',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: ahan iteration list [flags]');
    const query = recordListQuery(this.flags);
    const parents: Record<string, unknown> = {};
    if (typeof this.flags.workspace === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.workspace))
        throw new Error('Invalid --workspace.');
      parents.project_id = this.flags.workspace;
    }
    await this.initAPI();
    await resolveIterationIds(this.api, parents);
    await listRecords(this, 'iterations', 'iteration', parents, query);
  }
}
