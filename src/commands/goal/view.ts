import BaseCommand from '../../base';
import {
  goalFlags,
  goalIdentifier,
  fieldQuery,
  fetchGoal,
  printGoal,
} from '../../lib/goal-api';

export default class GoalView extends BaseCommand {
  static description = 'View a goal by ID or reference';
  static args = '<id-or-reference>';
  static flags = goalFlags;
  async run() {
    const id = goalIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printGoal(this, await fetchGoal(this.api, id, query));
  }
}
