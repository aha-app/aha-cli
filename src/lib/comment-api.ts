import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
import { recordPatch, resolveRecordIds, warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
export { fieldQuery, warnEmbedded } from './record-api';

export interface CommentRecord {
  id: string;
  body?: string;
  html_url?: string;
  user?: { id: string; name?: string };
  record?: { id: string; type?: string; name?: string };
  parent?: { id: string } | null;
}
export const commentFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: 'default,user,record,parent',
  }),
};
export const commentEditFlags = {
  body: Flags.string({
    char: 'b',
    description: 'Comment body as plain text; use JSON input for HTML',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
};
export const commentContextFlags = {
  record: Flags.string({
    description: 'Owning record ID/reference; supply with --record-type',
  }),
  recordType: Flags.string({
    description:
      'Owning API v3 record type, e.g. feature, requirement, or release',
  }),
};
export function commentIdentifier(args: string[], action: string) {
  if (args.length !== 1 || !/^\d+$/.test(args[0]))
    throw new Error(`Usage: aha comment ${action} <comment-id>`);
  return args[0];
}
function validateContext(patch: Record<string, unknown>) {
  if (
    typeof patch.record_id !== 'string' ||
    !/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(patch.record_id) ||
    typeof patch.record_type !== 'string' ||
    !/^[a-z_]+$/.test(patch.record_type)
  )
    throw new Error(
      'Supply an owning record ID/reference and type together: --record and --record-type (or record_id and record_type in JSON).'
    );
}
export function commentContext(flags: Record<string, string | boolean>) {
  const patch: Record<string, unknown> = {};
  if (flags.record !== undefined || flags.recordType !== undefined) {
    patch.record_id = flags.record;
    patch.record_type = flags.recordType;
    validateContext(patch);
  }
  return patch;
}
export function commentPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'comment',
    writable: new Set(
      create ? ['body', 'record_id', 'record_type', 'parent_id'] : ['body']
    ),
    flagKeys: create
      ? {
          body: 'body',
          record: 'record_id',
          recordType: 'record_type',
          replyTo: 'parent_id',
        }
      : { body: 'body' },
    // A polymorphic reference is validated here and resolved using its type below.
    references: { record_id: 'polymorphic' },
    validate(patch) {
      if (
        typeof patch.body !== 'string' ||
        !patch.body.trim() ||
        (typeof flags.body === 'string' && !flags.body.trim())
      )
        throw new Error(
          'A nonempty body is required. Use --body or body in --input.'
        );
      if (create) validateContext(patch);
      if (
        'parent_id' in patch &&
        (typeof patch.parent_id !== 'string' || !/^\d+$/.test(patch.parent_id))
      )
        throw new Error(
          'parent_id must be the string ID of a top-level comment.'
        );
    },
  });
}
// Published v3 single-record endpoints. Types without one require a numeric ID.
const parentResources = new Map(
  Object.entries({
    annotation: 'annotations',
    business_model: 'strategy_models',
    competitor: 'competitors',
    epic: 'epics',
    feature: 'features',
    idea: 'ideas',
    idea_organization: 'idea_organizations',
    initiative: 'initiatives',
    iteration: 'iterations',
    document: 'documents',
    vision_component: 'strategy_vision_components',
    persona: 'personas',
    program_increment: 'program_increments',
    project: 'projects',
    vision: 'strategy_visions',
    release: 'releases',
    release_phase: 'release_phases',
    requirement: 'requirements',
    goal: 'goals',
    key_result: 'key_results',
    interview: 'discovery_interviews',
    study: 'discovery_studies',
    task: 'tasks',
  })
);
export async function resolveCommentContext(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  if (typeof patch.record_id !== 'string' || /^\d+$/.test(patch.record_id))
    return;
  const resource = parentResources.get(String(patch.record_type));
  if (!resource)
    throw new Error(
      'Use a numeric owning record ID for this type; no published v3 reference lookup endpoint is available.'
    );
  await resolveRecordIds(api, patch, { record_id: resource });
}
export async function fetchComment(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<CommentRecord> {
  const result = await api.get(
    `/api/v3/comments/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: CommentRecord }).record;
}
export function commentRow(comment: CommentRecord) {
  return [
    comment.id,
    '—',
    comment.record
      ? `${comment.record.type || ''} ${comment.record.id}`.trim()
      : '—',
    comment.parent?.id || '—',
    descriptionText(comment.body || '')
      .replace(/\s+/g, ' ')
      .slice(0, 120),
  ];
}
export function printComment(command: BaseCommand, comment: CommentRecord) {
  warnEmbedded(comment);
  if (command.flags.json) command.log(JSON.stringify(comment, null, 2));
  else {
    command.log(`Comment: ${comment.id}`);
    if (comment.record)
      command.log(
        `Record: ${comment.record.type || ''} ${comment.record.id}${
          comment.record.name ? `: ${comment.record.name}` : ''
        }`
      );
    if (comment.parent) command.log(`Reply to comment: ${comment.parent.id}`);
    if (comment.user)
      command.log(`Author: ${comment.user.name || comment.user.id}`);
    if (comment.body) command.log(descriptionText(comment.body));
    if (comment.html_url) command.log(comment.html_url);
  }
}
