import { recordIdentifier, recordPatch, resolveRecordIds } from './record-api';
export { fieldQuery, warnEmbedded } from './record-api';
import { warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

export interface ReleaseRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  description?: { body: string };
  status?: { name?: string };
  owner?: { name?: string };
  parent?: { reference_num?: string; id: string };
  parking_lot?: boolean;
  type?: string;
  start_date?: string;
  end_date?: string;
  release_date?: string;
  external_release_date?: string;
  external_date_resolution?: string;
  [key: string]: unknown;
}

export const releaseFields =
  'default,type,description,status,owner,project,parent,start_date,end_date,release_date,external_release_date,external_date_resolution,parking_lot';
export const releaseFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: releaseFields,
  }),
};
export const releaseEditFlags = {
  title: Flags.string({ char: 't', description: 'Release title' }),
  body: Flags.string({
    char: 'b',
    description: 'Description of the release (plain text; empty clears it)',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
  owner: Flags.string({
    description: 'Owner user ID or @me',
  }),
  status: Flags.string({ description: 'Workflow status ID' }),
  parent: Flags.string({
    description: 'Parent rollup release ID/reference',
  }),
  parkingLot: Flags.string({
    description: 'Whether this is a parking lot: true or false',
  }),
  startDate: Flags.string({ description: 'Start date, YYYY-MM-DD' }),
  endDate: Flags.string({ description: 'End date, YYYY-MM-DD' }),
  releaseDate: Flags.string({ description: 'Release date, YYYY-MM-DD' }),
  externalReleaseDate: Flags.string({
    description: 'External release date, YYYY-MM-DD',
  }),
  externalDateResolution: Flags.string({
    description: 'sync, exact, week, month, quarter, half, or year',
  }),
};

// Published ReleaseCreateInput/ReleaseUpdateInput; features are read-only here.
const writable = new Set([
  'name',
  'description',
  'position',
  'start_date',
  'end_date',
  'duration_source',
  'release_date',
  'released_on',
  'development_started_on',
  'external_release_date',
  'external_date_resolution',
  'parking_lot',
  'progress_source',
  'progress',
  'status_id',
  'owner_id',
  'parent_id',
  'custom_fields',
  'watchers',
  'project_id',
  'type',
]);
const flagKeys = {
  title: 'name',
  body: 'description',
  workspace: 'project_id',
  type: 'type',
  owner: 'owner_id',
  status: 'status_id',
  parent: 'parent_id',
  parkingLot: 'parking_lot',
  startDate: 'start_date',
  endDate: 'end_date',
  releaseDate: 'release_date',
  externalReleaseDate: 'external_release_date',
  externalDateResolution: 'external_date_resolution',
};
const references = { project_id: 'projects', parent_id: 'releases' };

export function releaseIdentifier(args: string[], action: string) {
  return recordIdentifier(args, action, 'release');
}
export function releasePatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'release',
    writable,
    flagKeys,
    references,
    dateFields: [
      'start_date',
      'end_date',
      'release_date',
      'released_on',
      'development_started_on',
      'external_release_date',
    ],
    validate(patch, create) {
      if (create) {
        if (!patch.name)
          throw new Error('A title is required. Use --title or --input.');
        if (!patch.project_id)
          throw new Error(
            'Create requires --workspace (or project_id in --input).'
          );
        if (
          'type' in patch &&
          !['release', 'rollup_release'].includes(String(patch.type))
        )
          throw new Error('type must be release or rollup_release.');
      } else {
        if ('project_id' in patch || 'type' in patch)
          throw new Error(
            'Workspace and type can only be set when creating a release.'
          );
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      // Current v3 converters reject a null parent and silently retain a null owner.
      if (patch.parent_id === null)
        throw new Error(
          'API v3 cannot detach a release parent; supply a parent release ID.'
        );
      if (patch.owner_id === null)
        throw new Error(
          'API v3 cannot clear a release owner; supply an owner user ID.'
        );
      if (typeof flags.parkingLot === 'string') {
        if (!['true', 'false'].includes(flags.parkingLot))
          throw new Error('--parking-lot requires true or false.');
        patch.parking_lot = flags.parkingLot === 'true';
      }
      if ('parking_lot' in patch && typeof patch.parking_lot !== 'boolean')
        throw new Error('parking_lot must be a boolean.');
      if (
        'external_date_resolution' in patch &&
        !['sync', 'exact', 'week', 'month', 'quarter', 'half', 'year'].includes(
          String(patch.external_date_resolution)
        )
      )
        throw new Error(
          'Invalid external_date_resolution; use sync, exact, week, month, quarter, half, or year.'
        );
    },
  });
}
export function resolveReleaseIds(api: AhaAPI, patch: Record<string, unknown>) {
  return resolveRecordIds(api, patch, references);
}
export async function fetchRelease(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<ReleaseRecord> {
  const result = await api.get(
    `/api/v3/releases/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: ReleaseRecord }).record;
}
export function printRelease(command: BaseCommand, release: ReleaseRecord) {
  warnEmbedded(release);
  if (command.flags.json) command.log(JSON.stringify(release, null, 2));
  else {
    command.log(
      `${release.reference_num || release.id || 'Release'}${
        release.name ? `: ${release.name}` : ''
      }`
    );
    if (release.status?.name) command.log(`Status: ${release.status.name}`);
    if (release.owner?.name) command.log(`Owner: ${release.owner.name}`);
    if (release.type === 'rollup_release') command.log('Rollup release');
    if (release.parking_lot) command.log('Parking lot');
    if (release.start_date) command.log(`Start date: ${release.start_date}`);
    if (release.end_date) command.log(`End date: ${release.end_date}`);
    if (release.release_date)
      command.log(`Release date: ${release.release_date}`);
    if (release.external_release_date)
      command.log(
        `External release date: ${release.external_release_date} (${
          release.external_date_resolution || 'exact'
        })`
      );
    if (release.parent)
      command.log(
        `Parent: ${release.parent.reference_num || release.parent.id}`
      );
    if (release.description?.body)
      command.log(descriptionText(release.description.body));
    if (release.html_url) command.log(release.html_url);
  }
}
