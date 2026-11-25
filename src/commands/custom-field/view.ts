import BaseCommand from '../../base';
import {
  customFieldFlags,
  customFieldIdentifier,
  fieldQuery,
  fetchCustomField,
  printCustomField,
  definitionResource,
} from '../../lib/custom-field-api';
export default class CustomFieldView extends BaseCommand {
  static description = 'View a custom field definition by numeric ID';
  static args = '<numeric-id>';
  static flags = customFieldFlags(false);
  async run() {
    const id = customFieldIdentifier(this.parse().argv, 'custom-field', 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printCustomField(
      this,
      await fetchCustomField(this.api, definitionResource, id, query)
    );
  }
}
