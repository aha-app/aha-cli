import BaseCommand from '../../base';
import { lookupFlags, listLookups } from '../../lib/idea-lookup-api';
import { recordListQuery, recordListFlags } from '../../lib/record-list';
export default class IdeaPortalList extends BaseCommand {
  static description = 'List and filter idea portal records (read-only)';
  static flags = { ...lookupFlags('idea_portals'), ...recordListFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha idea-portal list [flags]');
    const query = recordListQuery(this.flags);
    await this.initAPI();
    await listLookups(this, 'idea_portals', query);
  }
}
