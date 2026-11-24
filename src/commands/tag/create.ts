import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import {
  TagRecord,
  tagFlags,
  tagEditFlags,
  tagPatch,
  fieldQuery,
  warnEmbedded,
} from '../../lib/tag-api';

export default class TagCreate extends BaseCommand {
  static description = 'Create a tag by name, type and color';
  static flags = {
    ...tagFlags,
    ...tagEditFlags,
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title to create a tag.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await tagPatch(flags, true);
    await this.initAPI();
    const result = await this.api.post(`/api/v3/tags?${query}`, {
      body: { record: patch },
    });
    const tag = (result.body as { record: TagRecord }).record;
    warnEmbedded(tag);
    printRecordResult(this, tag, 'Created tag');
  }
}
