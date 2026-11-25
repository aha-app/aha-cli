import BaseCommand from '../../base';
import {
  initiativeFlags,
  initiativeIdentifier,
  fieldQuery,
  fetchInitiative,
  printInitiative,
} from '../../lib/initiative-api';

export default class InitiativeView extends BaseCommand {
  static description = 'View an initiative by ID or reference';
  static args = '<id-or-reference>';
  static flags = initiativeFlags;
  async run() {
    const id = initiativeIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printInitiative(this, await fetchInitiative(this.api, id, query));
  }
}
