import BaseCommand from '../../base';
import {
  lookupFlags,
  listLookups,
  membershipListFlags,
} from '../../lib/idea-lookup-api';
import { recordListQuery } from '../../lib/record-list';
export default class PortalUserList extends BaseCommand {
  static description = 'List and filter portal user records (read-only)';
  static flags = { ...lookupFlags('portal_users'), ...membershipListFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha portal-user list [flags]');
    const query = recordListQuery(this.flags);
    await this.initAPI();
    await listLookups(this, 'portal_users', query);
  }
}
