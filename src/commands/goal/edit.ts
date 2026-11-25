import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  GoalRecord,
  goalFlags,
  goalEditFlags,
  goalIdentifier,
  goalPatch,
  resolveGoalIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/goal-api';

export default class GoalEdit extends BaseCommand {
  static description = 'Edit only the supplied goal fields';
  static args = '<id-or-reference>';
  static flags = { ...goalFlags, ...goalEditFlags };
  async run() {
    const id = goalIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await goalPatch(this.flags, false);
    await this.initAPI();
    await resolveGoalIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/goals/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const goal = (result.body as { record: GoalRecord }).record;
    warnEmbedded(goal);
    printRecordResult(this, goal, 'Updated goal');
  }
}
