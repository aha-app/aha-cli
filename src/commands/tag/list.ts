import BaseCommand from '../../base';
import { tagFlags, TagRecord, tagRow } from '../../lib/tag-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class TagList extends BaseCommand {
  static description = 'Find tags by name/type and list every cursor page';
  static flags = { ...tagFlags, ...recordListFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha tag list [flags]');
    const query = recordListQuery(this.flags);
    await this.initAPI();
    await listRecords<TagRecord>(this, 'tags', 'tag', {}, query, {
      columns: ['ID', 'STATE', 'TYPE', 'COLOR', 'TITLE'],
      row: tagRow,
    });
  }
}
