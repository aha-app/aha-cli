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

export interface CompetitorRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  subtitle?: string;
  website?: string;
  color?: string;
  project?: { id: string; name?: string; reference_prefix?: string };
}
export const competitorFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: 'default,project,subtitle,website,color',
  }),
};
export const competitorEditFlags = {
  title: Flags.string({ char: 't', description: 'Competitor title' }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  subtitle: Flags.string({
    description: 'Subtitle text (empty clears it)',
  }),
  website: Flags.string({ description: 'Website text (empty clears it)' }),
  color: Flags.string({ description: 'Six-digit hex color, e.g. #123456' }),
};
const writable = new Set([
  'name',
  'subtitle',
  'website',
  'color',
  'custom_fields',
  'project_id',
]);
const references = { project_id: 'projects' };
export function competitorIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'competitor');
}
export function competitorPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'competitor',
    writable,
    references,
    flagKeys: {
      title: 'name',
      workspace: 'project_id',
      subtitle: 'subtitle',
      website: 'website',
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
            'The workspace can only be set when creating a competitor.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      for (const key of ['subtitle', 'website'])
        if (key in patch && typeof patch[key] !== 'string')
          throw new Error(`${key} must be a string.`);
      // CompetitorConverter otherwise silently ignores unrecognized color strings.
      if (
        'color' in patch &&
        (typeof patch.color !== 'string' ||
          !/^#[0-9a-f]{6}$/i.test(patch.color))
      )
        throw new Error('color must be a six-digit hex string, e.g. #123456.');
    },
  });
}
export function resolveCompetitorIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchCompetitor(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<CompetitorRecord> {
  const result = await api.get(
    `/api/v3/competitors/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: CompetitorRecord }).record;
}
export function printCompetitor(
  command: BaseCommand,
  competitor: CompetitorRecord
) {
  warnEmbedded(competitor);
  if (command.flags.json) command.log(JSON.stringify(competitor, null, 2));
  else {
    command.log(
      `${competitor.reference_num || competitor.id}${
        competitor.name ? `: ${competitor.name}` : ''
      }`
    );
    if (competitor.project)
      command.log(
        `Workspace: ${
          competitor.project.name ||
          competitor.project.reference_prefix ||
          competitor.project.id
        }`
      );
    if (typeof competitor.subtitle === 'string')
      command.log(`Subtitle: ${competitor.subtitle}`);
    if (typeof competitor.website === 'string')
      command.log(`Website: ${competitor.website}`);
    if (competitor.color) command.log(`Color: ${competitor.color}`);
    if (competitor.html_url) command.log(competitor.html_url);
  }
}
