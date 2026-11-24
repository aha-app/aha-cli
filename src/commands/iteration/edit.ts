import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  IterationRecord,
  iterationFlags,
  iterationEditFlags,
  iterationIdentifier,
  iterationPatch,
  resolveIterationIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/iteration-api';

export default class IterationEdit extends BaseCommand {
  static description = 'Edit only the supplied iteration fields';
  static args = '<id-or-reference>';
  static flags = { ...iterationFlags, ...iterationEditFlags };
  async run() {
    const id = iterationIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await iterationPatch(this.flags, false);
    await this.initAPI();
    await resolveIterationIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/iterations/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const iteration = (result.body as { record: IterationRecord }).record;
    warnEmbedded(iteration);
    printRecordResult(this, iteration, 'Updated iteration');
  }
}
