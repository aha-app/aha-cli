import BaseCommand from '../../base';
import {
  ideaEndorsementFlags,
  ideaEndorsementIdentifier,
  fieldQuery,
  fetchIdeaEndorsement,
  printIdeaEndorsement,
} from '../../lib/idea-endorsement-api';
export default class IdeaEndorsementView extends BaseCommand {
  static description = 'View an idea endorsement by numeric ID (read-only)';
  static args = '<numeric-id>';
  static flags = ideaEndorsementFlags;
  async run() {
    const id = ideaEndorsementIdentifier(this.parse().argv);
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printIdeaEndorsement(this, await fetchIdeaEndorsement(this.api, id, query));
  }
}
