import BaseCommand from '../../base';
import {
  releasePhaseFlags,
  releasePhaseIdentifier,
  fieldQuery,
  fetchReleasePhase,
  printReleasePhase,
} from '../../lib/release-phase-api';

export default class ReleasePhaseView extends BaseCommand {
  static description = 'View a release phase or milestone by ID or reference';
  static args = '<id-or-reference>';
  static flags = releasePhaseFlags;
  async run() {
    const id = releasePhaseIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printReleasePhase(this, await fetchReleasePhase(this.api, id, query));
  }
}
