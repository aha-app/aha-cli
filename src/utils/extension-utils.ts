import ux from 'cli-ux';
import * as fs from 'fs';
import { Readable } from 'stream';
import { createGzip } from 'zlib';
import BaseCommand from '../base';
import {
  readConfiguration,
  fileNameFromConfiguration,
} from './extension/configuration';
import { prepareExtensionForm } from './extension/prepare-extension-form';
import { HTTPError } from 'http-call';

export const REACT_JSX = 'React.createElement';
export const EXTERNALS = ['react', 'react-dom'];

/**
 * Converts a skypack url like /-/react@17.0.1?blah to just react
 */
export function skyUrlToPath(path: string) {
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
export function pathToExternal(path: string): string {
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

    const http = (error as HTTPError).http;

    if (http && http.body && http.body.errors) {
      const errorTree = ux.tree();
      const errors: { [index: string]: string[] } = http.body.errors;
      Object.keys(errors).forEach(identifier => {
        errorTree.insert(identifier);
        errors[identifier].forEach(error =>
          errorTree.nodes[identifier].insert(error)
        );
      });

      errorTree.display();
    } else if (http && http.body) {
      throw new Error(http.body.error);
    } else {
      throw error;
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
