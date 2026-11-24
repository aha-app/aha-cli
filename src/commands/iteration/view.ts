import BaseCommand from '../../base';
import {
  iterationFlags,
  iterationIdentifier,
  fieldQuery,
  fetchIteration,
  printIteration,
} from '../../lib/iteration-api';

export default class IterationView extends BaseCommand {
  static description = 'View an iteration by ID or reference';
  static args = '<id-or-reference>';
  static flags = iterationFlags;
  async run() {
    const id = iterationIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printIteration(this, await fetchIteration(this.api, id, query));
  }
}
