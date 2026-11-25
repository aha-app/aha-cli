import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  keyResultFlags,
  resolveKeyResultIds,
  keyResultAccess,
} from '../../lib/key-result-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class KeyResultList extends BaseCommand {
  static description =
    'List key results (requires Enterprise+ account capability)';
  static flags = {
    ...keyResultFlags,
    ...recordListFlags,
    goal: Flags.string({ description: 'Filter by goal ID/reference' }),
    workspace: Flags.string({
      description: 'Filter by workspace ID/prefix (use instead of --goal)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha key-result list [flags]');
    const query = recordListQuery(this.flags);
    if (this.flags.goal && this.flags.workspace)
      throw new Error(
        'Choose --goal or --workspace; the API supports one parent scope at a time.'
      );
    const parents: Record<string, unknown> = {};
    for (const [flag, key] of [
      ['goal', 'goal_id'],
      ['workspace', 'project_id'],
    ])
      if (typeof this.flags[flag] === 'string') {
        if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(String(this.flags[flag])))
          throw new Error('Invalid --' + flag + '.');
        parents[key] = this.flags[flag];
      }
    await this.initAPI();
    await resolveKeyResultIds(this.api, parents);
    await keyResultAccess(() =>
      listRecords(this, 'key_results', 'key-result', parents, query)
    );
  }
}
