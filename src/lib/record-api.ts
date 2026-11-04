import { plainTextBody } from './record-input';
import { readFile } from 'fs/promises';
import AhaAPI from '../api';
import { currentUserId } from './current-user';

export interface RecordSummary {
  id: string;
  reference_num?: string;
  name?: string;
  status?: { name?: string };
}

export interface RecordInputConfig {
  resource: string;
  writable: Set<string>;
  flagKeys: Record<string, string>;
  references: Record<string, string>;
  validate: (patch: Record<string, unknown>, create: boolean) => void;
}

export function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

export function recordIdentifier(
  args: string[],
  action: string,
  resource: string
): string {
  if (
    args.length !== 1 ||
    !/^(?:\d+|[A-Za-z0-9][A-Za-z0-9-]*-\d+)$/.test(args[0])
  ) {
    throw new Error(`Usage: aha ${resource} ${action} <id-or-reference>`);
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

export async function recordPatch(
  flags: Record<string, string | boolean>,
  create: boolean,
  config: RecordInputConfig
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
  for (const [flag, key] of Object.entries(config.flagKeys)) {
    if (typeof flags[flag] !== 'string') continue;
    if (Object.prototype.hasOwnProperty.call(patch, key))
      throw new Error(
        `Supply ${key} through either --input or --${flag}, not both.`
      );
    patch[key] =
      flag === 'body' ? plainTextBody(String(flags[flag])) : flags[flag];
  }
  for (const key of Object.keys(patch)) {
    if (!config.writable.has(key))
      throw new Error(`Unknown or read-only ${config.resource} field: ${key}.`);
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
          !config.references[key] &&
          !(key === 'assigned_to_user_id' && value === '@me'))
      ) {
        throw new Error(
          `${key} requires a string ID${
            config.references[key] ? ' or reference' : ''
          }.`
        );
      }
    }
  }
  config.validate(patch, create);
  return patch;
}

export async function resolveRecordIds(
  api: AhaAPI,
  patch: Record<string, unknown>,
  references: Record<string, string>
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
