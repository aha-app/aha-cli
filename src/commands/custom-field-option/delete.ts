import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  customFieldFlags,
  customFieldIdentifier,
  fetchCustomField,
  optionResource,
} from '../../lib/custom-field-api';

export default class CustomFieldOptionDelete extends BaseCommand {
  static description =
    'Delete an option and remove it from values; deletes conditional children too';
  static args = '<numeric-id>';
  static flags = {
    ...BaseCommand.flags,
    json: customFieldFlags(true).json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = customFieldIdentifier(
      this.parse().argv,
      'custom-field-option',
      'delete'
    );
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete an option without an interactive confirmation.'
      );
    await this.initAPI();
    const option = await fetchCustomField(
      this.api,
      optionResource,
      id,
      new URLSearchParams({ fields: 'id,name' })
    );
    if (typeof option.id !== 'string' || !/^\d+$/.test(option.id))
      throw new Error(
        'The API did not return a valid option ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${option.name}" and its conditional children, removing these choices from record values?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(
      `/api/v3/custom_field_options/${encodeURIComponent(option.id)}`
    );
    if (this.flags.json)
      this.log(JSON.stringify({ id: option.id, deleted: true }, null, 2));
    else this.log(`Deleted option: ${option.id}`);
  }
}
