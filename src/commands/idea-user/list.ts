import BaseCommand from '../../base';
import { lookupFlags, listLookups } from '../../lib/idea-lookup-api';
import { recordListQuery, recordListFlags } from '../../lib/record-list';
import { Flags } from '../../lib/flags';
export default class IdeaUserList extends BaseCommand {
  static description = 'List and filter idea user records (read-only)';
  static flags = {
    ...lookupFlags('idea_users'),
    ...recordListFlags,
    search: Flags.string({
      description: 'Filter email addresses containing text',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha idea-user list [flags]');
    const query = recordListQuery(this.flags, 'email');
    await this.initAPI();
    await listLookups(this, 'idea_users', query);
  }
}
