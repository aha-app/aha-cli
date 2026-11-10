import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  RequirementRecord,
  requirementFlags,
  requirementEditFlags,
  requirementIdentifier,
  requirementPatch,
  resolveRequirementIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/requirement-api';

export default class RequirementEdit extends BaseCommand {
  static description =
    'Edit only the supplied requirement fields and collection patches';
  static args = '<id-or-reference>';
  static flags = { ...requirementFlags, ...requirementEditFlags };
  async run() {
    const id = requirementIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await requirementPatch(this.flags, false);
    await this.initAPI();
    await resolveRequirementIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/requirements/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const requirement = (result.body as { record: RequirementRecord }).record;
    warnEmbedded(requirement);
    printRecordResult(this, requirement, 'Updated requirement');
  }
}
