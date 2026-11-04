import { plainTextBody } from './record-input';
import AhaAPI from '../api';
import { Flags } from './flags';
import { currentUserId } from './todo-api';

export const editableTodoFlags = {
  title: Flags.string({ char: 't', description: 'Title of the to-do' }),
  body: Flags.string({
    char: 'b',
    description: 'Description of the to-do (plain text; empty clears it)',
  }),
  due: Flags.string({ description: 'Due date in YYYY-MM-DD format' }),
  record: Flags.string({
    description: 'Parent record ID or reference (requires --record-type)',
  }),
  recordType: Flags.string({
    description:
      'Parent record type, e.g. feature, requirement, release, or page',
  }),
};

type FlagValues = Record<string, string | boolean>;

export interface AssignmentPatch {
  id: string;
  type: 'user';
  _destroy?: boolean;
}

export interface TodoPatch {
  name?: string;
  description?: string;
  due_date?: string | null;
  record_id?: string | null;
  record_type?: string | null;
  assigned_to?: AssignmentPatch[];
}

export function editableTodoPatch(flags: FlagValues): TodoPatch {
  const patch: TodoPatch = {};
  if (typeof flags.title === 'string') {
    if (!flags.title.trim())
      throw new Error('A title is required. Use --title "My to-do".');
    patch.name = flags.title.trim();
  }
  if (typeof flags.body === 'string')
    patch.description = plainTextBody(flags.body);
  if (flags.clearDue && flags.due !== undefined)
    throw new Error('Use either --due or --clear-due.');
  if (flags.clearDue) patch.due_date = null;
  if (typeof flags.due === 'string') {
    const date = new Date(`${flags.due}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(flags.due) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== flags.due
    ) {
      throw new Error('Due date must be a valid date in YYYY-MM-DD format.');
    }
    patch.due_date = flags.due;
  }
  if (
    flags.clearRecord &&
    (flags.record !== undefined || flags.recordType !== undefined)
  ) {
    throw new Error(
      'Use either --record with --record-type, or --clear-record.'
    );
  }
  if (flags.clearRecord) {
    patch.record_id = null;
    patch.record_type = null;
  } else if (flags.record !== undefined || flags.recordType !== undefined) {
    if (
      typeof flags.record !== 'string' ||
      !flags.record.trim() ||
      typeof flags.recordType !== 'string' ||
      !/^[a-z][a-z0-9_]*$/.test(flags.recordType)
    ) {
      throw new Error(
        '--record and --record-type must be provided together, e.g. --record DEMO-123 --record-type feature.'
      );
    }
    patch.record_id = flags.record.trim();
    patch.record_type = flags.recordType;
  }
  return patch;
}

export function assigneeValues(
  value: string | boolean | undefined,
  flag: string
): string[] {
  if (value === undefined) return [];
  if (typeof value !== 'string')
    throw new Error(`--${flag} requires user IDs or @me.`);
  const values = value.split(',').map(item => item.trim());
  if (values.some(item => !/^(?:\d+|@me)$/.test(item))) {
    throw new Error(
      `--${flag} requires comma-separated numeric user IDs or @me.`
    );
  }
  return [...new Set(values)];
}

export async function assignmentPatch(
  api: AhaAPI,
  add: string[],
  remove: string[] = []
): Promise<AssignmentPatch[]> {
  const me = [...add, ...remove].includes('@me')
    ? await currentUserId(api)
    : undefined;
  const resolve = (ids: string[]) => [
    ...new Set(ids.map(id => (id === '@me' && me ? me : id))),
  ];
  const additions = resolve(add);
  const removals = resolve(remove);
  if (additions.some(id => removals.includes(id)))
    throw new Error('Cannot add and remove the same assignee.');
  return [
    ...additions.map((id): AssignmentPatch => ({ id, type: 'user' })),
    ...removals.map(
      (id): AssignmentPatch => ({ id, type: 'user', _destroy: true })
    ),
  ];
}
