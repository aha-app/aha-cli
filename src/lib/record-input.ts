import { prompt } from 'inquirer';

export async function promptForTitle(
  value: string | boolean | undefined,
  json: boolean
): Promise<string> {
  let title = typeof value === 'string' ? value.trim() : '';
  if (!title && value === undefined && process.stdin.isTTY && !json) {
    const answers = await prompt<{ title: string }>({
      type: 'input',
      name: 'title',
      message: 'Title',
      validate: (answer: string) =>
        Boolean(answer.trim()) || 'A title is required',
    });
    title = answers.title.trim();
  }
  return title;
}

export function plainTextBody(value: string): string {
  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, '<br>');
  return `<p>${escaped}</p>`;
}
