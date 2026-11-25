import { prompt } from 'inquirer';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  personaFlags,
  personaIdentifier,
  fetchPersona,
} from '../../lib/persona-api';

export default class PersonaDelete extends BaseCommand {
  static description = 'Delete a persona (requires --yes in scripts)';
  static args = '<id-or-reference>';
  static flags = {
    ...BaseCommand.flags,
    json: personaFlags.json,
    yes: Flags.boolean({
      char: 'y',
      description: 'Confirm deletion without prompting',
    }),
  };
  async run() {
    const id = personaIdentifier(this.parse().argv, 'delete');
    if (!this.flags.yes && (!process.stdin.isTTY || this.flags.json))
      throw new Error(
        'Use --yes to delete a persona without an interactive confirmation.'
      );
    await this.initAPI();
    const persona = await fetchPersona(
      this.api,
      id,
      new URLSearchParams({ fields: 'id,name,reference_num' })
    );
    if (typeof persona.id !== 'string' || !/^\d+$/.test(persona.id))
      throw new Error(
        'The API did not return a valid persona ID; nothing was deleted.'
      );
    if (!this.flags.yes) {
      const { confirmed } = await prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        default: false,
        message: `Delete "${persona.name}"?`,
      });
      if (!confirmed) {
        this.log('Deletion canceled.');
        return;
      }
    }
    await this.api.delete(`/api/v3/personas/${encodeURIComponent(persona.id)}`);
    if (this.flags.json)
      this.log(JSON.stringify({ id: persona.id, deleted: true }, null, 2));
    else this.log(`Deleted persona: ${persona.reference_num || persona.id}`);
  }
}
