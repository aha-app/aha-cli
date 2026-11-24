import BaseCommand from '../../base';
import {
  tagFlags,
  tagIdentifier,
  fieldQuery,
  fetchTag,
  printTag,
} from '../../lib/tag-api';

export default class TagView extends BaseCommand {
  static description = 'View a tag by its string ID';
  static args = '<tag-id>';
  static flags = tagFlags;
  async run() {
    const id = tagIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printTag(this, await fetchTag(this.api, id, query));
  }
}
