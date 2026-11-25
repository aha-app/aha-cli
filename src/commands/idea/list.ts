import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { ideaFlags } from '../../lib/idea-api';
import { resolveRecordIds } from '../../lib/record-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class IdeaList extends BaseCommand {
  static description = 'List and filter ideas (API v3 is read-only)';
  static flags = {
    ...ideaFlags,
    ...recordListFlags,
    workspace: Flags.string({
      description: 'Filter by workspace ID/prefix through project.id',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha idea list [flags]');
    const query = recordListQuery(this.flags);
    const scope: Record<string, unknown> = {};
    if (typeof this.flags.workspace === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.workspace))
        throw new Error('Invalid --workspace.');
      if (query.has('filter.eq[project.id]'))
        throw new Error(
          'Supply workspace scope through either --workspace or --filters eq[project.id], not both.'
        );
      scope.project_id = this.flags.workspace;
    }
    await this.initAPI();
    await resolveRecordIds(this.api, scope, { project_id: 'projects' });
    // Ideas have no project_id parent parameter; workspace scoping is a v3 filter.
    if (scope.project_id)
      query.set('filter.eq[project.id]', String(scope.project_id));
    await listRecords(this, 'ideas', 'idea', {}, query);
  }
}
