import { globalExternalsWithRegExp } from '@fal-works/esbuild-plugin-global-externals';
import ux from 'cli-ux';
import * as esbuild from 'esbuild';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';
import BaseCommand from '../base';
import { httpPlugin } from './esbuild-http';

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

export async function installExtension(
  command: BaseCommand,
  dumpCode: boolean
) {
  // TODO: Perhaps the installation should upload the "contributes" section
  // from the package.json file as-is. The server can then track exactly
  // what the extension needs. If the extension creates a custom field then
  // perhaps we could link the field back to the extension, so you could see
  // where it came from, and optionally remove the field if the extension
  // is removed.

  // Upload the sources for the contributions. Validate we don't have more
  // than one contribution with the same name.
  const contributionScripts: any = {};
  const configuration = readConfiguration();
  const form = new FormData();
  const jsxFactory = configuration.ahaExtension.jsxFactory || REACT_JSX;
  const jsxFragment = jsxFactory === REACT_JSX ? 'React.Fragment' : 'Fragment';
  process.stdout.write(`Installing extension '${configuration.name}'\n`);
  const contributions = configuration.ahaExtension.contributes;

  const compilers = Object.keys(contributions).flatMap((contributionType) => {
    const typeContributions = contributions[contributionType];

    return Object.keys(typeContributions).map((contributionName) => {
      if (contributionScripts[contributionName]) {
        throw new Error(
          `Two extensions share the same name of '${contributionName}'. Contribution names must be unique within the extension.`
        );
      }

      const contribution = typeContributions[contributionName];

      process.stdout.write(
        `   contributes ${contributionType}: '${contributionName}'\n`
      );

      // Compile and upload script. We just generate a promise here and
      // then wait for them all in parallel below.
      return prepareScript(
        command,
        form,
        contributionName,
        contribution.entryPoint,
        dumpCode,
        jsxFactory,
        jsxFragment
      );
    });
  });

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
  form.append('extension[repository]', configuration.repository.url);
  form.append(
    'extension[configuration]',
    JSON.stringify(configuration.ahaExtension)
  );

  // Upload all of the scripts and configuration in one go. This requires the
  // use of form encoding, but it turns out to be much faster to just have one
  // server round-trip with more data, than multiple round trips. It also allows
  // us to treat extension updates atomically - which prevents mismatched code.
  ux.action.start('Uploading');
  const response = await command.api.post('/api/v1/extensions', {
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

  if (response?.body?.errors) {
    ux.action.stop('error');

    const errors: { [index: string]: string[] } = response.body.errors;
    const errorTree = ux.tree();

    Object.keys(errors).forEach((identifier) => {
      errorTree.insert(identifier);
      errors[identifier].forEach((error) =>
        errorTree.nodes[identifier].insert(error)
      );
    });

    errorTree.display();
  } else {
    ux.action.stop('done');
  }
}

// Load script and resolve imports using esbuild.
async function prepareScript(
  command: BaseCommand,
  form: FormData,
  name: string,
  path: string,
  dumpCode: boolean,
  jsxFactory: string,
  jsxFragment: string
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
      (extern) => `(^${extern}$)|(-/${extern}@)`
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
          getModuleInfo: (path) => {
            const name = path.includes('-/') ? skyUrlToPath(path) : path;
            return {
              varName: pathToExternal(name ?? path),
              type: 'cjs',
            };
          },
        }) as any,
        httpPlugin,
      ],
      target: 'es2020',
      write: false,
      sourcemap: 'external',
      sourcesContent: false,
      loader: { '.js': 'jsx', '.ts': 'tsx' },
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
