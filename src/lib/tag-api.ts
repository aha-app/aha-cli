import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
import { recordPatch, warnEmbedded } from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
export interface TagRecord {
  id: string;
  name?: string;
  type?: string;
  color?: string;
}
export const tagFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description: 'Comma-separated API v3 fields',
    default: 'default,type,color',
  }),
};
export const tagEditFlags = {
  title: Flags.string({ char: 't', description: 'Tag name' }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  type: Flags.string({
    description:
      'general or research (requires Discovery); an existing tag cannot change type',
  }),
  color: Flags.string({ description: 'Hex color, e.g. #123456' }),
};
export function tagIdentifier(args: string[], action: string) {
  if (args.length !== 1 || !/^\d+$/.test(args[0]))
    throw new Error(
      `Usage: aha tag ${action} <tag-id>. Look up IDs with aha tag list.`
    );
  return args[0];
}
export function tagPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'tag',
    writable: new Set(['name', 'type', 'color']),
    flagKeys: { title: 'name', type: 'type', color: 'color' },
    references: {},
    validate(patch, create) {
      if (create && !patch.name)
        throw new Error('A title is required. Use --title or --input.');
      if (!create && !Object.keys(patch).length)
        throw new Error('Supply at least one field to edit.');
      if (
        'type' in patch &&
        (typeof patch.type !== 'string' ||
          !['general', 'research'].includes(patch.type))
      )
        throw new Error('type must be general or research.');
      if ('color' in patch && typeof patch.color !== 'string')
        throw new Error('color must be a string hex value.');
    },
  });
}
export async function fetchTag(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<TagRecord> {
  const result = await api.get(
    `/api/v3/tags/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: TagRecord }).record;
}
export function tagRow(tag: TagRecord) {
  return [tag.id, '—', tag.type || '—', tag.color || '—', tag.name || ''];
}
export function printTag(command: BaseCommand, tag: TagRecord) {
  warnEmbedded(tag);
  if (command.flags.json) command.log(JSON.stringify(tag, null, 2));
  else {
    command.log(`${tag.id}${tag.name ? `: ${tag.name}` : ''}`);
    if (tag.type) command.log(`Type: ${tag.type}`);
    if (tag.color) command.log(`Color: ${tag.color}`);
  }
}
