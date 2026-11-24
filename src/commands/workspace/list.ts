import BaseCommand from '../../base';
import {
  workspaceFlags,
  WorkspaceRecord,
  workspaceRow,
} from '../../lib/workspace-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';

export default class WorkspaceList extends BaseCommand {
  static description =
    'List accessible workspaces and teams across all cursor pages';
  static flags = { ...workspaceFlags, ...recordListFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha workspace list [flags]');
    const query = recordListQuery(this.flags);
    await this.initAPI();
    await listRecords<WorkspaceRecord>(
      this,
      'projects',
      'workspace',
      {},
      query,
      {
        columns: ['ID', 'STATE', 'PREFIX', 'TYPE', 'PARENT', 'TITLE'],
        row: workspaceRow,
        emptyMessage: 'No workspaces matched.',
      }
    );
  }
}
