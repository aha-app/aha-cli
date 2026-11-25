import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  InitiativeRecord,
  initiativeFlags,
  initiativeEditFlags,
  initiativeIdentifier,
  initiativePatch,
  resolveInitiativeIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/initiative-api';

export default class InitiativeEdit extends BaseCommand {
  static description = 'Edit only the supplied initiative fields';
  static args = '<id-or-reference>';
  static flags = { ...initiativeFlags, ...initiativeEditFlags };
  async run() {
    const id = initiativeIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await initiativePatch(this.flags, false);
    await this.initAPI();
    await resolveInitiativeIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/initiatives/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const initiative = (result.body as { record: InitiativeRecord }).record;
    warnEmbedded(initiative);
    printRecordResult(this, initiative, 'Updated initiative');
  }
}
