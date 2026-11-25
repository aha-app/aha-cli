import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  keyResultFlags,
  keyResultIdentifier,
  fetchKeyResult,
  keyResultAccess,
} from '../../lib/key-result-api';

export default class KeyResultDelete extends BaseCommand {
  static description = 'Delete a key result (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: keyResultFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = keyResultIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a key result without an interactive confirmation.'
      );
    await this.initAPI();
    const keyResult = await fetchKeyResult(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof keyResult.id !== 'string' || !/^\d+$/.test(keyResult.id))
      throw new Error(
        'The API did not return a valid key result ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${keyResult.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await keyResultAccess(() =>
      this.api.delete(`/api/v3/key_results/${encodeURIComponent(keyResult.id)}`)
    );
    if (this.flags.json)
      this.log(JSON.stringify({ id: keyResult.id, deleted: true }, null, 2));
    else
      this.log(
        `Deleted key result: ${keyResult.reference_num || keyResult.id}`
      );
  }
}
