import { globalExternalsWithRegExp } from '@fal-works/esbuild-plugin-global-externals';
import ux from 'cli-ux';
import * as esbuild from 'esbuild';
import * as FormData from 'form-data';
import * as fs from 'fs';
import BaseCommand from '../../base';
import { httpPlugin } from '../esbuild-http';
import { uploadedPlugin } from '../esbuild-uploaded';
import { SimpleCache } from '../simple-cache';

const EXTERNALS = ['react', 'react-dom'];

/**
 * Converts a skypack url like /-/react@17.0.1?blah to just react
 */
function skyUrlToPath(path: string) {
  const matches = path.match(/-\/(.+?)@/);
  if (matches) return matches[1];
}

/**
 * Get the aha import code for externals import. i.e. when an extension says
 *
 *   import React from 'react';
 *
 * This will be translated by esbuild into something like
 *
 *   const React = aha.import('react');
 */
function pathToExternal(path: string): string {
  return `aha.import('${path}')`;
}

// Load script and resolve imports using esbuild.
export async function prepareScript(
  command: BaseCommand,
  fileMap: Record<string, string>,
  form: FormData,
  name: string,
  path: string,
  dumpCode: boolean,
  jsxFactory: string,
  jsxFragment: string,
  cache?: SimpleCache
) {
  // If no path is provided then this contribution has no script
  if (!path) {
    return;
  }

  // Check the script exists.
  if (!fs.existsSync(path)) {
    throw new Error(`Script for '${name}' does not exist at '${path}'`);
  }

  try {
    const externalsFilter = EXTERNALS.map(
      extern => `(^${extern}$)|(-/${extern}@)`
    ).join('|');

    const bundle = await esbuild.build({
      jsxFactory,
      jsxFragment,
      entryPoints: [path],
      bundle: true,
      outfile: 'bundle.js',
      plugins: [
        uploadedPlugin(fileMap),
        globalExternalsWithRegExp({
          modulePathFilter: new RegExp(externalsFilter),
          getModuleInfo: path => {
            const name = path.includes('-/') ? skyUrlToPath(path) : path;
            return {
              varName: pathToExternal(name ?? path),
              type: 'cjs',
            };
          },
        }) as any,
        httpPlugin({ cache }),
      ],
      target: 'es2020',
      write: false,
      sourcemap: 'external',
      sourcesContent: false,
      loader: { '.js': 'jsx' },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    let code = '';
    let map = '';
    for (const out of bundle.outputFiles) {
      if (out.path.endsWith('.map')) {
        map = map.concat(out.text);
      } else {
        code = code.concat(out.text);

        if (dumpCode) {
          process.stdout.write(`\n======= Start code for '${name}':\n`);
          process.stdout.write(out.contents.toString());
          process.stdout.write(`\n======= End code for '${name}'\n`);
        }
      }
    }

    form.append('extension[scripts][][name]', name);
    form.append('extension[scripts[][script_text]', code, 'script.txt');
    form.append('extension[scripts[][source_map]', map, 'source_map.txt');
  } catch (error) {
    ux.action.stop('failed');
    command.error('Compilation error', { exit: 1 });
  }
}
