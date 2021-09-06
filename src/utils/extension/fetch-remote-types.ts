import ux from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import HTTP from 'http-call';

export async function fetchRemoteTypes(extensionRoot = process.cwd()) {
  ux.action.start('Downloading JSON schemas and TypeScript types from Aha!');

  // prettier-ignore
  const typings = {
    './types/aha-components.d.ts': 'https://cdn.aha.io/assets/extensions/types/aha-components.d.ts',
    './types/aha-models.d.ts': 'https://cdn.aha.io/assets/extensions/types/aha-models.d.ts',
    './schema/schema.json': 'https://cdn.aha.io/assets/extensions/schema/schema.json',
    './schema/package-schema.json': 'https://cdn.aha.io/assets/extensions/schema/package-schema.json',
  };

  const modulePath = path.join(extensionRoot, '.aha-cache');

  const promises = Object.entries(typings).map(async ([filePath, url]) => {
    const absoluteFilePath = path.join(modulePath, filePath);
    fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
    const fileStream = fs.createWriteStream(absoluteFilePath);

    const result = await HTTP.get(url, { raw: true });
    result.response.pipe(fileStream);
    return new Promise(resolve => fileStream.on('close', resolve));
  });

  await Promise.all(promises);
  ux.action.stop();
}
