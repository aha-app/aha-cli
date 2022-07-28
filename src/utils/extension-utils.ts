import { globalExternalsWithRegExp } from '@fal-works/esbuild-plugin-global-externals';
import ux from 'cli-ux';
import * as esbuild from 'esbuild';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import HTTP from 'http-call';
import { Readable } from 'stream';
import { createGzip } from 'zlib';
import BaseCommand from '../base';
import { httpPlugin } from './esbuild-http';
import { SimpleCache } from './simple-cache';

const REACT_JSX = 'React.createElement';
const EXTERNALS = ['react', 'react-dom'];

export function readConfiguration() {
  try {
    return JSON.parse(fs.readFileSync('package.json', { encoding: 'UTF-8' }));
  } catch (error) {
    throw new Error(`Error loading package.json: ${error.message}`);
  }
}

export function identifierFromConfiguration(configuration: any) {
  return configuration.name.replace('@', '').replace('/', '.');
}

export async function fetchRemoteTypes({
  cdn = 'https://cdn.aha.io',
  extensionRoot = process.cwd(),
}: {
  cdn?: string;
  extensionRoot?: string;
}) {
  ux.action.start('Downloading JSON schemas and TypeScript types from Aha!');

  // prettier-ignore
  const typings = {
    './types/aha-components.d.ts': `${cdn}/assets/extensions/types/aha-components.d.ts`,
    './types/aha-models.d.ts': `${cdn}/assets/extensions/types/aha-models.d.ts`,
    './schema/schema.json': `${cdn}/assets/extensions/schema/schema.json`,
    './schema/package-schema.json': `${cdn}/assets/extensions/schema/package-schema.json`,
  };

  const modulePath = path.join(extensionRoot, '.aha-cache');

  const promises = Object.entries(typings).map(async ([filePath, url]) => {
    const absoluteFilePath = path.join(modulePath, filePath);
    fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
    const fileStream = fs.createWriteStream(absoluteFilePath);

    try {
      const result = await HTTP.get(url, { raw: true });
      result.response.pipe(fileStream);
      return new Promise(resolve => fileStream.on('close', resolve));
    } catch (error) {
      fileStream.close();
    }
  });

  await Promise.all(promises);
  ux.action.stop();
}

function fileNameFromConfiguration(configuration: any) {
  return `${identifierFromConfiguration(configuration)}-v${
    configuration.version
  }`;
}

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

// Compile and upload an extension.
export async function installExtension(
  command: BaseCommand,
  dumpCode: boolean,
  skipCache = false
) {
  let form: any = null;

  try {
    const configuration = readConfiguration();
    process.stdout.write(
      `Installing extension '${configuration.name}' to '${command.api.config.baseURL}'\n`
    );
    form = await prepareExtensionForm(command, dumpCode, skipCache);
  } catch (error) {
    ux.action.stop('error');
    throw error;
  }

  // Upload all of the scripts and configuration in one go. This requires the
  // use of form encoding, but it turns out to be much faster to just have one
  // server round-trip with more data, than multiple round trips. It also allows
  // us to treat extension updates atomically - which prevents mismatched code.
  ux.action.start('Uploading');
  try {
    await command.api.post('/api/v1/extensions', {
      body: new Readable({
        read() {
          this.push(form.getBuffer());
          this.push(null);
        },
      }),
      headers: {
        'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
      },
    });

    ux.action.stop('done');
  } catch (error) {
    ux.action.stop('error');

    if (error.http.body.errors) {
      const errorTree = ux.tree();
      const errors: { [index: string]: string[] } = error.http.body.errors;
      Object.keys(errors).forEach(identifier => {
        errorTree.insert(identifier);
        errors[identifier].forEach(error =>
          errorTree.nodes[identifier].insert(error)
        );
      });

      errorTree.display();
    } else {
      throw new Error(error.http.body.error);
    }
  }
}

// Generate a file that contains the extension configuration and code in the
// same form-data format that is used when it is uploaded.
export async function buildExtension(command: BaseCommand, skipCache = false) {
  const configuration = readConfiguration();
  const fileName = `${fileNameFromConfiguration(configuration)}.gz`;
  process.stdout.write(
    `Building extension '${configuration.name}' to '${fileName}'\n`
  );
  const form = await prepareExtensionForm(command, false, skipCache);

  ux.action.start('Saving');
  const gzip = createGzip();
  const output = fs.createWriteStream(fileName);
  gzip.pipe(output);
  gzip.write(form.getBuffer());
  gzip.end();

  ux.action.stop('done');
}

async function prepareExtensionForm(
  command: BaseCommand,
  dumpCode: boolean,
  skipCache: boolean
) {
  // Upload the sources for the contributions. Validate we don't have more
  // than one contribution with the same name.
  const form = new FormData();
  const contributionScripts: any = {};
  const configuration = readConfiguration();
  const jsxFactory = configuration.ahaExtension.jsxFactory || REACT_JSX;
  const jsxFragment = jsxFactory === REACT_JSX ? 'React.Fragment' : 'Fragment';
  const contributions = configuration.ahaExtension.contributes;
  const scriptPaths: string[] = [];
  const cache = skipCache ? undefined : await SimpleCache.create('.aha-cache');

  const compilers = Object.keys(contributions)
    .flatMap(contributionType => {
      const typeContributions = contributions[contributionType];

      return Object.keys(typeContributions).map(contributionName => {
        if (contributionScripts[contributionName]) {
          throw new Error(
            `Two extensions share the same name of '${contributionName}'. Contribution names must be unique within the extension.`
          );
        }

        const contribution = typeContributions[contributionName];

        process.stdout.write(
          `   contributes ${contributionType}: '${contributionName}'\n`
        );

        // Only compile each entrypoint once.
        if (scriptPaths.includes(contribution.entryPoint)) {
          return null;
        }
        scriptPaths.push(contribution.entryPoint);

        // Compile and upload script. We just generate a promise here and
        // then wait for them all in parallel below.
        return prepareScript(
          command,
          form,
          contributionName,
          contribution.entryPoint,
          dumpCode,
          jsxFactory,
          jsxFragment,
          cache
        );
      });
    })
    .filter(n => n);

  ux.action.start('Compiling');
  await Promise.all(compilers);

  ux.action.stop('done');

  // Add general extension parameters
  form.append(
    'extension[identifier]',
    identifierFromConfiguration(configuration)
  );
  form.append('extension[name]', configuration.description);
  form.append('extension[version]', configuration.version);
  form.append('extension[author]', configuration.author);
  form.append(
    'extension[repository]',
    configuration.repository?.url || configuration.repository
  );
  form.append(
    'extension[configuration]',
    JSON.stringify(configuration.ahaExtension)
  );

  return form;
}

// Load script and resolve imports using esbuild.
async function prepareScript(
  command: BaseCommand,
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
