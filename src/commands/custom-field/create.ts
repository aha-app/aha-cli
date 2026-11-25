import BaseCommand from '../../base';
import { promptForTitle } from '../../lib/record-input';
import { printRecordResult } from '../../lib/record-output';
import { warnEmbedded } from '../../lib/record-api';
import {
  CustomFieldRecord,
  customFieldFlags,
  definitionResource,
  definitionCreateFlags,
  definitionPatch,
  fieldQuery,
} from '../../lib/custom-field-api';
export default class CustomFieldCreate extends BaseCommand {
  static description = 'Create a custom field definition';
  static flags = { ...customFieldFlags(false), ...definitionCreateFlags };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title to create a custom-field.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await definitionPatch(flags, true);
    await this.initAPI();

    const result = await this.api.post(
      `/api/v3/${definitionResource}?${query}`,
      { body: { record: patch } }
    );
    const record = (result.body as { record: CustomFieldRecord }).record;
    warnEmbedded(record);
    printRecordResult(this, record, 'Created custom-field');
  }
}
