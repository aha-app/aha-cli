import BaseCommand from '../../base';
import {
  personaFlags,
  personaIdentifier,
  fieldQuery,
  fetchPersona,
  printPersona,
} from '../../lib/persona-api';

export default class PersonaView extends BaseCommand {
  static description = 'View a persona by ID or reference';
  static args = '<id-or-reference>';
  static flags = personaFlags;
  async run() {
    const id = personaIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printPersona(this, await fetchPersona(this.api, id, query));
  }
}
