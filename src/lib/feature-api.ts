import { recordIdentifier, recordPatch, resolveRecordIds } from './record-api';
export { object, fieldQuery, warnEmbedded } from './record-api';
import { warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

export interface FeatureRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  status?: { name?: string };
  [key: string]: unknown;
}

export const featureFields =
  'default,description,status,type,assigned_to_user,project,release';
export const featureFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: featureFields,
  }),
};
export const featureEditFlags = {
  title: Flags.string({ char: 't', description: 'Feature title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description of the feature (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  release: Flags.string({
    description: 'Release ID/reference (moves an existing feature)',
  }),
  owner: Flags.string({
    description: 'Owner user ID or @me; use JSON null to clear',
  }),
  status: Flags.string({ description: 'Workflow status ID' }),
  type: Flags.string({ description: 'Workflow type ID' }),
  team: Flags.string({ description: 'Team workspace ID/reference' }),
  teamStatus: Flags.string({ description: 'Team workflow status ID' }),
  iteration: Flags.string({ description: 'Iteration ID/reference' }),
  epic: Flags.string({ description: 'Epic ID/reference' }),
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
  'type_id',
  'assigned_to_user_id',
  'created_by_user_id',
  'release_id',
  'project_id',
  'epic_id',
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
  type: 'type_id',
  team: 'team_id',
  teamStatus: 'team_status_id',
  iteration: 'iteration_id',
  epic: 'epic_id',
  initiative: 'initiative_id',
  startDate: 'start_date',
  endDate: 'end_date',
  workspace: 'project_id',
};
const references: Record<string, string> = {
  project_id: 'projects',
  release_id: 'releases',
  epic_id: 'epics',
  initiative_id: 'initiatives',
  iteration_id: 'iterations',
  team_id: 'projects',
  release_phase_id: 'release_phases',
  program_increment_id: 'program_increments',
};

export function featureIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'feature');
}
export function featurePatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'feature',
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
            'Move a feature with --release; its workspace cannot be edited directly.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
    },
  });
}
export function resolveFeatureIds(api: AhaAPI, patch: Record<string, unknown>) {
  return resolveRecordIds(api, patch, references);
}

export async function fetchFeature(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<FeatureRecord> {
  const result = await api.get(
    `/api/v3/features/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: FeatureRecord }).record;
}

export function printFeature(command: BaseCommand, feature: FeatureRecord) {
  warnEmbedded(feature);
  if (command.flags.json) command.log(JSON.stringify(feature, null, 2));
  else {
    command.log(
      `${feature.reference_num || feature.id || 'Feature'}${
        feature.name ? `: ${feature.name}` : ''
      }`
    );
    if (feature.status?.name) command.log(`Status: ${feature.status.name}`);
    if (feature.description?.body)
      command.log(descriptionText(feature.description.body));
    if (feature.html_url) command.log(feature.html_url);
  }
}
