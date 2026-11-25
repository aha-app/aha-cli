import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  KeyResultRecord,
  keyResultFlags,
  keyResultEditFlags,
  keyResultIdentifier,
  keyResultPatch,
  resolveKeyResultIds,
  fieldQuery,
  warnEmbedded,
  keyResultAccess,
} from '../../lib/key-result-api';

export default class KeyResultEdit extends BaseCommand {
  static description = 'Edit only the supplied key result fields';
  static args = '<id-or-reference>';
  static flags = { ...keyResultFlags, ...keyResultEditFlags };
  async run() {
    const id = keyResultIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await keyResultPatch(this.flags, false);
    await this.initAPI();
    await resolveKeyResultIds(this.api, patch);
    const result = await keyResultAccess(() =>
      this.api.put(`/api/v3/key_results/${encodeURIComponent(id)}?${query}`, {
        body: { record: patch },
      })
    );
    const keyResult = (result.body as { record: KeyResultRecord }).record;
    warnEmbedded(keyResult);
    printRecordResult(this, keyResult, 'Updated key result');
  }
}
