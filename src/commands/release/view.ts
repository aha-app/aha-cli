import BaseCommand from '../../base';
import {
  releaseFlags,
  releaseIdentifier,
  fieldQuery,
  fetchRelease,
  printRelease,
} from '../../lib/release-api';

export default class ReleaseView extends BaseCommand {
  static description = 'View a release by ID or reference';
  static args = '<id-or-reference>';
  static flags = releaseFlags;
  async run() {
    const id = releaseIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printRelease(this, await fetchRelease(this.api, id, query));
  }
}
