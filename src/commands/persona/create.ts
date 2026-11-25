import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  PersonaRecord,
  personaFlags,
  personaEditFlags,
  personaPatch,
  resolvePersonaIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/persona-api';

export default class PersonaCreate extends BaseCommand {
  static description = 'Create a persona in an explicit workspace';
  static flags = {
    ...personaFlags,
    ...personaEditFlags,
    workspace: Flags.string({
      description: 'Workspace ID/reference (required)',
    }),
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --workspace to create a persona.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await personaPatch(flags, true);
    await this.initAPI();
    await resolvePersonaIds(this.api, patch);
    const result = await this.api.post(`/api/v3/personas?${query}`, {
      body: { record: patch },
    });
    const persona = (result.body as { record: PersonaRecord }).record;
    warnEmbedded(persona);
    printRecordResult(this, persona, 'Created persona');
  }
}
