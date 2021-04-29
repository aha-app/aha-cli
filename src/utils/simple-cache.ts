import * as crypto from 'crypto';
import * as path from 'path';
import { promises as fs } from 'fs';

export class SimpleCache {
  private location: string;

  static async create(location: string) {
    const resolved = path.resolve(location);

    try {
      const stat = await fs.stat(resolved);
      if (!stat.isDirectory()) {
        throw new Error(
          `Cache location ${location} exists but is not a directory`
        );
      }
    } catch (error) {
      await fs.mkdir(resolved);
    }

    return new SimpleCache(location);
  }

  constructor(location: string) {
    this.location = path.resolve(location);
  }

  async set(url: string, data: Buffer) {
    const filePath = path.join(this.location, this.hash(url));
    return fs.writeFile(filePath, data);
  }

  async get(url: string) {
    if (!(await this.hash(url))) throw new Error(`URL ${url} is not cached`);
    return fs.readFile(path.join(this.location, this.hash(url)));
  }

  async has(url: string) {
    try {
      const stat = await fs.stat(path.join(this.location, this.hash(url)));
      return stat.isFile();
    } catch (error) {
      return false;
    }
  }

  hash(url: string) {
    const hasher = crypto.createHmac('sha256', this.location);
    return hasher.update(url).digest('hex');
  }
}
