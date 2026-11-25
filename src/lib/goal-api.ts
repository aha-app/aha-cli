import {
  recordIdentifier,
  recordPatch,
  resolveRecordIds,
  warnEmbedded,
} from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
export interface GoalRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  status?: { id?: string; name?: string };
  project?: { id: string; name?: string; reference_prefix?: string };
  time_frame?: { id: string; name?: string };
  success_metric_name?: string;
  success_metric_description?: string;
  progress?: number;
  progress_source?: string;
  effort?: number;
  value?: number;
  position?: number;
  color?: string;
}
export const goalFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default:
      'default,description,status,project,time_frame,success_metric_name,success_metric_description,progress,progress_source,effort,value,position,color',
  }),
};
export const goalEditFlags = {
  title: Flags.string({ char: 't', description: 'Goal title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  status: Flags.string({ description: 'Goal workflow status ID' }),
  timeFrame: Flags.string({ description: 'Timeframe ID' }),
  successMetricName: Flags.string({
    description: 'Success metric name; use JSON for its HTML description',
  }),
  progress: Flags.string({ description: 'Numeric progress completed' }),
  progressSource: Flags.string({
    description:
      'Public v3 progress calculation method, e.g. manual or from_features',
  }),
  effort: Flags.string({ description: 'Integer effort, 0–100' }),
  value: Flags.string({ description: 'Integer value, 0–100' }),
  position: Flags.string({
    description: 'Integer position among sibling goals',
  }),
  color: Flags.string({ description: 'Hex color, e.g. #123456' }),
};
const writable = new Set([
  'name',
  'position',
  'color',
  'effort',
  'value',
  'progress',
  'progress_source',
  'success_metric_name',
  'success_metric_description',
  'status_id',
  'description',
  'time_frame_id',
  'custom_fields',
  'project_id',
]);
const references = { project_id: 'projects' };
export function goalIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'goal');
}
export function goalPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'goal',
    writable,
    references,
    flagKeys: {
      title: 'name',
      body: 'description',
      workspace: 'project_id',
      status: 'status_id',
      timeFrame: 'time_frame_id',
      successMetricName: 'success_metric_name',
      progress: 'progress',
      progressSource: 'progress_source',
      effort: 'effort',
      value: 'value',
      position: 'position',
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
            'The workspace can only be set when creating a goal.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      for (const key of [
        'color',
        'description',
        'progress_source',
        'success_metric_name',
        'success_metric_description',
      ])
        if (key in patch && typeof patch[key] !== 'string')
          throw new Error(`${key} must be a string.`);
      for (const key of ['status_id', 'time_frame_id'])
        if (
          key in patch &&
          (typeof patch[key] !== 'string' || !/^\d+$/.test(patch[key]))
        )
          throw new Error(`${key} must be a string ID.`);
      for (const key of ['position', 'effort', 'value', 'progress']) {
        const integer = key !== 'progress';
        if (typeof flags[key] === 'string') {
          const value = flags[key];
          if (!value.trim() || (integer && !/^-?\d+$/.test(value)))
            throw new Error(
              `--${key} requires ${integer ? 'an integer' : 'a number'}.`
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
export function resolveGoalIds(api: AhaAPI, patch: Record<string, unknown>) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchGoal(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<GoalRecord> {
  const result = await api.get(
    `/api/v3/goals/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: GoalRecord }).record;
}
export function printGoal(command: BaseCommand, goal: GoalRecord) {
  warnEmbedded(goal);
  if (command.flags.json) command.log(JSON.stringify(goal, null, 2));
  else {
    command.log(
      `${goal.reference_num || goal.id}${goal.name ? `: ${goal.name}` : ''}`
    );
    if (goal.status?.name) command.log(`Status: ${goal.status.name}`);
    if (goal.project)
      command.log(
        `Workspace: ${
          goal.project.name || goal.project.reference_prefix || goal.project.id
        }`
      );
    if (goal.time_frame)
      command.log(`Timeframe: ${goal.time_frame.name || goal.time_frame.id}`);
    if (goal.success_metric_name)
      command.log(`Success metric: ${goal.success_metric_name}`);
    if (goal.success_metric_description)
      command.log(
        `Metric description: ${descriptionText(
          goal.success_metric_description
        )}`
      );
    for (const [label, value] of [
      ['Progress', goal.progress],
      ['Effort', goal.effort],
      ['Value', goal.value],
      ['Position', goal.position],
    ])
      if (typeof value === 'number') command.log(`${label}: ${value}`);
    if (goal.progress_source)
      command.log(`Progress source: ${goal.progress_source}`);
    if (goal.color) command.log(`Color: ${goal.color}`);
    if (goal.description?.body)
      command.log(descriptionText(goal.description.body));
    if (goal.html_url) command.log(goal.html_url);
  }
}
