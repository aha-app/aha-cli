import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import { promptForTitle } from '../../lib/record-input';
import { printRecordResult } from '../../lib/record-output';
import { warnEmbedded } from '../../lib/record-api';
import {
  CustomFieldRecord,
  customFieldFlags,
  optionResource,
  optionEditFlags,
  definitionParentFlag,
  optionPatch,
  fetchCustomField,
  definitionResource,
  validateOptionContext,
  fieldQuery,
} from '../../lib/custom-field-api';
export default class CustomFieldOptionCreate extends BaseCommand {
  static description = 'Create a custom field option';
  static flags = {
    ...customFieldFlags(true),
    ...optionEditFlags,
    definition: definitionParentFlag,
    parent: Flags.string({
      description: 'Conditional choice parent option ID (create only)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title to create a custom-field-option.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await optionPatch(flags, true, this.argv);
    await this.initAPI();
    const definition = await fetchCustomField(
      this.api,
      definitionResource,
      String(patch.custom_field_definition_id),
      new URLSearchParams({ fields: 'id,type,record_type' })
    );
    validateOptionContext(patch, definition);
    const result = await this.api.post(`/api/v3/${optionResource}?${query}`, {
      body: { record: patch },
    });
    const record = (result.body as { record: CustomFieldRecord }).record;
    warnEmbedded(record);
    printRecordResult(this, record, 'Created custom-field-option');
  }
}
