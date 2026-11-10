import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  requirementFlags,
  requirementIdentifier,
  fetchRequirement,
} from '../../lib/requirement-api';

export default class RequirementDelete extends BaseCommand {
  static description = 'Delete a requirement (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: requirementFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = requirementIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a requirement without an interactive confirmation.'
      );
    await this.initAPI();
    const requirement = await fetchRequirement(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof requirement.id !== 'string' || !/^\d+$/.test(requirement.id))
      throw new Error(
        'The API did not return a valid requirement ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${requirement.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(
      `/api/v3/requirements/${encodeURIComponent(requirement.id)}`
    );
    if (this.flags.json)
      this.log(JSON.stringify({ id: requirement.id, deleted: true }, null, 2));
    else
      this.log(
        `Deleted requirement: ${requirement.reference_num || requirement.id}`
      );
  }
}
