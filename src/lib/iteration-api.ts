import { recordIdentifier, recordPatch, resolveRecordIds } from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
import { warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

export interface IterationRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  duration?: number;
  goal?: string;
  progress?: number;
  description?: { body: string };
  project?: { id: string; reference_prefix?: string; name?: string };
}
export const iterationFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default:
      'default,status,start_date,end_date,duration,goal,progress,description,project',
  }),
};
export const iterationEditFlags = {
  title: Flags.string({ char: 't', description: 'Iteration title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  status: Flags.string({
    description: 'Iteration status: planning, started, or complete',
  }),
  startDate: Flags.string({ description: 'Start date, YYYY-MM-DD' }),
  endDate: Flags.string({
    description: 'End date, YYYY-MM-DD (alternative to duration)',
  }),
  duration: Flags.string({
    description: 'Integer duration in days (alternative to end date)',
  }),
  goal: Flags.string({ description: 'Iteration goal' }),
  progress: Flags.string({ description: 'Numeric progress completed' }),
};
// Only published IterationCreateInput/IterationUpdateInput fields are writable.
const writable = new Set([
  'name',
  'description',
  'status',
  'start_date',
  'end_date',
  'duration',
  'goal',
  'progress',
  'project_id',
]);
const flagKeys = {
  title: 'name',
  body: 'description',
  status: 'status',
  startDate: 'start_date',
  endDate: 'end_date',
  duration: 'duration',
  goal: 'goal',
  progress: 'progress',
  workspace: 'project_id',
};
const references = { project_id: 'projects' };
export function iterationIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'iteration');
}
export function iterationPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'iteration',
    writable,
    flagKeys,
    references,
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
            'The workspace can only be set when creating an iteration.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      if ('duration' in patch && 'end_date' in patch)
        throw new Error(
          'Supply either duration or end_date; the API calculates the end date from start date and duration.'
        );
      for (const key of ['status', 'goal']) {
        if (key in patch && typeof patch[key] !== 'string')
          throw new Error(`${key} must be a string.`);
      }
      for (const key of ['duration', 'progress']) {
        if (typeof flags[key] === 'string') {
          const value = flags[key];
          if (!value.trim() || (key === 'duration' && !/^-?\d+$/.test(value)))
            throw new Error(
              `--${key} requires ${
                key === 'duration' ? 'an integer' : 'a number'
              }.`
            );
          patch[key] = Number(value);
        }
        if (
          key in patch &&
          (typeof patch[key] !== 'number' ||
            !Number.isFinite(patch[key]) ||
            (key === 'duration' && !Number.isSafeInteger(patch[key])))
        )
          throw new Error(
            `${key} must be ${
              key === 'duration' ? 'a safe integer' : 'a finite number'
            }.`
          );
      }
    },
  });
}
export function resolveIterationIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchIteration(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<IterationRecord> {
  const result = await api.get(
    `/api/v3/iterations/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: IterationRecord }).record;
}
export function printIteration(
  command: BaseCommand,
  iteration: IterationRecord
) {
  warnEmbedded(iteration);
  if (command.flags.json) command.log(JSON.stringify(iteration, null, 2));
  else {
    command.log(
      `${iteration.reference_num || iteration.id || 'Iteration'}${
        iteration.name ? `: ${iteration.name}` : ''
      }`
    );
    if (iteration.status) command.log(`Status: ${iteration.status}`);
    if (iteration.project)
      command.log(
        `Workspace: ${
          iteration.project.name ||
          iteration.project.reference_prefix ||
          iteration.project.id
        }`
      );
    if (iteration.start_date)
      command.log(`Start date: ${iteration.start_date}`);
    if (iteration.end_date) command.log(`End date: ${iteration.end_date}`);
    if (typeof iteration.duration === 'number')
      command.log(`Duration: ${iteration.duration} days`);
    if (iteration.goal) command.log(`Goal: ${iteration.goal}`);
    if (typeof iteration.progress === 'number')
      command.log(`Progress: ${iteration.progress}`);
    if (iteration.description?.body)
      command.log(descriptionText(iteration.description.body));
    if (iteration.html_url) command.log(iteration.html_url);
  }
}
