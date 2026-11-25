import BaseCommand from '../../base';
import {
  lookupFlags,
  lookupIdentifier,
  fieldQuery,
  viewLookup,
} from '../../lib/idea-lookup-api';
export default class IdeaPortalView extends BaseCommand {
  static description = 'View an idea portal by numeric ID (read-only)';
  static args = '<numeric-id>';
  static flags = lookupFlags('idea_portals');
  async run() {
    const id = lookupIdentifier(this.parse().argv, 'idea-portal');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    await viewLookup(this, 'idea_portals', id, query);
  }
}
