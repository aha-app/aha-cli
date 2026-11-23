import { recordIdentifier, recordPatch, resolveRecordIds } from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
import { warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

export interface ReleasePhaseRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  release?: { id: string; reference_num?: string };
  type?: string;
  start_date?: string;
  end_date?: string;
  position?: number;
  color?: string;
  progress?: number;
  progress_source?: string;
  duration_source?: string;
}

export const releasePhaseFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default:
      'default,type,description,release,start_date,end_date,position,color,progress,progress_source,duration_source',
  }),
};
export const releasePhaseEditFlags = {
  title: Flags.string({ char: 't', description: 'Phase or milestone title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  type: Flags.string({
    description: 'phase or milestone (required on create)',
  }),
  startDate: Flags.string({ description: 'Start date, YYYY-MM-DD' }),
  endDate: Flags.string({ description: 'End date, YYYY-MM-DD' }),
  position: Flags.string({
    description: 'Integer position among sibling phases/milestones',
  }),
  color: Flags.string({ description: 'Hex color, e.g. #336699' }),
  progress: Flags.string({ description: 'Numeric progress completed' }),
  progressSource: Flags.string({
    description:
      'Progress calculation: manual, from_features, from_features_with_dependents, from_todos, from_todos_with_dependents, from_features_completed, or from_features_completed_with_dependents',
  }),
  durationSource: Flags.string({
    description: 'Date calculation: manual or from_features',
  }),
};

// Published ReleasePhaseCreateInput/ReleasePhaseUpdateInput; release is create-only.
const writable = new Set([
  'name',
  'description',
  'type',
  'release_id',
  'start_date',
  'end_date',
  'position',
  'color',
  'progress',
  'progress_source',
  'duration_source',
  'custom_fields',
]);
const flagKeys = {
  title: 'name',
  body: 'description',
  type: 'type',
  release: 'release_id',
  startDate: 'start_date',
  endDate: 'end_date',
  position: 'position',
  color: 'color',
  progress: 'progress',
  progressSource: 'progress_source',
  durationSource: 'duration_source',
};
const references = { release_id: 'releases' };
const choices: Record<string, string[]> = {
  type: ['phase', 'milestone'],
  duration_source: ['manual', 'from_features'],
  progress_source: [
    'manual',
    'from_features',
    'from_features_with_dependents',
    'from_todos',
    'from_todos_with_dependents',
    'from_features_completed',
    'from_features_completed_with_dependents',
  ],
};

export function releasePhaseIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'release-phase');
}
export function releasePhasePatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'release phase',
    writable,
    flagKeys,
    references,
    validate(patch, create) {
      if (create) {
        if (!patch.name)
          throw new Error('A title is required. Use --title or --input.');
        if (!patch.release_id)
          throw new Error(
            'Create requires --release (or release_id in --input).'
          );
        if (!patch.type)
          throw new Error(
            'Create requires --type phase or milestone (or type in --input).'
          );
      } else {
        if ('release_id' in patch)
          throw new Error(
            'The release association can only be set when creating a phase or milestone.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      for (const [key, allowed] of Object.entries(choices)) {
        if (
          key in patch &&
          (typeof patch[key] !== 'string' || !allowed.includes(patch[key]))
        ) {
          throw new Error(`${key} must be one of: ${allowed.join(', ')}.`);
        }
      }
      for (const key of ['position', 'progress']) {
        if (typeof flags[key] === 'string') {
          const value = flags[key];
          if (!value.trim() || (key === 'position' && !/^-?\d+$/.test(value)))
            throw new Error(
              `--${key} requires ${
                key === 'position' ? 'an integer' : 'a number'
              }.`
            );
          patch[key] = Number(value);
        }
        if (
          key in patch &&
          (typeof patch[key] !== 'number' ||
            !Number.isFinite(patch[key]) ||
            (key === 'position' && !Number.isSafeInteger(patch[key])))
        )
          throw new Error(
            `${key} must be ${
              key === 'position' ? 'a safe integer' : 'a finite number'
            }.`
          );
      }
      if ('color' in patch && typeof patch.color !== 'string')
        throw new Error('color must be a string hex value.');
    },
  });
}
export function resolveReleasePhaseIds(
  api: AhaAPI,
  patch: Record<string, unknown>
) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchReleasePhase(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<ReleasePhaseRecord> {
  const result = await api.get(
    `/api/v3/release_phases/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: ReleasePhaseRecord }).record;
}
export function printReleasePhase(
  command: BaseCommand,
  phase: ReleasePhaseRecord
) {
  warnEmbedded(phase);
  if (command.flags.json) command.log(JSON.stringify(phase, null, 2));
  else {
    command.log(
      `${phase.reference_num || phase.id || 'Release phase'}${
        phase.name ? `: ${phase.name}` : ''
      }`
    );
    if (phase.type) command.log(`Type: ${phase.type}`);
    if (phase.release)
      command.log(
        `Release: ${phase.release.reference_num || phase.release.id}`
      );
    if (phase.start_date) command.log(`Start date: ${phase.start_date}`);
    if (phase.end_date) command.log(`End date: ${phase.end_date}`);
    if (typeof phase.position === 'number')
      command.log(`Position: ${phase.position}`);
    if (phase.color) command.log(`Color: ${phase.color}`);
    if (typeof phase.progress === 'number')
      command.log(`Progress: ${phase.progress}`);
    if (phase.progress_source)
      command.log(`Progress source: ${phase.progress_source}`);
    if (phase.duration_source)
      command.log(`Duration source: ${phase.duration_source}`);
    if (phase.description?.body)
      command.log(descriptionText(phase.description.body));
    if (phase.html_url) command.log(phase.html_url);
  }
}
