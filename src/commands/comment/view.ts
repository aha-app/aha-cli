import BaseCommand from '../../base';
import {
  commentFlags,
  commentIdentifier,
  fieldQuery,
  fetchComment,
  printComment,
} from '../../lib/comment-api';
export default class CommentView extends BaseCommand {
  static description = 'View a comment by its string ID';
  static args = '<comment-id>';
  static flags = commentFlags;
  async run() {
    const id = commentIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printComment(this, await fetchComment(this.api, id, query));
  }
}
