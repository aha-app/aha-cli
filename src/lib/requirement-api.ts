import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
import { descriptionText } from './record-output';
import {
  warnEmbedded,
  recordIdentifier,
  recordPatch,
  resolveRecordIds,
} from './record-api';
export { object, fieldQuery, warnEmbedded } from './record-api';
export interface RequirementRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  status?: { name?: string };
  [key: string]: unknown;
}

export const requirementFields =
  'default,description,status,assigned_to_user,feature';
export const requirementFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: requirementFields,
  }),
};
export const requirementEditFlags = {
  title: Flags.string({ char: 't', description: 'Requirement title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description of the requirement (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  feature: Flags.string({ description: 'Parent feature ID/reference' }),
  position: Flags.string({
    description: 'Integer position relative to sibling requirements',
  }),
  owner: Flags.string({
    description: 'Owner user ID or @me; use JSON null to clear',
  }),
  status: Flags.string({ description: 'Workflow status ID' }),
  team: Flags.string({ description: 'Team workspace ID/reference' }),
  teamStatus: Flags.string({ description: 'Team workflow status ID' }),
  iteration: Flags.string({ description: 'Iteration ID/reference' }),
  startDate: Flags.string({ description: 'Start date, YYYY-MM-DD' }),
  endDate: Flags.string({ description: 'End date, YYYY-MM-DD' }),
};

const writable = new Set([
  'name',
  'description',
  'position',
  'start_date',
  'end_date',
  'initial_estimate',
  'detailed_estimate',
  'remaining_estimate',
  'work_done',
  'status_id',
  'assigned_to_user_id',
  'created_by_user_id',
  'feature_id',
  'iteration_id',
  'team_id',
  'team_status_id',
  'program_increment_id',
  'time_code_id',
  'tags',
  'custom_fields',
]);
const flagKeys: Record<string, string> = {
  title: 'name',
  body: 'description',
  feature: 'feature_id',
  position: 'position',
  owner: 'assigned_to_user_id',
  status: 'status_id',
  team: 'team_id',
  teamStatus: 'team_status_id',
  iteration: 'iteration_id',
  startDate: 'start_date',
  endDate: 'end_date',
};
const references: Record<string, string> = {
  feature_id: 'features',
  iteration_id: 'iterations',
  team_id: 'projects',
  program_increment_id: 'program_increments',
};
export function requirementIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'requirement');
}
export function requirementPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'requirement',
    writable,
    flagKeys,
    references,
    validate(patch, create) {
      if ('position' in patch) {
        if (typeof flags.position === 'string') {
          if (!/^-?\d+$/.test(flags.position))
            throw new Error('--position must be an integer.');
          patch.position = Number(flags.position);
        }
        if (!Number.isSafeInteger(patch.position))
          throw new Error('position must be a safe integer.');
      }
      if (create && !patch.name)
        throw new Error('A title is required. Use --title or --input.');
      if (create && !patch.feature_id)
        throw new Error(
          'Create requires --feature (or feature_id in --input).'
        );
      if ('feature_id' in patch && !patch.feature_id)
        throw new Error('A requirement must belong to a feature.');
      if (!create && !Object.keys(patch).length)
        throw new Error('Supply at least one field to edit.');
    },
  });
}
export function resolveRequirementIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  return resolveRecordIds(api, patch, references);
}

export async function fetchRequirement(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<RequirementRecord> {
  const result = await api.get(
    `/api/v3/requirements/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: RequirementRecord }).record;
}

export function printRequirement(
  command: BaseCommand,
  requirement: RequirementRecord
) {
  warnEmbedded(requirement);
  if (command.flags.json) command.log(JSON.stringify(requirement, null, 2));
  else {
    command.log(
      `${requirement.reference_num || requirement.id || 'Requirement'}${
        requirement.name ? `: ${requirement.name}` : ''
      }`
    );
    if (requirement.status?.name)
      command.log(`Status: ${requirement.status.name}`);
    if (requirement.description?.body)
      command.log(descriptionText(requirement.description.body));
    if (requirement.html_url) command.log(requirement.html_url);
  }
}
