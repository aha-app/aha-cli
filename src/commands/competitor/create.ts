import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  CompetitorRecord,
  competitorFlags,
  competitorEditFlags,
  competitorPatch,
  resolveCompetitorIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/competitor-api';

export default class CompetitorCreate extends BaseCommand {
  static description = 'Create a competitor in an explicit workspace';
  static flags = {
    ...competitorFlags,
    ...competitorEditFlags,
    workspace: Flags.string({
      description: 'Workspace ID/reference (required)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --workspace to create a competitor.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await competitorPatch(flags, true);
    await this.initAPI();
    await resolveCompetitorIds(this.api, patch);
    const result = await this.api.post(`/api/v3/competitors?${query}`, {
      body: { record: patch },
    });
    const competitor = (result.body as { record: CompetitorRecord }).record;
    warnEmbedded(competitor);
    printRecordResult(this, competitor, 'Created competitor');
  }
}
