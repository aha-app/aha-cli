import {
  recordIdentifier,
  recordPatch,
  resolveRecordIds,
  RecordSummary,
} from './record-api';
export { object, fieldQuery, warnEmbedded } from './record-api';
import { warnEmbedded } from './record-api';
import { descriptionText, printTable } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

export interface EpicRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  status?: { name?: string };
  features?: { records: RecordSummary[]; has_more: boolean };
  [key: string]: unknown;
}

export const epicFields =
  'default,description,status,assigned_to_user,project,release,features';
export const epicFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: epicFields,
  }),
};
export const epicEditFlags = {
  title: Flags.string({ char: 't', description: 'Epic title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description of the epic (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  release: Flags.string({
    description: 'Release ID/reference (moves an existing epic)',
  }),
  owner: Flags.string({
    description: 'Owner user ID or @me; use JSON null to clear',
  }),
  status: Flags.string({ description: 'Workflow status ID' }),
  team: Flags.string({ description: 'Team workspace ID/reference' }),
  teamStatus: Flags.string({ description: 'Team workflow status ID' }),
  iteration: Flags.string({ description: 'Iteration ID/reference' }),
  initiative: Flags.string({ description: 'Initiative ID/reference' }),
  startDate: Flags.string({ description: 'Start date, YYYY-MM-DD' }),
  endDate: Flags.string({ description: 'End date, YYYY-MM-DD' }),
};

const writable = new Set([
  'name',
  'description',
  'position',
  'start_date',
  'end_date',
  'duration_source',
  'score',
  'progress_source',
  'progress',
  'estimate_source',
  'initial_estimate',
  'detailed_estimate',
  'remaining_estimate',
  'work_done',
  'iteration_id',
  'status_id',
  'assigned_to_user_id',
  'created_by_user_id',
  'release_id',
  'project_id',
  'initiative_id',
  'release_phase_id',
  'team_id',
  'team_status_id',
  'program_increment_id',
  'time_code_id',
  'tags',
  'goals',
  'key_results',
  'score_facts',
  'watchers',
  'custom_fields',
]);
const flagKeys: Record<string, string> = {
  title: 'name',
  body: 'description',
  release: 'release_id',
  owner: 'assigned_to_user_id',
  status: 'status_id',
  team: 'team_id',
  teamStatus: 'team_status_id',
  iteration: 'iteration_id',
  initiative: 'initiative_id',
  startDate: 'start_date',
  endDate: 'end_date',
  workspace: 'project_id',
};
const references: Record<string, string> = {
  project_id: 'projects',
  release_id: 'releases',
  initiative_id: 'initiatives',
  iteration_id: 'iterations',
  team_id: 'projects',
  release_phase_id: 'release_phases',
  program_increment_id: 'program_increments',
};

export function epicIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'epic');
}
export function epicPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'epic',
    writable,
    flagKeys,
    references,
    validate(patch, create) {
      if (create) {
        if (!patch.name)
          throw new Error('A title is required. Use --title or --input.');
        if (Boolean(patch.project_id) === Boolean(patch.release_id))
          throw new Error(
            'Create requires exactly one --workspace or --release (or its ID in --input).'
          );
      } else {
        if ('project_id' in patch)
          throw new Error(
            'Move an epic with --release; its workspace cannot be edited directly.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
    },
  });
}
export function resolveEpicIds(api: AhaAPI, patch: Record<string, unknown>) {
  return resolveRecordIds(api, patch, references);
}

export async function fetchEpic(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<EpicRecord> {
  const result = await api.get(
    `/api/v3/epics/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: EpicRecord }).record;
}

export function printEpic(command: BaseCommand, epic: EpicRecord) {
  warnEmbedded(epic);
  if (epic.features?.has_more)
    console.error(
      `Use aha feature list --filters '{"eq[epic.id]":"${epic.id}"}' to retrieve all associated features.`
    );
  if (command.flags.json) command.log(JSON.stringify(epic, null, 2));
  else {
    command.log(
      `${epic.reference_num || epic.id || 'Epic'}${
        epic.name ? `: ${epic.name}` : ''
      }`
    );
    if (epic.status?.name) command.log(`Status: ${epic.status.name}`);
    if (epic.description?.body)
      command.log(descriptionText(epic.description.body));
    if (epic.features) {
      command.log('Features:');
      printTable(
        command,
        ['ID', 'STATE', 'TITLE'],
        epic.features.records.map(record => [
          record.reference_num || record.id,
          record.status?.name || '—',
          record.name || '',
        ])
      );
      if (epic.features.has_more)
        command.log('More features are available; see the warning above.');
    }
    if (epic.html_url) command.log(epic.html_url);
  }
}
