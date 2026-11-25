import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  competitorFlags,
  competitorIdentifier,
  fetchCompetitor,
} from '../../lib/competitor-api';

export default class CompetitorDelete extends BaseCommand {
  static description = 'Delete a competitor (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: competitorFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = competitorIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a competitor without an interactive confirmation.'
      );
    await this.initAPI();
    const competitor = await fetchCompetitor(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof competitor.id !== 'string' || !/^\d+$/.test(competitor.id))
      throw new Error(
        'The API did not return a valid competitor ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${competitor.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(
      `/api/v3/competitors/${encodeURIComponent(competitor.id)}`
    );
    if (this.flags.json)
      this.log(JSON.stringify({ id: competitor.id, deleted: true }, null, 2));
    else
      this.log(
        `Deleted competitor: ${competitor.reference_num || competitor.id}`
      );
  }
}
