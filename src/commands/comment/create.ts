import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { printRecordResult } from '../../lib/record-output';
import {
  CommentRecord,
  commentFlags,
  commentEditFlags,
  commentContextFlags,
  commentPatch,
  resolveCommentContext,
  fieldQuery,
  warnEmbedded,
} from '../../lib/comment-api';
export default class CommentCreate extends BaseCommand {
  static description = 'Create a comment or reply on an explicit owning record';
  static flags = {
    ...commentFlags,
    ...commentEditFlags,
    ...commentContextFlags,
    replyTo: Flags.string({
      description:
        'Top-level comment ID being replied to (parent_id); owning record is still required',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error(
        'Use --body, --record and --record-type to create a comment.'
      );
    const query = fieldQuery(this.flags);
    const patch = await commentPatch(this.flags, true);
    await this.initAPI();
    await resolveCommentContext(this.api, patch);
    const result = await this.api.post(`/api/v3/comments?${query}`, {
      body: { record: patch },
    });
    const comment = (result.body as { record: CommentRecord }).record;
    warnEmbedded(comment);
    printRecordResult(this, comment, 'Created comment');
  }
}
