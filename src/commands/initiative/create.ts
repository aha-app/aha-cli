import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  InitiativeRecord,
  initiativeFlags,
  initiativeEditFlags,
  initiativePatch,
  resolveInitiativeIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/initiative-api';

export default class InitiativeCreate extends BaseCommand {
  static description = 'Create an initiative in an explicit workspace';
  static flags = {
    ...initiativeFlags,
    ...initiativeEditFlags,
    workspace: Flags.string({
      description: 'Workspace ID/reference (required)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --workspace to create an initiative.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await initiativePatch(flags, true);
    await this.initAPI();
    await resolveInitiativeIds(this.api, patch);
    const result = await this.api.post(`/api/v3/initiatives?${query}`, {
      body: { record: patch },
    });
    const initiative = (result.body as { record: InitiativeRecord }).record;
    warnEmbedded(initiative);
    printRecordResult(this, initiative, 'Created initiative');
  }
}
