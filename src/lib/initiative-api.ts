import {
  recordIdentifier,
  recordPatch,
  resolveRecordIds,
  warnEmbedded,
} from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
import { descriptionText, printTable } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
export interface InitiativeRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  status?: { id?: string; name?: string };
  assigned_to_user?: { id: string; name?: string } | null;
  project?: { id: string; name?: string; reference_prefix?: string };
  time_frame?: { id: string; name?: string };
  start_date?: string;
  end_date?: string;
  progress?: number;
  progress_source?: string;
  duration_source?: string;
  score?: number;
  initial_estimate?: number;
  detailed_estimate?: number;
  remaining_estimate?: number;
  work_done?: number;
  effort?: number;
  value?: number;
  position?: number;
  color?: string;
  score_facts?: {
    records: {
      scoring_system_metric_id: string;
      name?: string;
      value?: number;
    }[];
    has_more?: boolean;
  };
}
export const initiativeFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default:
      'default,description,status,assigned_to_user,project,time_frame,start_date,end_date,progress,progress_source,duration_source,score,initial_estimate,detailed_estimate,remaining_estimate,work_done,effort,value,position,color,score_facts',
  }),
};
export const initiativeEditFlags = {
  title: Flags.string({ char: 't', description: 'Initiative title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  owner: Flags.string({ description: 'Owner user ID or @me' }),
  status: Flags.string({ description: 'Initiative workflow status ID' }),
  timeFrame: Flags.string({ description: 'Timeframe ID' }),
  timeCode: Flags.string({ description: 'Time code ID (requires timesheets)' }),
  startDate: Flags.string({ description: 'Start date, YYYY-MM-DD' }),
  endDate: Flags.string({ description: 'End date, YYYY-MM-DD' }),
  progress: Flags.string({ description: 'Numeric progress completed' }),
  progressSource: Flags.string({
    description:
      'Public v3 progress calculation method, e.g. manual or from_features',
  }),
  durationSource: Flags.string({
    description:
      'Date calculation method: manual, from_children, from_releases, or from_features_epics',
  }),
  score: Flags.string({ description: 'Numeric score' }),
  initialEstimate: Flags.string({
    description: 'Numeric initial work estimate',
  }),
  detailedEstimate: Flags.string({
    description: 'Numeric detailed work estimate',
  }),
  remainingEstimate: Flags.string({
    description: 'Numeric remaining work estimate',
  }),
  workDone: Flags.string({ description: 'Numeric completed work' }),
  effort: Flags.string({ description: 'Integer effort, 0–100' }),
  value: Flags.string({ description: 'Integer value, 0–100' }),
  position: Flags.string({
    description: 'Integer position among sibling initiatives',
  }),
  color: Flags.string({ description: 'Hex color, e.g. #123456' }),
};
const writable = new Set([
  'name',
  'start_date',
  'end_date',
  'position',
  'progress_source',
  'duration_source',
  'progress',
  'score',
  'color',
  'initial_estimate',
  'detailed_estimate',
  'remaining_estimate',
  'work_done',
  'effort',
  'value',
  'status_id',
  'assigned_to_user_id',
  'time_frame_id',
  'description',
  'time_code_id',
  'score_facts',
  'custom_fields',
  'watchers',
  'project_id',
]);
const numericFlags = {
  position: 'position',
  progress: 'progress',
  score: 'score',
  initialEstimate: 'initial_estimate',
  detailedEstimate: 'detailed_estimate',
  remainingEstimate: 'remaining_estimate',
  workDone: 'work_done',
  effort: 'effort',
  value: 'value',
};
const references = { project_id: 'projects' };
export function initiativeIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'initiative');
}
export function initiativePatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'initiative',
    writable,
    references,
    flagKeys: {
      title: 'name',
      body: 'description',
      workspace: 'project_id',
      owner: 'assigned_to_user_id',
      status: 'status_id',
      timeFrame: 'time_frame_id',
      timeCode: 'time_code_id',
      startDate: 'start_date',
      endDate: 'end_date',
      progressSource: 'progress_source',
      durationSource: 'duration_source',
      color: 'color',
      ...numericFlags,
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
            'The workspace can only be set when creating an initiative.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      for (const key of [
        'color',
        'description',
        'progress_source',
        'duration_source',
      ])
        if (key in patch && typeof patch[key] !== 'string')
          throw new Error(`${key} must be a string.`);
      for (const key of ['status_id', 'time_frame_id', 'time_code_id'])
        if (
          key in patch &&
          (typeof patch[key] !== 'string' || !/^\d+$/.test(patch[key]))
        )
          throw new Error(`${key} must be a string ID.`);
      for (const [flag, key] of Object.entries(numericFlags)) {
        const integer = ['position', 'effort', 'value'].includes(key);
        if (typeof flags[flag] === 'string') {
          const value = flags[flag];
          if (!value.trim() || (integer && !/^-?\d+$/.test(value)))
            throw new Error(
              `--${flag} requires ${integer ? 'an integer' : 'a number'}.`
            );
          patch[key] = Number(value);
        }
        if (
          key in patch &&
          (typeof patch[key] !== 'number' ||
            !Number.isFinite(patch[key]) ||
            (integer && !Number.isSafeInteger(patch[key])))
        )
          throw new Error(
            `${key} must be ${integer ? 'a safe integer' : 'a finite number'}.`
          );
        if (
          ['effort', 'value'].includes(key) &&
          typeof patch[key] === 'number' &&
          (patch[key] < 0 || patch[key] > 100)
        )
          throw new Error(`${key} must be between 0 and 100.`);
      }
    },
  });
}
export function resolveInitiativeIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchInitiative(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<InitiativeRecord> {
  const result = await api.get(
    `/api/v3/initiatives/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: InitiativeRecord }).record;
}
export function printInitiative(
  command: BaseCommand,
  initiative: InitiativeRecord
) {
  warnEmbedded(initiative);
  if (command.flags.json) command.log(JSON.stringify(initiative, null, 2));
  else {
    command.log(
      `${initiative.reference_num || initiative.id}${
        initiative.name ? `: ${initiative.name}` : ''
      }`
    );
    if (initiative.status?.name)
      command.log(`Status: ${initiative.status.name}`);
    if (initiative.assigned_to_user)
      command.log(
        `Owner: ${
          initiative.assigned_to_user.name || initiative.assigned_to_user.id
        }`
      );
    if (initiative.project)
      command.log(
        `Workspace: ${
          initiative.project.name ||
          initiative.project.reference_prefix ||
          initiative.project.id
        }`
      );
    if (initiative.time_frame)
      command.log(
        `Timeframe: ${initiative.time_frame.name || initiative.time_frame.id}`
      );
    if (initiative.start_date)
      command.log(`Start date: ${initiative.start_date}`);
    if (initiative.end_date) command.log(`End date: ${initiative.end_date}`);
    for (const [label, value] of [
      ['Progress', initiative.progress],
      ['Score', initiative.score],
      ['Initial estimate', initiative.initial_estimate],
      ['Detailed estimate', initiative.detailed_estimate],
      ['Remaining estimate', initiative.remaining_estimate],
      ['Work done', initiative.work_done],
      ['Effort', initiative.effort],
      ['Value', initiative.value],
      ['Position', initiative.position],
    ])
      if (typeof value === 'number') command.log(`${label}: ${value}`);
    if (initiative.progress_source)
      command.log(`Progress source: ${initiative.progress_source}`);
    if (initiative.duration_source)
      command.log(`Duration source: ${initiative.duration_source}`);
    if (initiative.color) command.log(`Color: ${initiative.color}`);
    if (initiative.description?.body)
      command.log(descriptionText(initiative.description.body));
    if (initiative.score_facts?.records.length)
      printTable(
        command,
        ['METRIC ID', 'METRIC', 'VALUE'],
        initiative.score_facts.records.map(fact => [
          fact.scoring_system_metric_id,
          fact.name || '',
          String(fact.value ?? ''),
        ])
      );
    if (initiative.html_url) command.log(initiative.html_url);
  }
}
