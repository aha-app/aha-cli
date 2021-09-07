import ux from 'cli-ux';
import * as fs from 'fs';
import { Readable } from 'stream';
import { createGzip } from 'zlib';
import { handleHttpError } from '../api/http-error';
import BaseCommand from '../base';
import {
  fileNameFromConfiguration,
  filesFromConfiguration,
  identifierFromConfiguration,
  readConfiguration,
} from './extension/configuration';
import { prepareExtensionForm } from './extension/prepare-extension-form';
import { ExtensionPackageJson } from './extension/package-json';
import * as FormData from 'form-data';
import * as url from 'url';

export const REACT_JSX = 'React.createElement';

async function tryCatch<T>(
  callback: () => T | Promise<T>,
  catcher?: (error: unknown) => void
): Promise<T> {
  try {
    const result = await callback();
    return result;
  } catch (error) {
    if (catcher) {
      catcher(error);
    } else {
      ux.action.stop('error');
    }
    throw error;
  }
}

async function uploadFile(
  command: BaseCommand,
  configuration: ExtensionPackageJson,
  file: string
) {
  const form = new FormData();
  form.append('attachment[data]', fs.createReadStream(file));

  const params = url.parse(
    `${
      command.api.config.baseURL
    }/api/v1/extensions/${identifierFromConfiguration(
      configuration
    )}/attachments`
  );

  const data = (await new Promise((resolve, reject) => {
    form.submit(
      {
        host: params.hostname,
        path: params.pathname,
        protocol: params.protocol as any,
        port: params.port,
        method: 'post',
        headers: { ...command.api.defaults.headers },
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(res.statusMessage));
        }

        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => resolve(JSON.parse(body)));
      }
    );
  })) as any;

  return data.attachment.download_url;
}

// Compile and upload an extension.
export async function installExtension(
  command: BaseCommand,
  dumpCode: boolean,
  skipCache = false
) {
  const configuration = await tryCatch(() => {
    const configuration = readConfiguration();
    process.stdout.write(
      `Installing extension '${configuration.name}' to '${command.api.config.baseURL}'\n`
    );
    return configuration;
  });

  const files = await filesFromConfiguration(configuration);
  const fileMap: Record<string, string> = {};

  ux.action.start('Uploading extension');
  for (const file of files) {
    fileMap[file] = await tryCatch(() =>
      uploadFile(command, configuration, file)
    );
  }

  const form = await tryCatch(() =>
    prepareExtensionForm(configuration, command, fileMap, dumpCode, skipCache)
  );

  // Upload all of the scripts and configuration in one go. This requires the
  // use of form encoding, but it turns out to be much faster to just have one
  // server round-trip with more data, than multiple round trips. It also allows
  // us to treat extension updates atomically - which prevents mismatched code.
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
    handleHttpError(error);
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
  const fileMap = {};
  const form = await prepareExtensionForm(
    configuration,
    command,
    fileMap,
    false,
    skipCache
  );

  ux.action.start('Saving');
  const gzip = createGzip();
  const output = fs.createWriteStream(fileName);
  gzip.pipe(output);
  gzip.write(form.getBuffer());
  gzip.end();

  ux.action.stop('done');
}
