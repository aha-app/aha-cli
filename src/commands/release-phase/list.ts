import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  releasePhaseFlags,
  resolveReleasePhaseIds,
} from '../../lib/release-phase-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';

export default class ReleasePhaseList extends BaseCommand {
  static description =
    'List release phases and milestones across all cursor pages';
  static flags = {
    ...releasePhaseFlags,
    ...recordListFlags,
    release: Flags.string({
      description: 'Filter by release ID/reference',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha release-phase list [flags]');
    const query = recordListQuery(this.flags);
    const parents: Record<string, unknown> = {};
    if (typeof this.flags.release === 'string') {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(this.flags.release))
        throw new Error('Invalid --release.');
      parents.release_id = this.flags.release;
    }
    await this.initAPI();
    await resolveReleasePhaseIds(this.api, parents);
    await listRecords(this, 'release_phases', 'release-phase', parents, query);
  }
}
