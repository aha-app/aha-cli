import BaseCommand from '../base';

export function printTable(
  command: BaseCommand,
  headers: string[],
  rows: string[][]
) {
  const cells = [headers, ...rows].map(row =>
    row.map(cell => cell.replace(/\s+/g, ' '))
  );
  const widths = headers.map((_, index) =>
    Math.max(...cells.map(row => row[index].length))
  );
  for (const row of cells) {
    command.log(
      row
        .map((cell, index) =>
          index === row.length - 1 ? cell : cell.padEnd(widths[index])
        )
        .join('  ')
    );
  }
}

export function descriptionText(html: string): string {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };
  return html
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(
      /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
      (match, entity: string) => {
        if (!entity.startsWith('#'))
          return entities[entity.toLowerCase()] || match;
        const code = entity.toLowerCase().startsWith('#x')
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }
    )
    .trim();
}

export function printRecordResult(
  command: BaseCommand,
  record: { id: string; name?: string; html_url?: string },
  message: string
) {
  if (command.flags.json) command.log(JSON.stringify(record, null, 2));
  else {
    command.log(`${message}: ${record.name || record.id}`);
    command.log(record.html_url || `ID: ${record.id}`);
  }
}
