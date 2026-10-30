import { readFile } from 'fs/promises';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
import { currentUserId } from './todo-api';

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
  title: Flags.string({ description: 'Feature title' }),
  description: Flags.string({
    description: 'Description HTML (empty string clears it)',
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
  description: 'description',
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

export function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

export function featureIdentifier(args: string[], action: string): string {
  if (
    args.length !== 1 ||
    !/^(?:\d+|[A-Za-z0-9][A-Za-z0-9-]*-\d+)$/.test(args[0])
  ) {
    throw new Error(`Usage: aha feature ${action} <id-or-reference>`);
  }
  return args[0];
}

function validateIds(value: unknown) {
  if (Array.isArray(value)) {
    value.forEach(validateIds);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (
        (key === 'id' || key.endsWith('_id')) &&
        item !== null &&
        typeof item !== 'string'
      ) {
        throw new Error(
          `${key} must be a string, preserving the full ID, or null.`
        );
      }
      validateIds(item);
    }
  }
}

export async function featurePatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  let patch: Record<string, unknown> = {};
  if (typeof flags.input === 'string') {
    let source = '';
    if (flags.input === '-') {
      if (process.stdin.isTTY)
        throw new Error('Pipe JSON into --input -, or supply a file.');
      for await (const chunk of process.stdin) source += chunk.toString();
    } else source = await readFile(flags.input, 'utf8');
    try {
      patch = { ...object(JSON.parse(source), '--input') };
    } catch {
      throw new Error(
        '--input must contain a writable record JSON object (without a record envelope).'
      );
    }
  }
  for (const [flag, key] of Object.entries(flagKeys)) {
    if (typeof flags[flag] !== 'string') continue;
    if (Object.prototype.hasOwnProperty.call(patch, key))
      throw new Error(
        `Supply ${key} through either --input or --${flag}, not both.`
      );
    patch[key] = flags[flag];
  }
  for (const key of Object.keys(patch)) {
    if (!writable.has(key))
      throw new Error(`Unknown or read-only feature field: ${key}.`);
  }
  validateIds(patch);
  if ('name' in patch) {
    if (typeof patch.name !== 'string' || !patch.name.trim())
      throw new Error('A nonempty title is required.');
    patch.name = patch.name.trim();
  }
  for (const key of ['start_date', 'end_date']) {
    const value = patch[key];
    if (value === undefined || value === null) continue;
    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value
    ) {
      throw new Error(
        `${key} must be a real date in YYYY-MM-DD format, or null.`
      );
    }
  }
  for (const [key, value] of Object.entries(patch)) {
    if (key.endsWith('_id') && value !== null) {
      if (
        typeof value !== 'string' ||
        !value ||
        (!/^\d+$/.test(value) &&
          !references[key] &&
          !(key === 'assigned_to_user_id' && value === '@me'))
      ) {
        throw new Error(
          `${key} requires a string ID${
            references[key] ? ' or reference' : ''
          }.`
        );
      }
    }
  }
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
  return patch;
}

export async function resolveFeatureIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'assigned_to_user_id' && value === '@me') {
      // API v3 exposes users by ID, but has no current-user lookup endpoint.
      patch[key] = await currentUserId(api);
    } else if (
      references[key] &&
      typeof value === 'string' &&
      !/^\d+$/.test(value)
    ) {
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value))
        throw new Error(`Invalid reference for ${key}.`);
      const result = await api.get(
        `/api/v3/${references[key]}/${encodeURIComponent(value)}?fields=id`
      );
      const body = object(result.body, 'API response');
      const record = object(body.record, 'API record');
      if (typeof record.id !== 'string' || !/^\d+$/.test(record.id))
        throw new Error(`Could not resolve ${key} to a string ID.`);
      patch[key] = record.id;
    }
  }
}

export function fieldQuery(flags: Record<string, string | boolean>) {
  if (typeof flags.fields !== 'string' || !flags.fields.trim())
    throw new Error('--fields requires a nonempty field selection.');
  return new URLSearchParams({ fields: flags.fields });
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

export function warnEmbedded(value: unknown, path = '') {
  if (Array.isArray(value))
    value.forEach((item, index) => warnEmbedded(item, `${path}[${index}]`));
  else if (value && typeof value === 'object') {
    const entry = object(value, 'record');
    if (entry.has_more === true)
      console.error(
        `Warning: ${
          path || 'embedded collection'
        } is incomplete; use its API collection endpoint where available.`
      );
    for (const [key, item] of Object.entries(entry)) {
      if (key !== 'pagination')
        warnEmbedded(item, path ? `${path}.${key}` : key);
    }
  }
}

export function printFeature(
  command: BaseCommand,
  feature: FeatureRecord,
  label?: string
) {
  warnEmbedded(feature);
  if (command.flags.json) command.log(JSON.stringify(feature, null, 2));
  else {
    command.log(
      `${label ? `${label}: ` : ''}${
        feature.reference_num || feature.id || 'Feature'
      }${feature.name ? ` — ${feature.name}` : ''}`
    );
    if (feature.status?.name) command.log(`Status: ${feature.status.name}`);
    if (feature.description?.body) command.log(feature.description.body);
    if (feature.html_url) command.log(feature.html_url);
  }
}
