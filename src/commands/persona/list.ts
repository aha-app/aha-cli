import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { personaFlags, resolvePersonaIds } from '../../lib/persona-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';

export default class PersonaList extends BaseCommand {
  static description = 'List personas across all cursor pages';
  static flags = {
    ...personaFlags,
    ...recordListFlags,
    workspace: Flags.string({
      description: 'Filter by workspace ID/reference',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha persona list [flags]');
    const query = recordListQuery(this.flags);
    const parents: Record<string, unknown> = {};
    if (typeof this.flags.workspace === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.workspace))
        throw new Error('Invalid --workspace.');
      parents.project_id = this.flags.workspace;
    }
    await this.initAPI();
    await resolvePersonaIds(this.api, parents);
    await listRecords(this, 'personas', 'persona', parents, query);
  }
}
