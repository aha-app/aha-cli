import BaseCommand from '../../base';
import { printRecordResult } from '../../lib/record-output';
import {
  CommentRecord,
  commentFlags,
  commentEditFlags,
  commentIdentifier,
  commentPatch,
  fieldQuery,
  warnEmbedded,
} from '../../lib/comment-api';
export default class CommentEdit extends BaseCommand {
  static description =
    'Edit only the comment body, preserving its record, reply parent and author';
  static args = '<comment-id>';
  static flags = { ...commentFlags, ...commentEditFlags };
  async run() {
    const id = commentIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await commentPatch(this.flags, false);
    await this.initAPI();
    const result = await this.api.put(
      `/api/v3/comments/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const comment = (result.body as { record: CommentRecord }).record;
    warnEmbedded(comment);
    printRecordResult(this, comment, 'Updated comment');
  }
}
