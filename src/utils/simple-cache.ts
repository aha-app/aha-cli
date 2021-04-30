import * as crypto from 'crypto';
import * as path from 'path';
import { promises as fs } from 'fs';

/**
 * A simple filesystem cache that stores keys by hash.
 *
 * ```
 * const cache = await SimpleCache.create('path/to/cache/dir');
 * await cache.has('abc123'); // false
 * await cache.set('abc123', Buffer.concat('hello'));
 * await cache.has('abc123'); // true
 * await cache.get('abc123'); // Buffer('hello')
 */
export class SimpleCache {
  private location: string;

  /**
   * Create the cache. If the location directory does not exist it will be created
   *
   * @param location Filesystem path
   */
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

  /**
   * @param url key identifiying the file
   * @param data file data
   */
  async set(url: string, data: Buffer) {
    const filePath = path.join(this.location, this.hash(url));
    return fs.writeFile(filePath, data);
  }

  /**
   * @param url key identifying the file
   * @returns Buffer of the stored file data
   */
  async get(url: string) {
    if (!(await this.hash(url))) throw new Error(`URL ${url} is not cached`);
    return fs.readFile(path.join(this.location, this.hash(url)));
  }

  /**
   * @param url key identifying the file
   * @returns true of false if the cache has an entry for the key
   */
  async has(url: string) {
    try {
      const stat = await fs.stat(path.join(this.location, this.hash(url)));
      return stat.isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * @param url key identifying the file
   * @returns hashed key
   */
  hash(url: string) {
    const hasher = crypto.createHmac('sha256', this.location);
    return hasher.update(url).digest('hex');
  }
}
