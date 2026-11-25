import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  initiativeFlags,
  initiativeIdentifier,
  fetchInitiative,
} from '../../lib/initiative-api';

export default class InitiativeDelete extends BaseCommand {
  static description = 'Delete an initiative (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: initiativeFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = initiativeIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete an initiative without an interactive confirmation.'
      );
    await this.initAPI();
    const initiative = await fetchInitiative(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof initiative.id !== 'string' || !/^\d+$/.test(initiative.id))
      throw new Error(
        'The API did not return a valid initiative ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${initiative.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(
      `/api/v3/initiatives/${encodeURIComponent(initiative.id)}`
    );
    if (this.flags.json)
      this.log(JSON.stringify({ id: initiative.id, deleted: true }, null, 2));
    else
      this.log(
        `Deleted initiative: ${initiative.reference_num || initiative.id}`
      );
  }
}
