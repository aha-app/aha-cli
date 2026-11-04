import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import {
  RequirementRecord,
  requirementFlags,
  requirementEditFlags,
  requirementPatch,
  resolveRequirementIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/requirement-api';

export default class RequirementCreate extends BaseCommand {
  static description = 'Create a requirement under an explicit feature';
  static flags = { ...requirementFlags, ...requirementEditFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --feature to create a requirement.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await requirementPatch(flags, true);
    await this.initAPI();
    await resolveRequirementIds(this.api, patch);
    const result = await this.api.post(`/api/v3/requirements?${query}`, {
      body: { record: patch },
    });
    const requirement = (result.body as { record: RequirementRecord }).record;
    warnEmbedded(requirement);
    printRecordResult(this, requirement, 'Created requirement');
  }
}
