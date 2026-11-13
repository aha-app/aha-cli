import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { epicFlags, epicIdentifier, fetchEpic } from '../../lib/epic-api';

export default class EpicDelete extends BaseCommand {
  static description = 'Delete an epic (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: epicFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = epicIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete an epic without an interactive confirmation.'
      );
    await this.initAPI();
    const epic = await fetchEpic(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof epic.id !== 'string' || !/^\d+$/.test(epic.id))
      throw new Error(
        'The API did not return a valid epic ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${epic.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/epics/${encodeURIComponent(epic.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: epic.id, deleted: true }, null, 2));
    else this.log(`Deleted epic: ${epic.reference_num || epic.id}`);
  }
}
