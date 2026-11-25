import BaseCommand from '../../base';
import {
  lookupFlags,
  lookupIdentifier,
  fieldQuery,
  viewLookup,
} from '../../lib/idea-lookup-api';
export default class PortalUserView extends BaseCommand {
  static description = 'View a portal user by numeric ID (read-only)';
  static args = '<numeric-id>';
  static flags = lookupFlags('portal_users');
  async run() {
    const id = lookupIdentifier(this.parse().argv, 'portal-user');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    await viewLookup(this, 'portal_users', id, query);
  }
}
