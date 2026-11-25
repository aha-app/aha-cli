import BaseCommand from '../../base';
import {
  ideaFlags,
  ideaIdentifier,
  fieldQuery,
  fetchIdea,
  printIdea,
} from '../../lib/idea-api';
export default class IdeaView extends BaseCommand {
  static description = 'View an idea by ID or reference (API v3 is read-only)';
  static args = '<id-or-reference>';
  static flags = ideaFlags;
  async run() {
    const id = ideaIdentifier(this.parse().argv);
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printIdea(this, await fetchIdea(this.api, id, query));
  }
}
