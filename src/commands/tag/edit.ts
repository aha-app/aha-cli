import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  TagRecord,
  tagFlags,
  tagEditFlags,
  tagIdentifier,
  tagPatch,
  fieldQuery,
  warnEmbedded,
} from '../../lib/tag-api';

export default class TagEdit extends BaseCommand {
  static description = 'Edit only the supplied tag fields';
  static args = '<tag-id>';
  static flags = { ...tagFlags, ...tagEditFlags };
  async run() {
    const id = tagIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await tagPatch(this.flags, false);
    await this.initAPI();
    const result = await this.api.put(
      `/api/v3/tags/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const tag = (result.body as { record: TagRecord }).record;
    warnEmbedded(tag);
    printRecordResult(this, tag, 'Updated tag');
  }
}
