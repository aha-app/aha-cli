import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  CommentRecord,
  commentFlags,
  commentContextFlags,
  commentContext,
  resolveCommentContext,
  commentRow,
} from '../../lib/comment-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class CommentList extends BaseCommand {
  static description =
    'List accessible comments, optionally scoped to an owning record';
  static flags = {
    ...commentFlags,
    ...recordListFlags,
    ...commentContextFlags,
    search: Flags.string({
      description: 'Filter comment HTML bodies containing text',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha comment list [flags]');
    const query = recordListQuery(this.flags, 'body');
    const context = commentContext(this.flags);
    if (
      Object.keys(context).length &&
      (query.has('filter.eq[record.id]') || query.has('filter.eq[record.type]'))
    )
      throw new Error(
        'Supply owning record filters through either --record/--record-type or --filters, not both.'
      );
    await this.initAPI();
    await resolveCommentContext(this.api, context);
    if (context.record_id) {
      query.set('filter.eq[record.id]', String(context.record_id));
      query.set('filter.eq[record.type]', String(context.record_type));
    }
    await listRecords<CommentRecord>(this, 'comments', 'comment', {}, query, {
      columns: ['ID', 'STATE', 'RECORD', 'REPLY-TO', 'TITLE'],
      row: commentRow,
    });
  }
}
