import * as fs from 'fs';
import * as path from 'path';

let _packageRoot: string;
export function packageRoot() {
  if (_packageRoot) return _packageRoot;

  let searchDir = path.resolve(__dirname);

  while (path.dirname(searchDir) !== searchDir) {
    try {
      if (fs.statSync(path.join(searchDir, 'package.json')).isFile()) {
        _packageRoot = searchDir;
        return searchDir;
      }
    } catch (error) {}

    searchDir = path.dirname(searchDir);
  }

  throw new Error('Cannot find package root');
}

export function packageInfo() {
  return JSON.parse(
    fs.readFileSync(path.join(packageRoot(), 'package.json')) as any
  );
}
