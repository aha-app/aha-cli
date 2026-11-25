import BaseCommand from '../../base';
import {
  ideaOrganizationFlags,
  ideaOrganizationIdentifier,
  fieldQuery,
  fetchIdeaOrganization,
  printIdeaOrganization,
} from '../../lib/idea-organization-api';
export default class IdeaOrganizationView extends BaseCommand {
  static description =
    'View an idea organization by ID or reference (read-only)';
  static args = '<id-or-reference>';
  static flags = ideaOrganizationFlags;
  async run() {
    const id = ideaOrganizationIdentifier(this.parse().argv);
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printIdeaOrganization(
      this,
      await fetchIdeaOrganization(this.api, id, query)
    );
  }
}
