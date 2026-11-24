import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  iterationFlags,
  iterationIdentifier,
  fetchIteration,
} from '../../lib/iteration-api';

export default class IterationDelete extends BaseCommand {
  static description = 'Delete an iteration (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: iterationFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = iterationIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete an iteration without an interactive confirmation.'
      );
    await this.initAPI();
    const iteration = await fetchIteration(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof iteration.id !== 'string' || !/^\d+$/.test(iteration.id))
      throw new Error(
        'The API did not return a valid iteration ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${iteration.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(
      `/api/v3/iterations/${encodeURIComponent(iteration.id)}`
    );
    if (this.flags.json)
      this.log(JSON.stringify({ id: iteration.id, deleted: true }, null, 2));
    else
      this.log(`Deleted iteration: ${iteration.reference_num || iteration.id}`);
  }
}
