import BaseCommand from '../../base';
import {
  keyResultFlags,
  keyResultIdentifier,
  fieldQuery,
  fetchKeyResult,
  printKeyResult,
} from '../../lib/key-result-api';

export default class KeyResultView extends BaseCommand {
  static description = 'View a key result by ID or reference';
  static args = '<id-or-reference>';
  static flags = keyResultFlags;
  async run() {
    const id = keyResultIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printKeyResult(this, await fetchKeyResult(this.api, id, query));
  }
}
