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

export interface KeyResultRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  status?: { id?: string; name?: string };
  assigned_to_user?: { id: string; name?: string } | null;
  goal?: { id: string; name?: string; reference_num?: string };
  starting_metric?: string;
  current_metric?: string;
  target_metric?: string;
  progress?: number;
  position?: number;
}
export const keyResultFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default:
      'default,description,status,assigned_to_user,goal,starting_metric,current_metric,target_metric,progress,position',
  }),
};
export const keyResultEditFlags = {
  title: Flags.string({ char: 't', description: 'Key result title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  owner: Flags.string({ description: 'Owner user ID or @me' }),
  status: Flags.string({ description: 'Key result workflow status ID' }),
  startingMetric: Flags.string({
    description: 'Starting metric text, e.g. 50%',
  }),
  currentMetric: Flags.string({ description: 'Current metric text, e.g. 65%' }),
  targetMetric: Flags.string({ description: 'Target metric text, e.g. 80%' }),
  progress: Flags.string({ description: 'Numeric progress completed' }),
  position: Flags.string({
    description: 'Integer position among sibling key results',
  }),
};
const references = { goal_id: 'goals', project_id: 'projects' };
export function keyResultIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'key-result');
}
export function keyResultPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'key-result',
    writable: new Set([
      'name',
      'description',
      'position',
      'progress',
      'starting_metric',
      'current_metric',
      'target_metric',
      'status_id',
      'assigned_to_user_id',
      'custom_fields',
      'watchers',
      'goal_id',
    ]),
    references,
    flagKeys: {
      title: 'name',
      body: 'description',
      goal: 'goal_id',
      owner: 'assigned_to_user_id',
      status: 'status_id',
      startingMetric: 'starting_metric',
      currentMetric: 'current_metric',
      targetMetric: 'target_metric',
      progress: 'progress',
      position: 'position',
    },
    validate(patch, create) {
      if (create) {
        if (!patch.name)
          throw new Error('A title is required. Use --title or --input.');
        if (!patch.goal_id)
          throw new Error('Create requires --goal (or goal_id in --input).');
      } else {
        if ('goal_id' in patch)
          throw new Error(
            'The goal can only be set when creating a key result.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      for (const key of [
        'description',
        'starting_metric',
        'current_metric',
        'target_metric',
      ])
        if (key in patch && typeof patch[key] !== 'string')
          throw new Error(key + ' must be a string.');
      if (
        'status_id' in patch &&
        (typeof patch.status_id !== 'string' || !/^\d+$/.test(patch.status_id))
      )
        throw new Error('status_id must be a string ID.');
      for (const key of ['position', 'progress']) {
        const integer = key === 'position';
        if (typeof flags[key] === 'string') {
          const value = flags[key];
          if (!value.trim() || (integer && !/^-?\d+$/.test(value)))
            throw new Error(
              '--' +
                key +
                ' requires ' +
                (integer ? 'an integer.' : 'a number.')
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
            key +
              ' must be ' +
              (integer ? 'a safe integer.' : 'a finite number.')
          );
      }
    },
  });
}
export function resolveKeyResultIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  return resolveRecordIds(api, patch, references);
}
// A 403 can mean either account capability or ordinary record permissions.
// Keep the original API error and add context without probing or retrying in v1.
export async function keyResultAccess<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { http?: { statusCode: number } }).http?.statusCode ===
        403
    )
      error.message +=
        ' Key results require an Enterprise+ plan or enabled account capability, plus permission to access the goal.';
    throw error;
  }
}
export async function fetchKeyResult(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<KeyResultRecord> {
  const result = await keyResultAccess(() =>
    api.get('/api/v3/key_results/' + encodeURIComponent(id) + '?' + query)
  );
  return (result.body as { record: KeyResultRecord }).record;
}
export function printKeyResult(command: BaseCommand, result: KeyResultRecord) {
  warnEmbedded(result);
  if (command.flags.json) command.log(JSON.stringify(result, null, 2));
  else {
    command.log(
      (result.reference_num || result.id) +
        (result.name ? ': ' + result.name : '')
    );
    if (result.status?.name) command.log('Status: ' + result.status.name);
    if (result.assigned_to_user)
      command.log(
        'Owner: ' + (result.assigned_to_user.name || result.assigned_to_user.id)
      );
    if (result.goal)
      command.log(
        'Goal: ' +
          (result.goal.reference_num || result.goal.id) +
          (result.goal.name ? ': ' + result.goal.name : '')
      );
    for (const [label, value] of [
      ['Starting metric', result.starting_metric],
      ['Current metric', result.current_metric],
      ['Target metric', result.target_metric],
    ])
      if (typeof value === 'string') command.log(label + ': ' + value);
    if (typeof result.progress === 'number')
      command.log('Progress: ' + result.progress);
    if (typeof result.position === 'number')
      command.log('Position: ' + result.position);
    if (result.description?.body)
      command.log(descriptionText(result.description.body));
    if (result.html_url) command.log(result.html_url);
  }
}
