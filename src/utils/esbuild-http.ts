import { Plugin } from 'esbuild';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { SimpleCache } from './simple-cache';

interface HttpPluginOptions {
  cache?: SimpleCache;
}

function fetch(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib
      .get(url, res => {
        if (
          res.headers.location &&
          [301, 302, 307].includes(Number(res.statusCode))
        ) {
          fetch(new URL(res.headers.location, url).toString());
          req.abort();
        } else if (res.statusCode === 200) {
          const chunks: Uint8Array[] = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        } else {
          reject(new Error(`GET ${url} failed: status ${res.statusCode}`));
        }
      })
      .on('error', reject);
  });
}

const httpPlugin = (options: HttpPluginOptions): Plugin => {
  const cache = options.cache;

  return {
    name: 'http',
    setup(build) {
      // Intercept import paths starting with "http:" and "https:" so
      // esbuild doesn't attempt to map them to a file system location.
      // Tag them with the "http-url" namespace to associate them with
      // this plugin.
      build.onResolve({ filter: /^https?:\/\// }, args => ({
        path: args.path,
        namespace: 'http-url',
      }));

      // We also want to intercept all import paths inside downloaded
      // files and resolve them against the original URL. All of these
      // files will be in the "http-url" namespace. Make sure to keep
      // the newly resolved URL in the "http-url" namespace so imports
      // inside it will also be resolved as URLs recursively.
      build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => ({
        path: new URL(args.path, args.importer).toString(),
        namespace: 'http-url',
      }));

      // When a URL is loaded, we want to actually download the content
      // from the internet. This has just enough logic to be able to
      // handle the example import from unpkg.com but in reality this
      // would probably need to be more complex.
      build.onLoad({ filter: /.*/, namespace: 'http-url' }, async args => {
        let contents: Buffer;

        if (cache && (await cache.has(args.path))) {
          contents = await cache.get(args.path);
        } else {
          contents = await fetch(args.path);

          if (cache) {
            await cache.set(args.path, contents);
          }
        }

        return { contents };
      });
    },
  };
};

export { httpPlugin };
