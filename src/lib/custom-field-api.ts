import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
import { recordPatch, object, warnEmbedded } from './record-api';
import { descriptionText, printTable } from './record-output';
import { fieldChoices, worksheetChoices } from './custom-field-choices';
export { fieldQuery } from './record-api';
export interface CustomFieldRecord {
  id: string;
  name?: string;
  type?: string;
  record_type?: string;
  key?: string;
  description?: { body: string } | null;
  custom_field_definition?: CustomFieldRecord;
  worksheet_rows?:
    | Record<string, unknown>[]
    | { records: Record<string, unknown>[]; has_more?: boolean };
  [key: string]: unknown;
}
export const definitionResource = 'custom_field_definitions';
export const optionResource = 'custom_field_options';
export function customFieldFlags(option = false) {
  return {
    ...BaseCommand.flags,
    json: Flags.boolean({ description: 'Output JSON without prompting' }),
    fields: Flags.string({
      description:
        'Comma-separated API v3 fields (embedded collections may be capped)',
      default: option
        ? 'default,custom_field_definition,color,hidden,position,parent_id'
        : 'default,record_type,internal_name,description,position,layouts,options,prefix,suffix,use_delimiters,label,display,scope,supported_file_types,linked_custom_table,project_scope,scoring_system,worksheet_rows,custom_table',
    }),
  };
}
export const definitionEditFlags = {
  title: Flags.string({ char: 't', description: 'Custom field name' }),
  body: Flags.string({
    char: 'b',
    description: 'Plain-text description; use JSON for HTML',
  }),
  key: Flags.string({
    description: 'Field key: lowercase letters, digits and underscores',
  }),
  input: Flags.string({
    description: 'Writable record JSON object from a file, or - for stdin',
  }),
};
export const definitionCreateFlags = {
  ...definitionEditFlags,
  type: Flags.string({
    description:
      'Published v3 field type, e.g. number or predefined_choice_list',
  }),
  recordType: Flags.string({
    description: 'Record type slug, e.g. feature, idea or custom_table',
  }),
};
export const optionEditFlags = {
  title: Flags.string({ char: 't', description: 'Option name' }),
  color: Flags.string({ description: 'Six-digit hex color, e.g. #123456' }),
  position: Flags.string({ description: 'Integer sibling position' }),
  hidden: Flags.boolean({
    description: 'Hide from new selections (false shows it)',
  }),
  input: definitionEditFlags.input,
};
export const definitionParentFlag = Flags.string({
  description: 'Owning custom field definition numeric ID',
});
export function customFieldIdentifier(
  args: string[],
  topic: string,
  action: string
) {
  if (args.length !== 1 || !/^\d+$/.test(args[0]))
    throw new Error(`Usage: aha ${topic} ${action} <numeric-id>`);
  return args[0];
}
export function numericId(value: unknown, label: string) {
  if (typeof value !== 'string' || !/^\d+$/.test(value))
    throw new Error(`${label} requires a numeric string ID.`);
  return value;
}
function enumValue(value: unknown, choices: readonly string[], key: string) {
  if (typeof value !== 'string' || !choices.includes(value))
    throw new Error(`${key} must be one of: ${choices.join(', ')}.`);
}
function integer(value: unknown, key: string) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value))
    throw new Error(`${key} must be a safe integer.`);
}
const definitionWritable = new Set([
  'name',
  'key',
  'internal_name',
  'description',
  'position',
  'type',
  'record_type',
  'custom_table_id',
  'layouts',
  'prefix',
  'suffix',
  'use_delimiters',
  'label',
  'display',
  'scope',
  'supported_file_types',
  'linked_custom_table_id',
  'project_scope',
  'scoring_system_id',
  'worksheet_rows',
]);
const choices = new Set([
  'predefined_choice_list',
  'editable_choice_list',
  'predefined_tags',
  'tags',
  'conditional_choice',
]);
const relationships = new Set([
  'many_to_many_relationship',
  'many_to_one_relationship',
  'one_to_many_relationship',
]);
const recordTypes = new Set<string>(
  fieldChoices.type.slice(fieldChoices.type.indexOf('users'))
);
export async function definitionPatch(
  flags: Record<string, string | boolean>,
  create: boolean
) {
  return recordPatch(flags, create, {
    resource: 'custom-field',
    writable: definitionWritable,
    references: {},
    flagKeys: {
      title: 'name',
      body: 'description',
      key: 'key',
      type: 'type',
      recordType: 'record_type',
    },
    validate(patch) {
      if (
        create &&
        (!patch.name || !patch.key || !patch.type || !patch.record_type)
      )
        throw new Error(
          'Create requires title, key, type and record_type (use flags or --input).'
        );
      if (!create) {
        for (const key of [
          'type',
          'record_type',
          'custom_table_id',
          'linked_custom_table_id',
        ])
          if (key in patch)
            throw new Error(`${key} can only be set on create.`);
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      for (const key of [
        'key',
        'internal_name',
        'description',
        'prefix',
        'suffix',
        'label',
      ])
        if (
          key in patch &&
          patch[key] !== null &&
          typeof patch[key] !== 'string'
        )
          throw new Error(`${key} must be a string or null.`);
      if (
        'key' in patch &&
        (typeof patch.key !== 'string' || !/^[a-z0-9_]+$/.test(patch.key))
      )
        throw new Error(
          'key must contain lowercase letters, digits or underscores.'
        );
      if ('position' in patch) integer(patch.position, 'position');
      if (
        'use_delimiters' in patch &&
        patch.use_delimiters !== null &&
        typeof patch.use_delimiters !== 'boolean'
      )
        throw new Error('use_delimiters must be boolean or null.');
      for (const key of [
        'type',
        'record_type',
        'display',
        'scope',
        'project_scope',
      ] as const)
        if (key in patch) enumValue(patch[key], fieldChoices[key], key);
      for (const key of [
        'custom_table_id',
        'linked_custom_table_id',
        'scoring_system_id',
      ])
        if (key in patch) numericId(patch[key], key);
      if (
        'supported_file_types' in patch &&
        patch.supported_file_types !== null
      ) {
        if (
          !Array.isArray(patch.supported_file_types) ||
          patch.supported_file_types.some(
            x =>
              typeof x !== 'string' ||
              ![
                'csv',
                'doc',
                'docx',
                'eml',
                'gif',
                'jpeg',
                'mov',
                'mp4',
                'msg',
                'pdf',
                'png',
                'ppt',
                'pptx',
                'tiff',
                'txt',
                'xls',
                'xlsx',
              ].includes(x)
          )
        )
          throw new Error(
            'supported_file_types requires supported extension slugs, or null.'
          );
      }
      if ('layouts' in patch) {
        if (!Array.isArray(patch.layouts))
          throw new Error('layouts must be an item patch array.');
        const seen = new Set<string>();
        for (const raw of patch.layouts) {
          const item = object(raw, 'layouts item');
          if (Object.keys(item).some(k => !['id', '_destroy'].includes(k)))
            throw new Error('layouts items accept id and _destroy only.');
          const id = numericId(item.id, 'layout id');
          if (seen.has(id)) throw new Error('Duplicate layout ID in patch.');
          seen.add(id);
          if ('_destroy' in item && typeof item._destroy !== 'boolean')
            throw new Error('_destroy must be boolean.');
        }
      }
      if ('worksheet_rows' in patch)
        validateWorksheetRows(patch.worksheet_rows);
      if (create)
        validateDefinitionContext(
          patch,
          { type: String(patch.type), record_type: String(patch.record_type) },
          true
        );
    },
  });
}
export function validateDefinitionContext(
  patch: Record<string, unknown>,
  existing: Partial<CustomFieldRecord>,
  create = false
) {
  const type = existing.type;
  if (!type)
    throw new Error(
      'The API did not return the definition type; nothing was written.'
    );
  const applies: Record<string, boolean> = {
    prefix: type === 'number',
    suffix: type === 'number',
    use_delimiters: type === 'number',
    label: type === 'checkbox',
    display: ['predefined_choice_list', 'editable_choice_list'].includes(type),
    scope: recordTypes.has(type),
    supported_file_types: type === 'attachment',
    linked_custom_table_id: relationships.has(type),
    project_scope: [
      'many_to_many_relationship',
      'many_to_one_relationship',
    ].includes(type),
    scoring_system_id: type === 'scorecard',
    worksheet_rows: type === 'worksheet',
  };
  for (const [key, valid] of Object.entries(applies))
    if (key in patch && !valid)
      throw new Error(`${key} does not apply to ${type} fields.`);
  if (
    create &&
    existing.record_type === 'custom_table' &&
    !patch.custom_table_id
  )
    throw new Error('custom_table fields require custom_table_id.');
  if (
    create &&
    existing.record_type !== 'custom_table' &&
    'custom_table_id' in patch
  )
    throw new Error('custom_table_id only applies to custom_table fields.');
  if (create && relationships.has(type) && !patch.linked_custom_table_id)
    throw new Error('Relationship fields require linked_custom_table_id.');
  if (create && type === 'scorecard' && !patch.scoring_system_id)
    throw new Error('Scorecard fields require scoring_system_id.');
  if (
    'layouts' in patch &&
    ['custom_table', 'idea_organization', 'idea_user'].includes(
      existing.record_type || ''
    )
  )
    throw new Error(
      'layouts cannot be set on custom table or account-level fields.'
    );
  if (
    'project_scope' in patch &&
    existing.record_type === 'idea_organization' &&
    patch.project_scope !== 'account'
  )
    throw new Error(
      'Organization relationship fields support account project_scope only.'
    );
  if (Array.isArray(patch.worksheet_rows))
    validateWorksheetRows(
      patch.worksheet_rows,
      existing.worksheet_rows,
      create
    );
}
function validateWorksheetRows(
  value: unknown,
  existing?: CustomFieldRecord['worksheet_rows'],
  create = false
) {
  if (!Array.isArray(value))
    throw new Error('worksheet_rows must be an item patch array.');
  const seen = new Set<string>();
  for (const raw of value) {
    const row = object(raw, 'worksheet row');
    const keys = [
      'id',
      'type',
      'name',
      'equation',
      'format',
      'precision',
      'show_thousand_separator',
      'currency',
      'date_format',
      '_destroy',
    ];
    if (Object.keys(row).some(k => !keys.includes(k)))
      throw new Error('Unknown worksheet row field.');
    if ('id' in row && (typeof row.id !== 'string' || !row.id))
      throw new Error('Worksheet row id must be a nonempty string.');
    if (typeof row.id === 'string') {
      if (seen.has(row.id)) throw new Error('Duplicate worksheet row id.');
      seen.add(row.id);
      if (create) throw new Error('New worksheet rows must omit id.');
    }
    if ('_destroy' in row && typeof row._destroy !== 'boolean')
      throw new Error('_destroy must be boolean.');
    if (row._destroy === true) {
      if (!row.id) throw new Error('Removing a worksheet row requires id.');
      continue;
    }
    const oldRows = Array.isArray(existing) ? existing : existing?.records;
    const old = oldRows?.find(x => x.id === row.id);
    if (
      row.id &&
      existing &&
      !old &&
      (Array.isArray(existing) || !existing.has_more)
    )
      throw new Error('Worksheet row id was not found.');
    if (!row.id && !row.type)
      throw new Error('New worksheet rows require type.');
    for (const key of ['type', 'format', 'currency', 'date_format'] as const)
      if (key in row) enumValue(row[key], worksheetChoices[key], key);
    if (old && row.type && old.type !== row.type)
      throw new Error('A worksheet row type cannot change.');
    for (const key of ['name', 'equation'])
      if (key in row && typeof row[key] !== 'string')
        throw new Error(`${key} must be a string.`);
    const kind = row.type || old?.type;
    const format =
      row.format || old?.format || (!row.id ? 'number' : undefined);
    if (
      kind === 'section' &&
      [
        'equation',
        'format',
        'precision',
        'show_thousand_separator',
        'currency',
        'date_format',
      ].some(k => k in row)
    )
      throw new Error('Section rows cannot have field settings.');
    if ('precision' in row) {
      integer(row.precision, 'precision');
      if (![0, 1, 2].includes(Number(row.precision)))
        throw new Error('precision must be 0, 1 or 2.');
    }
    if (
      'show_thousand_separator' in row &&
      typeof row.show_thousand_separator !== 'boolean'
    )
      throw new Error('show_thousand_separator must be boolean.');
    if (format)
      for (const [key, formats] of Object.entries({
        precision: ['number', 'percent'],
        show_thousand_separator: ['number', 'percent'],
        currency: ['currency'],
        date_format: ['date'],
      }))
        if (key in row && !formats.includes(String(format)))
          throw new Error(`${key} does not apply to ${format} worksheet rows.`);
  }
}
export async function optionPatch(
  flags: Record<string, string | boolean>,
  create: boolean,
  argv: string[]
) {
  return recordPatch(flags, create, {
    resource: 'custom-field-option',
    writable: new Set([
      'name',
      'color',
      'hidden',
      'position',
      'parent_id',
      'custom_field_definition_id',
    ]),
    references: {},
    flagKeys: {
      title: 'name',
      color: 'color',
      position: 'position',
      definition: 'custom_field_definition_id',
      parent: 'parent_id',
    },
    validate(patch) {
      if (
        argv.some(arg => arg === '--hidden' || arg.startsWith('--hidden=')) &&
        typeof flags.hidden === 'boolean'
      ) {
        if ('hidden' in patch)
          throw new Error('Supply hidden through either --input or --hidden.');
        patch.hidden = flags.hidden;
      }
      if (typeof flags.position === 'string') {
        if (!/^-?\d+$/.test(flags.position))
          throw new Error('position must be an integer.');
        patch.position = Number(flags.position);
      }
      if (create && (!patch.name || !patch.custom_field_definition_id))
        throw new Error(
          'Create requires title and definition ID (or --input).'
        );
      if (!create) {
        for (const key of ['custom_field_definition_id', 'parent_id'])
          if (key in patch)
            throw new Error(`${key} can only be set on create.`);
        if (!Object.keys(patch).length)
          throw new Error('Supply at least one field to edit.');
      }
      if ('custom_field_definition_id' in patch)
        numericId(patch.custom_field_definition_id, 'definition');
      if ('parent_id' in patch && patch.parent_id !== null)
        numericId(patch.parent_id, 'parent_id');
      if (
        'color' in patch &&
        patch.color !== null &&
        (typeof patch.color !== 'string' ||
          !/^#[0-9a-f]{6}$/i.test(patch.color))
      )
        throw new Error('color must be six-digit hex or null.');
      if ('hidden' in patch && typeof patch.hidden !== 'boolean')
        throw new Error('hidden must be boolean.');
      if ('position' in patch) integer(patch.position, 'position');
    },
  });
}
export function validateOptionContext(
  patch: Record<string, unknown>,
  definition: CustomFieldRecord
) {
  if (!definition.type || !choices.has(definition.type))
    throw new Error('Options require a choice field definition.');
  if ('parent_id' in patch && definition.type !== 'conditional_choice')
    throw new Error('parent_id only applies to conditional choice options.');
}
export async function fetchCustomField(
  api: AhaAPI,
  resource: string,
  id: string,
  query: URLSearchParams
): Promise<CustomFieldRecord> {
  const result = await api.get(
    `/api/v3/${resource}/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: CustomFieldRecord }).record;
}
export function printCustomField(
  command: BaseCommand,
  record: CustomFieldRecord
) {
  warnEmbedded(record);
  if (command.flags.json) {
    command.log(JSON.stringify(record, null, 2));
    return;
  }
  command.log(`${record.id}${record.name ? `: ${record.name}` : ''}`);
  for (const [key, value] of Object.entries(record)) {
    if (['id', 'name', 'description'].includes(key) || value === null) continue;
    if (['string', 'number', 'boolean'].includes(typeof value))
      command.log(
        `${key.replace(/_/g, ' ')}: ${
          typeof value === 'boolean' ? (value ? 'yes' : 'no') : value
        }`
      );
  }
  if (record.description?.body)
    command.log(descriptionText(record.description.body));
  for (const key of [
    'custom_field_definition',
    'custom_table',
    'linked_custom_table',
    'scoring_system',
  ]) {
    const link = record[key] as CustomFieldRecord | null;
    if (link)
      command.log(
        `${key.replace(/_/g, ' ')}: ${link.id}${
          link.name ? ` (${link.name})` : ''
        }`
      );
  }
  if (Array.isArray(record.supported_file_types))
    command.log(
      `Supported file types: ${record.supported_file_types.join(', ') || 'all'}`
    );
  for (const key of ['options', 'layouts', 'worksheet_rows']) {
    const collection = record[key] as
      | CustomFieldRecord[]
      | { records: CustomFieldRecord[] }
      | null;
    if (collection) {
      const items = Array.isArray(collection) ? collection : collection.records;
      command.log(`${key.replace(/_/g, ' ')} shown: ${items.length}`);
      if (items.length)
        printTable(
          command,
          ['ID', 'TITLE'],
          items.map(x => [x.id, x.name || ''])
        );
    }
  }
}
