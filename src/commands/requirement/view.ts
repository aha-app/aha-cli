import BaseCommand from '../../base';
import {
  requirementFlags,
  requirementIdentifier,
  fieldQuery,
  fetchRequirement,
  printRequirement,
} from '../../lib/requirement-api';

export default class RequirementView extends BaseCommand {
  static description = 'View a requirement by ID or reference';
  static args = '<id-or-reference>';
  static flags = requirementFlags;
  async run() {
    const id = requirementIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printRequirement(this, await fetchRequirement(this.api, id, query));
  }
}
