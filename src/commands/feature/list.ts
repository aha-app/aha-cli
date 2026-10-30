import BaseCommand from '../../base';
import { Flags } from '../../lib/flags';
import {
  FeatureRecord,
  featureFlags,
  resolveFeatureIds,
  fieldQuery,
  object,
  warnEmbedded,
} from '../../lib/feature-api';

interface FeaturePage {
  records: FeatureRecord[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
    truncated?: boolean;
    truncated_message?: string;
  };
}

export default class FeatureList extends BaseCommand {
  static description =
    'List features across all cursor pages, with API v3 filters';
  static flags = {
    ...featureFlags,
    workspace: Flags.string({
      description: 'Filter by workspace ID/reference',
    }),
    release: Flags.string({ description: 'Filter by release ID/reference' }),
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
  async run() {
    if (this.parse().argv.length)
      throw new Error('Usage: aha feature list [flags]');
    if (this.flags.workspace !== undefined && this.flags.release !== undefined)
      throw new Error(
        'Use either --workspace or --release as the list parent, not both.'
      );
    const query = fieldQuery(this.flags);
    if (
      typeof this.flags.perPage !== 'string' ||
      !/^\d+$/.test(this.flags.perPage) ||
      Number(this.flags.perPage) < 1 ||
      Number(this.flags.perPage) > 200
    )
      throw new Error('--per-page must be between 1 and 200.');
    query.set('per_page', this.flags.perPage);
    if (this.flags.descending && !this.flags.sort)
      throw new Error('--descending requires --sort.');
    if (typeof this.flags.filters === 'string') {
      let filters;
      try {
        filters = object(JSON.parse(this.flags.filters), '--filters');
      } catch {
        throw new Error(
          '--filters must be a JSON object of API v3 filter keys and string values.'
        );
      }
      for (const [key, value] of Object.entries(filters)) {
        if (
          !/^[a-z_]+\[[A-Za-z0-9_.]+\]$/.test(key) ||
          typeof value !== 'string'
        )
          throw new Error(
            '--filters requires keys like eq[status.id] with string values.'
          );
        query.set(`filter.${key}`, value);
      }
    }
    if (typeof this.flags.search === 'string') {
      if (!this.flags.search.trim())
        throw new Error('--search requires nonempty text.');
      query.set('filter.contains[name]', this.flags.search);
    }
    if (typeof this.flags.sort === 'string') {
      if (!this.flags.sort.trim()) throw new Error('--sort requires a field.');
      query.set(
        this.flags.descending ? 'sort.desc' : 'sort.asc',
        this.flags.sort
      );
    }
    const parents: Record<string, unknown> = {};
    for (const [flag, key] of [
      ['workspace', 'project_id'],
      ['release', 'release_id'],
    ]) {
      if (typeof this.flags[flag] === 'string') {
        const value = this.flags[flag];
        if (!value || !/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value))
          throw new Error(`Invalid --${flag}.`);
        parents[key] = value;
      }
    }
    await this.initAPI();
    await resolveFeatureIds(this.api, parents);
    for (const [key, value] of Object.entries(parents))
      query.set(key, String(value));
    const records: FeatureRecord[] = [];
    const cursors = new Set<string>();
    let pagination: FeaturePage['pagination'];
    let truncated = false;
    while (true) {
      const result = await this.api.get(`/api/v3/features?${query}`);
      const page = result.body as FeaturePage;
      records.push(...page.records);
      pagination = page.pagination;
      if (pagination.truncated) {
        truncated = true;
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
          'The API returned an invalid pagination cursor; the feature list is incomplete.'
        );
      cursors.add(cursor);
      query.set('after', cursor);
    }
    warnEmbedded(records);
    if (this.flags.json)
      this.log(
        JSON.stringify(
          {
            records,
            pagination: {
              ...pagination,
              ...(truncated ? { truncated: true } : {}),
            },
          },
          null,
          2
        )
      );
    else {
      for (const record of records)
        this.log(
          `${record.reference_num || record.id || 'Feature'} — ${
            record.name || ''
          }`
        );
      if (!records.length) this.log('No features matched.');
    }
  }
}
