import BaseCommand from '../../base';
import { ideaOrganizationFlags } from '../../lib/idea-organization-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class IdeaOrganizationList extends BaseCommand {
  static description = 'List and filter idea organizations (read-only)';
  static flags = { ...ideaOrganizationFlags, ...recordListFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha idea-organization list [flags]');
    const query = recordListQuery(this.flags);
    await this.initAPI();
    await listRecords(
      this,
      'idea_organizations',
      'idea organization',
      {},
      query
    );
  }
}
