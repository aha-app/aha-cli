import BaseCommand from '../../base';
import { printRecordResult } from '../../lib/record-output';
import { warnEmbedded } from '../../lib/record-api';
import {
  CustomFieldRecord,
  customFieldFlags,
  customFieldIdentifier,
  optionResource,
  fetchCustomField,
  optionEditFlags,
  optionPatch,
  validateOptionContext,
  fieldQuery,
} from '../../lib/custom-field-api';
export default class CustomFieldOptionEdit extends BaseCommand {
  static description = 'Edit only supplied custom field option fields';
  static args = '<numeric-id>';
  static flags = { ...customFieldFlags(true), ...optionEditFlags };
  async run() {
    const id = customFieldIdentifier(
      this.parse().argv,
      'custom-field-option',
      'edit'
    );
    const query = fieldQuery(this.flags);
    const patch = await optionPatch(this.flags, false, this.argv);
    await this.initAPI();
    const current = await fetchCustomField(
      this.api,
      optionResource,
      id,
      new URLSearchParams({ fields: 'id,custom_field_definition' })
    );
    if (!current.custom_field_definition)
      throw new Error(
        'The API did not return the owning definition; nothing was written.'
      );
    validateOptionContext(patch, current.custom_field_definition);
    const result = await this.api.put(
      `/api/v3/${optionResource}/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const record = (result.body as { record: CustomFieldRecord }).record;
    warnEmbedded(record);
    printRecordResult(this, record, 'Updated custom-field-option');
  }
}
