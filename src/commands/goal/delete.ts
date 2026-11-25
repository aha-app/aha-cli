import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { goalFlags, goalIdentifier, fetchGoal } from '../../lib/goal-api';

export default class GoalDelete extends BaseCommand {
  static description = 'Delete a goal (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: goalFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = goalIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a goal without an interactive confirmation.'
      );
    await this.initAPI();
    const goal = await fetchGoal(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof goal.id !== 'string' || !/^\d+$/.test(goal.id))
      throw new Error(
        'The API did not return a valid goal ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${goal.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/goals/${encodeURIComponent(goal.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: goal.id, deleted: true }, null, 2));
    else this.log(`Deleted goal: ${goal.reference_num || goal.id}`);
  }
}
