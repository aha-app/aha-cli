import BaseCommand from '../../base';
import {
  customFieldFlags,
  definitionResource,
} from '../../lib/custom-field-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class CustomFieldList extends BaseCommand {
  static description = 'List and filter custom field definitions';
  static flags = { ...customFieldFlags(false), ...recordListFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha custom-field list [flags]');
    const query = recordListQuery(this.flags);
    const parent = {};
    await this.initAPI();
    await listRecords(this, definitionResource, 'custom-field', parent, query);
  }
}
