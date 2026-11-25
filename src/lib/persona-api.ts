import {
  recordIdentifier,
  recordPatch,
  resolveRecordIds,
  warnEmbedded,
} from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

export interface PersonaRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  occupation?: string;
  quote?: string;
  color?: string;
  project?: { id: string; name?: string; reference_prefix?: string };
}
export const personaFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: 'default,project,occupation,quote,color',
  }),
};
export const personaEditFlags = {
  title: Flags.string({ char: 't', description: 'Persona title' }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  occupation: Flags.string({
    description: 'Occupation text (empty clears it)',
  }),
  quote: Flags.string({ description: 'Quote text (empty clears it)' }),
  color: Flags.string({ description: 'Six-digit hex color, e.g. #123456' }),
};
const writable = new Set([
  'name',
  'occupation',
  'quote',
  'color',
  'watchers',
  'custom_fields',
  'project_id',
]);
const references = { project_id: 'projects' };
export function personaIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'persona');
}
export function personaPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'persona',
    writable,
    references,
    flagKeys: {
      title: 'name',
      workspace: 'project_id',
      occupation: 'occupation',
      quote: 'quote',
      color: 'color',
    },
    validate(patch, create) {
      if (create) {
        if (!patch.name)
          throw new Error('A title is required. Use --title or --input.');
        if (!patch.project_id)
          throw new Error(
            'Create requires --workspace (or project_id in --input).'
          );
      } else {
        if ('project_id' in patch)
          throw new Error(
            'The workspace can only be set when creating a persona.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      for (const key of ['occupation', 'quote'])
        if (key in patch && typeof patch[key] !== 'string')
          throw new Error(`${key} must be a string.`);
      // PersonaConverter otherwise silently ignores unrecognized color strings.
      if (
        'color' in patch &&
        (typeof patch.color !== 'string' ||
          !/^#[0-9a-f]{6}$/i.test(patch.color))
      )
        throw new Error('color must be a six-digit hex string, e.g. #123456.');
    },
  });
}
export function resolvePersonaIds(api: AhaAPI, patch: Record<string, unknown>) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchPersona(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<PersonaRecord> {
  const result = await api.get(
    `/api/v3/personas/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: PersonaRecord }).record;
}
export function printPersona(command: BaseCommand, persona: PersonaRecord) {
  warnEmbedded(persona);
  if (command.flags.json) command.log(JSON.stringify(persona, null, 2));
  else {
    command.log(
      `${persona.reference_num || persona.id}${
        persona.name ? `: ${persona.name}` : ''
      }`
    );
    if (persona.project)
      command.log(
        `Workspace: ${
          persona.project.name ||
          persona.project.reference_prefix ||
          persona.project.id
        }`
      );
    if (typeof persona.occupation === 'string')
      command.log(`Occupation: ${persona.occupation}`);
    if (typeof persona.quote === 'string')
      command.log(`Quote: ${persona.quote}`);
    if (persona.color) command.log(`Color: ${persona.color}`);
    if (persona.html_url) command.log(persona.html_url);
  }
}
