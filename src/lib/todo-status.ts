import BaseCommand from '../base';
import {
  currentUserId,
  ownAssignment,
  todoFields,
  todoIdentifier,
  TodoResponse,
} from './todo-api';

export async function updateTodoStatus(
  command: BaseCommand,
  status: 'completed' | 'pending'
) {
  const action = status === 'completed' ? 'complete' : 'reopen';
  const { argv } = command.parse();
  const id = todoIdentifier(argv, action);

  await command.initAPI();
  const userId = await currentUserId(command.api);

  const result = await command.api.get(
    `/api/v3/tasks/${encodeURIComponent(id)}?fields=${
      command.flags.json ? todoFields : 'id,name,assigned_to'
    }`
  );
  const { record: task } = result.body as TodoResponse;
  const assignment = await ownAssignment(command.api, task, userId);
  if (!assignment) {
    throw new Error('This to-do is not assigned to you. No to-do was changed.');
  }
  if (assignment.status === status) {
    if (command.flags.json) {
      command.log(JSON.stringify(task, null, 2));
      return;
    }
    command.log(
      `Already ${status === 'completed' ? 'complete' : 'pending'} for you: ${
        task.name
      }`
    );
    return;
  }

  // Update only this user's assignment, preserving other assignees' statuses.
  const updated = await command.api.put(
    `/api/v3/tasks/${encodeURIComponent(task.id)}${
      command.flags.json ? `?fields=${todoFields}` : ''
    }`,
    {
      body: {
        record: {
          assigned_to: [{ id: userId, type: 'user', status }],
        },
      },
    }
  );
  if (command.flags.json) {
    command.log(JSON.stringify((updated.body as TodoResponse).record, null, 2));
    return;
  }
  command.log(
    `${status === 'completed' ? 'Completed' : 'Reopened'} for you: ${task.name}`
  );
}
