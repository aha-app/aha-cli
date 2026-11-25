import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  ideaEndorsementFlags,
  IdeaEndorsementRecord,
} from '../../lib/idea-endorsement-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class IdeaEndorsementList extends BaseCommand {
  static description =
    'List and filter idea endorsements (read-only; does not cast votes)';
  static flags = {
    ...ideaEndorsementFlags,
    ...recordListFlags,
    search: Flags.string({
      description: 'Filter linked idea titles containing text',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha idea-endorsement list [flags]');
    const query = recordListQuery(this.flags, 'idea.name');
    await this.initAPI();
    await listRecords<IdeaEndorsementRecord>(
      this,
      'idea_endorsements',
      'idea endorsement',
      {},
      query,
      {
        columns: [
          'ID',
          'STATE',
          'IDEA',
          'WEIGHT',
          'VALUE',
          'CONTRIBUTOR',
          'ORGANIZATION',
          'TITLE',
        ],
        row: record => [
          record.id,
          '—',
          record.idea?.reference_num || record.idea?.id || '—',
          String(record.weight ?? '—'),
          String(record.value ?? '—'),
          record.contributor?.name ||
            record.contributor?.email ||
            record.contributor?.id ||
            '—',
          record.idea_organization?.reference_num ||
            record.idea_organization?.id ||
            '—',
          record.idea?.name || '',
        ],
        emptyMessage: 'No idea endorsements matched.',
      }
    );
  }
}
