import BaseCommand from '../base';
import { Flags } from './flags';
import { warnEmbedded } from './record-api';
import { recordListFlags, listRecords } from './record-list';
import { printTable } from './record-output';
export { fieldQuery } from './record-api';

export type LookupResource = 'idea_portals' | 'portal_users' | 'idea_users';
interface LookupRecord {
  id: string;
  name?: string;
  email?: string;
  enabled?: boolean;
  permission?: string;
  idea_portal?: LookupRecord;
  idea_user?: LookupRecord;
  [key: string]: unknown;
}
const defaultFields: Record<LookupResource, string> = {
  idea_portals:
    'default,external_url,subtitle,access,enabled,custom_domain,company_name,reply_to_email,projects',
  portal_users:
    'default,enabled,verified,unsubscribed,permission,idea_portal,idea_user',
  idea_users: 'default,first_name,last_name,title,phone,portal_users',
};
export function lookupFlags(resource: LookupResource) {
  return {
    ...BaseCommand.flags,
    json: Flags.boolean({ description: 'Output JSON without prompting' }),
    fields: Flags.string({
      description:
        'Comma-separated API v3 fields (embedded collections may be capped)',
      default: defaultFields[resource],
    }),
  };
}
// Membership names/emails belong to the associated idea user and cannot be
// searched or sorted directly by the published portal-users endpoint.
export const membershipListFlags = {
  filters: recordListFlags.filters,
  sort: recordListFlags.sort,
  descending: recordListFlags.descending,
  perPage: recordListFlags.perPage,
};
export function lookupIdentifier(args: string[], topic: string) {
  if (args.length !== 1 || !/^[0-9]+$/.test(args[0]))
    throw new Error(
      `Usage: aha ${topic} view <numeric-id> [flags]. This resource has no reference numbers.`
    );
  return args[0];
}
function state(record: LookupRecord) {
  const enabled =
    typeof record.enabled === 'boolean'
      ? record.enabled
        ? 'enabled'
        : 'disabled'
      : '—';
  return record.permission ? `${enabled}/${record.permission}` : enabled;
}
export async function listLookups(
  command: BaseCommand,
  resource: LookupResource,
  query: URLSearchParams
) {
  const membership = resource === 'portal_users';
  const user = resource === 'idea_users' || membership;
  await listRecords<LookupRecord>(
    command,
    resource,
    resource.replace(/_/g, ' '),
    {},
    query,
    {
      columns: [
        'ID',
        'STATE',
        ...(user ? ['EMAIL'] : []),
        ...(membership ? ['PORTAL', 'IDEA-USER'] : []),
        'TITLE',
      ],
      row: record => [
        record.id,
        state(record),
        ...(user ? [record.email || '—'] : []),
        ...(membership
          ? [record.idea_portal?.id || '—', record.idea_user?.id || '—']
          : []),
        record.name || '',
      ],
      emptyMessage: `No ${resource.replace(/_/g, ' ')} matched.`,
    }
  );
}
export async function viewLookup(
  command: BaseCommand,
  resource: LookupResource,
  id: string,
  query: URLSearchParams
) {
  const result = await command.api.get(
    `/api/v3/${resource}/${encodeURIComponent(id)}?${query}`
  );
  const record = (result.body as { record: LookupRecord }).record;
  warnEmbedded(record);
  if (command.flags.json) {
    command.log(JSON.stringify(record, null, 2));
    return;
  }
  command.log(`${record.id}${record.name ? `: ${record.name}` : ''}`);
  // Render requested scalar fields too, while keeping the customer-facing portal
  // address separate from its settings and API URLs.
  for (const [key, value] of Object.entries(record)) {
    if (
      ['id', 'name', 'url', 'html_url'].includes(key) ||
      value === null ||
      typeof value === 'object'
    )
      continue;
    const label =
      key === 'external_url'
        ? 'Portal URL'
        : key.replace(/_/g, ' ').replace(/^./, letter => letter.toUpperCase());
    command.log(
      `${label}: ${typeof value === 'boolean' ? (value ? 'yes' : 'no') : value}`
    );
  }
  for (const [key, label] of [
    ['idea_portal', 'Idea portal'],
    ['idea_user', 'Idea user'],
  ] as const) {
    const association = record[key];
    if (association)
      command.log(
        `${label}: ${association.id}${
          association.name ? ` (${association.name})` : ''
        }${association.email ? ` <${association.email}>` : ''}`
      );
  }
  for (const [key, label] of [
    ['projects', 'Workspaces'],
    ['portal_users', 'Portal memberships'],
  ] as const) {
    const collection = record[key] as { records: LookupRecord[] } | undefined;
    if (!collection) continue;
    command.log(`${label} shown: ${collection.records.length}`);
    if (collection.records.length)
      printTable(
        command,
        ['ID', 'TITLE'],
        collection.records.map(item => [item.id, item.name || ''])
      );
  }
  if (record.html_url) command.log(`Settings URL: ${record.html_url}`);
  if (record.url) command.log(`API URL: ${record.url}`);
}
