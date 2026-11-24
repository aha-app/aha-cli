import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { tagFlags, tagIdentifier, fetchTag } from '../../lib/tag-api';

export default class TagDelete extends BaseCommand {
  static description = 'Delete an unused tag (requires --yes in scripts)';
  static args = '<tag-id>';
  static flags = {
    ...BaseCommand.flags,
    json: tagFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = tagIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a tag without an interactive confirmation.'
      );
    await this.initAPI();
    const tag = await fetchTag(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,type' })
    );
    if (typeof tag.id !== 'string' || !/^\d+$/.test(tag.id))
      throw new Error(
        'The API did not return a valid tag ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${tag.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/tags/${encodeURIComponent(tag.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: tag.id, deleted: true }, null, 2));
    else this.log(`Deleted tag: ${tag.id}`);
  }
}
