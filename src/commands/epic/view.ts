import BaseCommand from '../../base';
import {
  epicFlags,
  epicIdentifier,
  fieldQuery,
  fetchEpic,
  printEpic,
} from '../../lib/epic-api';

export default class EpicView extends BaseCommand {
  static description = 'View an epic by ID or reference';
  static args = '<id-or-reference>';
  static flags = epicFlags;
  async run() {
    const id = epicIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printEpic(this, await fetchEpic(this.api, id, query));
  }
}
