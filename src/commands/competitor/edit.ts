import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  CompetitorRecord,
  competitorFlags,
  competitorEditFlags,
  competitorIdentifier,
  competitorPatch,
  resolveCompetitorIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/competitor-api';

export default class CompetitorEdit extends BaseCommand {
  static description = 'Edit only the supplied competitor fields';
  static args = '<id-or-reference>';
  static flags = { ...competitorFlags, ...competitorEditFlags };
  async run() {
    const id = competitorIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await competitorPatch(this.flags, false);
    await this.initAPI();
    await resolveCompetitorIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/competitors/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const competitor = (result.body as { record: CompetitorRecord }).record;
    warnEmbedded(competitor);
    printRecordResult(this, competitor, 'Updated competitor');
  }
}
