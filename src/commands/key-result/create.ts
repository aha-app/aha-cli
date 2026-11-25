import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  KeyResultRecord,
  keyResultFlags,
  keyResultEditFlags,
  keyResultPatch,
  resolveKeyResultIds,
  fieldQuery,
  warnEmbedded,
  keyResultAccess,
} from '../../lib/key-result-api';

export default class KeyResultCreate extends BaseCommand {
  static description =
    'Create a key result under an explicit goal (requires Enterprise+ capability)';
  static flags = {
    ...keyResultFlags,
    ...keyResultEditFlags,
    goal: Flags.string({
      description: 'Goal ID/reference (required)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --goal to create a key result.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await keyResultPatch(flags, true);
    await this.initAPI();
    await resolveKeyResultIds(this.api, patch);
    const result = await keyResultAccess(() =>
      this.api.post(`/api/v3/key_results?${query}`, {
        body: { record: patch },
      })
    );
    const keyResult = (result.body as { record: KeyResultRecord }).record;
    warnEmbedded(keyResult);
    printRecordResult(this, keyResult, 'Created key result');
  }
}
