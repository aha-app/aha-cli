import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  EpicRecord,
  epicFlags,
  epicEditFlags,
  epicIdentifier,
  epicPatch,
  resolveEpicIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/epic-api';

export default class EpicEdit extends BaseCommand {
  static description =
    'Edit only the supplied epic fields and collection patches';
  static args = '<id-or-reference>';
  static flags = { ...epicFlags, ...epicEditFlags };
  async run() {
    const id = epicIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await epicPatch(this.flags, false);
    await this.initAPI();
    await resolveEpicIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/epics/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const epic = (result.body as { record: EpicRecord }).record;
    warnEmbedded(epic);
    printRecordResult(this, epic, 'Updated epic');
  }
}
