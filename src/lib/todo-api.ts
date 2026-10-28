import AhaAPI from '../api';
import BaseCommand from '../base';
import { Flags } from './flags';

export const todoFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON for scripts' }),
};

export const todoFields =
  'default,type,description,status,due_date,assigned_to,record';

export interface TodoAssignment {
  id: string;
  type: string;
  status: string;
  name?: string;
}

export interface Todo {
  id: string;
  name: string;
  reference_num?: string;
  html_url?: string;
  due_date?: string | null;
  type?: string;
  status?: string;
  description?: { body: string };
  record?: {
    id: string;
    type: string;
    name?: string;
    reference_num?: string;
    html_url?: string;
  } | null;
  assigned_to: { records: TodoAssignment[]; has_more: boolean };
}

export interface TodoResponse {
  record: Todo;
}

export function todoIdentifier(argv: string[], action: string): string {
  if (
    argv.length !== 1 ||
    !/^(?:\d+|[A-Za-z0-9][A-Za-z0-9-]*-TODO-\d+)$/i.test(argv[0])
  ) {
    throw new Error(`Usage: aha todo ${action} <id-or-reference>`);
  }
  return argv[0];
}

export async function fetchTodo(api: AhaAPI, id: string): Promise<Todo> {
  const result = await api.get(
    `/api/v3/tasks/${encodeURIComponent(id)}?fields=${todoFields}`
  );
  return (result.body as TodoResponse).record;
}

export function printTodoResult(
  command: BaseCommand,
  todo: Todo,
  message: string
) {
  if (command.flags.json) command.log(JSON.stringify(todo, null, 2));
  else {
    command.log(`${message}: ${todo.name}`);
    command.log(todo.html_url || `ID: ${todo.id}`);
  }
}

export async function currentUserId(api: AhaAPI): Promise<string> {
  // V3 exposes users by ID, but has no current-user endpoint.
  const result = await api.get('/api/v1/me');
  const me = result.body as { user?: { id?: string } };
  if (typeof me?.user?.id !== 'string' || !me.user.id) {
    throw new Error(
      'Could not determine the signed-in user. No to-do was changed.'
    );
  }
  return me.user.id;
}

export async function ownAssignment(
  api: AhaAPI,
  todo: Todo,
  userId: string
): Promise<TodoAssignment | undefined> {
  const assignment = todo.assigned_to.records.find(
    item => item.id === userId && item.type === 'user'
  );
  if (!assignment && todo.assigned_to.has_more) {
    // V3 caps embedded assignments at 25 and exposes no assignment pagination.
    // V1 includes all user assignments; use it only to resolve this missing user.
    const result = await api.get(
      `/api/v1/tasks/${encodeURIComponent(todo.id)}?fields=assigned_to_users`
    );
    const body = result.body as {
      task?: {
        assigned_to_users?: {
          status: string;
          user: { id: string; name?: string };
        }[];
      };
    };
    if (!Array.isArray(body?.task?.assigned_to_users)) {
      throw new Error('Could not retrieve the full to-do assignment list.');
    }
    const own = body.task.assigned_to_users.find(
      item => item.user?.id === userId
    );
    if (!own) return undefined;
    if (own.status !== 'pending' && own.status !== 'completed') {
      throw new Error('Could not determine your to-do assignment status.');
    }
    return {
      id: userId,
      type: 'user',
      status: own.status,
      name: own.user.name,
    };
  }
  return assignment;
}
