import BaseCommand from '../../base';
import {
  lookupFlags,
  lookupIdentifier,
  fieldQuery,
  viewLookup,
} from '../../lib/idea-lookup-api';
export default class IdeaUserView extends BaseCommand {
  static description = 'View an idea user by numeric ID (read-only)';
  static args = '<numeric-id>';
  static flags = lookupFlags('idea_users');
  async run() {
    const id = lookupIdentifier(this.parse().argv, 'idea-user');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    await viewLookup(this, 'idea_users', id, query);
  }
}
