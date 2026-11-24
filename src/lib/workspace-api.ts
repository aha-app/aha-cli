import { recordPatch, resolveRecordIds, warnEmbedded } from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

interface WorkspaceSummary {
  id: string;
  reference_prefix?: string;
  name?: string;
}
export interface WorkspaceRecord extends WorkspaceSummary {
  html_url?: string;
  type?: string;
  line?: boolean;
  parent?: WorkspaceSummary | null;
  children?: { records: WorkspaceSummary[]; has_more?: boolean };
  description?: { body: string };
}
export const workspaceFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: 'default,type,line,parent,children,description',
  }),
};
export const workspaceEditFlags = {
  title: Flags.string({ char: 't', description: 'Workspace title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  prefix: Flags.string({
    description: 'Workspace reference prefix (required on create)',
  }),
  parent: Flags.string({
    description:
      'Parent workspace line ID/prefix; use parent_id: null in JSON to clear',
  }),
};
// The published v3 project inputs do not expose type/line changes or deletion.
const writable = new Set([
  'name',
  'reference_prefix',
  'parent_id',
  'description',
  'custom_fields',
  'watchers',
]);
const references = { parent_id: 'projects' };
export function workspaceIdentifier(args: string[], action: string) {
  if (args.length !== 1 || !/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(args[0]))
    throw new Error(`Usage: aha workspace ${action} <id-or-prefix>`);
  return args[0];
}
export function workspacePatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'workspace',
    writable,
    flagKeys: {
      title: 'name',
      body: 'description',
      prefix: 'reference_prefix',
      parent: 'parent_id',
    },
    references,
    validate(patch, create) {
      if (create && !patch.name)
        throw new Error('A title is required. Use --title or --input.');
      if (create && !patch.reference_prefix)
        throw new Error(
          'Create requires --prefix (or reference_prefix in --input).'
        );
      if (
        'reference_prefix' in patch &&
        (typeof patch.reference_prefix !== 'string' ||
          !patch.reference_prefix.trim())
      )
        throw new Error('reference_prefix must be a nonempty string.');
      if (!create && !Object.keys(patch).length)
        throw new Error('Supply at least one field to edit.');
    },
  });
}
export function resolveWorkspaceIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchWorkspace(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<WorkspaceRecord> {
  const result = await api.get(
    `/api/v3/projects/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: WorkspaceRecord }).record;
}
export function workspaceRow(workspace: WorkspaceRecord) {
  return [
    workspace.id,
    '—',
    workspace.reference_prefix || '—',
    workspace.type || '—',
    workspace.parent?.reference_prefix || workspace.parent?.id || '—',
    workspace.name || '',
  ];
}
export function printWorkspace(
  command: BaseCommand,
  workspace: WorkspaceRecord
) {
  warnEmbedded(workspace);
  if (command.flags.json) command.log(JSON.stringify(workspace, null, 2));
  else {
    command.log(
      `${workspace.reference_prefix || workspace.id}${
        workspace.name ? `: ${workspace.name}` : ''
      }`
    );
    command.log(`ID: ${workspace.id}`);
    if (workspace.type) command.log(`Type: ${workspace.type}`);
    if (typeof workspace.line === 'boolean')
      command.log(`Workspace line: ${workspace.line ? 'yes' : 'no'}`);
    if (workspace.parent)
      command.log(
        `Parent: ${workspace.parent.reference_prefix || workspace.parent.id}${
          workspace.parent.name ? `: ${workspace.parent.name}` : ''
        }`
      );
    if (workspace.children?.records.length)
      command.log(
        `Children: ${workspace.children.records
          .map(child => child.reference_prefix || child.id)
          .join(', ')}`
      );
    if (workspace.description?.body)
      command.log(descriptionText(workspace.description.body));
    if (workspace.html_url) command.log(workspace.html_url);
  }
}
