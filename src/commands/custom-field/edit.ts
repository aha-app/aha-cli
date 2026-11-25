import BaseCommand from '../../base';
import { printRecordResult } from '../../lib/record-output';
import { warnEmbedded } from '../../lib/record-api';
import {
  CustomFieldRecord,
  customFieldFlags,
  customFieldIdentifier,
  definitionResource,
  fetchCustomField,
  definitionEditFlags,
  definitionPatch,
  validateDefinitionContext,
  fieldQuery,
} from '../../lib/custom-field-api';
export default class CustomFieldEdit extends BaseCommand {
  static description = 'Edit only supplied custom field definition fields';
  static args = '<numeric-id>';
  static flags = { ...customFieldFlags(false), ...definitionEditFlags };
  async run() {
    const id = customFieldIdentifier(this.parse().argv, 'custom-field', 'edit');
    const query = fieldQuery(this.flags);
    const patch = await definitionPatch(this.flags, false);
    await this.initAPI();
    const current = await fetchCustomField(
      this.api,
      definitionResource,
      id,
      new URLSearchParams({ fields: 'id,type,record_type,worksheet_rows' })
    );
    warnEmbedded(current);
    validateDefinitionContext(patch, current);
    const result = await this.api.put(
      `/api/v3/${definitionResource}/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const record = (result.body as { record: CustomFieldRecord }).record;
    warnEmbedded(record);
    printRecordResult(this, record, 'Updated custom-field');
  }
}
