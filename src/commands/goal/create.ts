import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  GoalRecord,
  goalFlags,
  goalEditFlags,
  goalPatch,
  resolveGoalIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/goal-api';

export default class GoalCreate extends BaseCommand {
  static description = 'Create a goal in an explicit workspace';
  static flags = {
    ...goalFlags,
    ...goalEditFlags,
    workspace: Flags.string({
      description: 'Workspace ID/reference (required)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --workspace to create a goal.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await goalPatch(flags, true);
    await this.initAPI();
    await resolveGoalIds(this.api, patch);
    const result = await this.api.post(`/api/v3/goals?${query}`, {
      body: { record: patch },
    });
    const goal = (result.body as { record: GoalRecord }).record;
    warnEmbedded(goal);
    printRecordResult(this, goal, 'Created goal');
  }
}
