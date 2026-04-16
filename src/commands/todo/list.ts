import BaseCommand from '../../base';

interface Task {
  id: string;
  name: string;
  status?: string;
  due_date?: string;
  created_at?: string;
}

interface TasksResponse {
  tasks: Task[];
  pagination: {
    total_pages: number;
    current_page: number;
  };
}

export default class TodoList extends BaseCommand {
  static needsAuth = true;
  static description = 'List your to-dos';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const allTasks: Task[] = [];
    let page = 1;

    while (true) {
      const result = await this.api.get(`/api/v1/me/tasks?page=${page}`);
      const data = result.body as TasksResponse;

      allTasks.push(...data.tasks);

      if (page >= data.pagination.total_pages) break;
      page++;
    }

    if (allTasks.length === 0) {
      this.log('No pending to-dos.');
      return;
    }

    // Sort by created_at descending (newest first)
    allTasks.sort((a, b) => {
      const dateA = a.created_at || '';
      const dateB = b.created_at || '';
      return dateB.localeCompare(dateA);
    });

    allTasks.forEach((task, i) => {
      const due = task.due_date || 'no due date';
      const status = task.status || 'pending';
      this.log(
        `${i + 1}. ${task.name} | id=${task.id} | status=${status} | due=${due}`
      );
    });
  }
}
