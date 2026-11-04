import BaseCommand from '../base';
import { Flags } from './flags';
import { printTable } from './record-output';
import { object, fieldQuery, warnEmbedded, RecordSummary } from './record-api';
interface RecordPage {
  records: RecordSummary[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
    truncated?: boolean;
    truncated_message?: string;
  };
}
export const recordListFlags = {
  search: Flags.string({ description: 'Filter titles containing text' }),
  filters: Flags.string({
    description:
      'JSON object of API v3 filter keys/values, e.g. {"eq[status.id]":"123"}',
  }),
  sort: Flags.string({
    description: 'API v3 field to sort by (may limit total results)',
  }),
  descending: Flags.boolean({
    description: 'Sort descending (requires --sort)',
  }),
  perPage: Flags.string({
    description: 'Records per API page, 1–200',
    default: '100',
  }),
};
export async function listRecords(
  command: BaseCommand,
  resource: string,
  singular: string,
  parents: Record<string, unknown>
) {
  const query = fieldQuery(command.flags);
  if (
    typeof command.flags.perPage !== 'string' ||
    !/^\d+$/.test(command.flags.perPage) ||
    Number(command.flags.perPage) < 1 ||
    Number(command.flags.perPage) > 200
  )
    throw new Error('--per-page must be between 1 and 200.');
  query.set('per_page', command.flags.perPage);
  if (command.flags.descending && !command.flags.sort)
    throw new Error('--descending requires --sort.');
  if (typeof command.flags.filters === 'string') {
    let filters;
    try {
      filters = object(JSON.parse(command.flags.filters), '--filters');
    } catch {
      throw new Error(
        '--filters must be a JSON object of API v3 filter keys and string values.'
      );
    }
    for (const [key, value] of Object.entries(filters)) {
      if (!/^[a-z_]+\[[A-Za-z0-9_.]+\]$/.test(key) || typeof value !== 'string')
        throw new Error(
          '--filters requires keys like eq[status.id] with string values.'
        );
      query.set(`filter.${key}`, value);
    }
  }
  if (typeof command.flags.search === 'string') {
    if (!command.flags.search.trim())
      throw new Error('--search requires nonempty text.');
    query.set('filter.contains[name]', command.flags.search);
  }
  if (typeof command.flags.sort === 'string') {
    if (!command.flags.sort.trim()) throw new Error('--sort requires a field.');
    query.set(
      command.flags.descending ? 'sort.desc' : 'sort.asc',
      command.flags.sort
    );
  }
  for (const [key, value] of Object.entries(parents))
    query.set(key, String(value));
  const records: RecordSummary[] = [];
  const cursors = new Set<string>();
  let pagination: RecordPage['pagination'];
  while (true) {
    const result = await command.api.get(`/api/v3/${resource}?${query}`);
    const page = result.body as RecordPage;
    records.push(...page.records);
    pagination = page.pagination;
    if (pagination.truncated) {
      console.error(
        `Warning: ${
          pagination.truncated_message ||
          'Sorted results were truncated. Remove --sort to retrieve all records.'
        }`
      );
    }
    if (!pagination.has_more) break;
    const cursor = pagination.next_cursor;
    if (typeof cursor !== 'string' || !cursor || cursors.has(cursor))
      throw new Error(
        `The API returned an invalid pagination cursor; the ${singular} list is incomplete.`
      );
    cursors.add(cursor);
    query.set('after', cursor);
  }
  warnEmbedded(records);
  if (command.flags.json) command.log(JSON.stringify(records, null, 2));
  else if (!records.length) command.log(`No ${resource} matched.`);
  else
    printTable(
      command,
      ['ID', 'STATE', 'TITLE'],
      records.map(record => [
        record.reference_num || record.id || singular,
        record.status?.name || '—',
        record.name || '',
      ])
    );
}
