import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  IterationRecord,
  iterationFlags,
  iterationEditFlags,
  iterationPatch,
  resolveIterationIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/iteration-api';

export default class IterationCreate extends BaseCommand {
  static description = 'Create an iteration in an explicit team workspace';
  static flags = {
    ...iterationFlags,
    ...iterationEditFlags,
    workspace: Flags.string({
      description: 'Team workspace ID/reference (required)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --workspace to create an iteration.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await iterationPatch(flags, true);
    await this.initAPI();
    await resolveIterationIds(this.api, patch);
    const result = await this.api.post(`/api/v3/iterations?${query}`, {
      body: { record: patch },
    });
    const iteration = (result.body as { record: IterationRecord }).record;
    warnEmbedded(iteration);
    printRecordResult(this, iteration, 'Created iteration');
  }
}
