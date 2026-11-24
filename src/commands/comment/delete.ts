import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  commentFlags,
  commentIdentifier,
  fetchComment,
} from '../../lib/comment-api';

export default class CommentDelete extends BaseCommand {
  static description =
    'Delete a comment and its replies (requires --yes in scripts)';
  static args = '<comment-id>';
  static flags = {
    ...BaseCommand.flags,
    json: commentFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = commentIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a comment without an interactive confirmation.'
      );
    await this.initAPI();
    const comment = await fetchComment(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,body,parent' })
    );
    if (typeof comment.id !== 'string' || !/^\d+$/.test(comment.id))
      throw new Error(
        'The API did not return a valid comment ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete comment ${comment.id} and its replies?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/comments/${encodeURIComponent(comment.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: comment.id, deleted: true }, null, 2));
    else this.log(`Deleted comment: ${comment.id}`);
  }
}
