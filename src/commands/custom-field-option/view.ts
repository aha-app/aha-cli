import BaseCommand from '../../base';
import {
  customFieldFlags,
  customFieldIdentifier,
  fieldQuery,
  fetchCustomField,
  printCustomField,
  optionResource,
} from '../../lib/custom-field-api';
export default class CustomFieldOptionView extends BaseCommand {
  static description = 'View a custom field option by numeric ID';
  static args = '<numeric-id>';
  static flags = customFieldFlags(true);
  async run() {
    const id = customFieldIdentifier(
      this.parse().argv,
      'custom-field-option',
      'view'
    );
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printCustomField(
      this,
      await fetchCustomField(this.api, optionResource, id, query)
    );
  }
}
