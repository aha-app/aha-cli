import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  EpicRecord,
  epicFlags,
  epicEditFlags,
  epicPatch,
  resolveEpicIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/epic-api';

export default class EpicCreate extends BaseCommand {
  static description = 'Create a epic in an explicit workspace or release';
  static flags = {
    ...epicFlags,
    ...epicEditFlags,
    workspace: Flags.string({
      description: 'Workspace ID/reference (uses its default release)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error(
        'Use --title and --workspace or --release to create a epic.'
      );
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await epicPatch(flags, true);
    await this.initAPI();
    await resolveEpicIds(this.api, patch);
    const result = await this.api.post(`/api/v3/epics?${query}`, {
      body: { record: patch },
    });
    const epic = (result.body as { record: EpicRecord }).record;
    warnEmbedded(epic);
    printRecordResult(this, epic, 'Created epic');
  }
}
