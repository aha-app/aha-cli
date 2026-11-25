import BaseCommand from '../../base';
import {
  competitorFlags,
  competitorIdentifier,
  fieldQuery,
  fetchCompetitor,
  printCompetitor,
} from '../../lib/competitor-api';

export default class CompetitorView extends BaseCommand {
  static description = 'View a competitor by ID or reference';
  static args = '<id-or-reference>';
  static flags = competitorFlags;
  async run() {
    const id = competitorIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printCompetitor(this, await fetchCompetitor(this.api, id, query));
  }
}
