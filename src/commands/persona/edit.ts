import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  PersonaRecord,
  personaFlags,
  personaEditFlags,
  personaIdentifier,
  personaPatch,
  resolvePersonaIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/persona-api';

export default class PersonaEdit extends BaseCommand {
  static description = 'Edit only the supplied persona fields';
  static args = '<id-or-reference>';
  static flags = { ...personaFlags, ...personaEditFlags };
  async run() {
    const id = personaIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await personaPatch(this.flags, false);
    await this.initAPI();
    await resolvePersonaIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/personas/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const persona = (result.body as { record: PersonaRecord }).record;
    warnEmbedded(persona);
    printRecordResult(this, persona, 'Updated persona');
  }
}
