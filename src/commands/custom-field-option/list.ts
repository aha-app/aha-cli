import BaseCommand from '../../base';
import {
  customFieldFlags,
  optionResource,
  definitionParentFlag,
  numericId,
} from '../../lib/custom-field-api';
import {
  recordListFlags,
  recordListQuery,
  listRecords,
} from '../../lib/record-list';
export default class CustomFieldOptionList extends BaseCommand {
  static description =
    'List and filter custom field options, including hidden choices';
  static flags = {
    ...customFieldFlags(true),
    ...recordListFlags,
    definition: definitionParentFlag,
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha custom-field-option list [flags]');
    const query = recordListQuery(this.flags);
    const parent = {
      custom_field_definition_id: numericId(
        this.flags.definition,
        '--definition'
      ),
    };
    await this.initAPI();
    await listRecords(
      this,
      optionResource,
      'custom-field-option',
      parent,
      query
    );
  }
}
