import ux from 'cli-ux';
import * as FormData from 'form-data';
import BaseCommand from '../../base';
import { REACT_JSX } from '../extension-utils';
import { SimpleCache } from '../simple-cache';
import {
  identifierFromConfiguration,
  readConfiguration,
  contributionsFromConfiguration,
} from './configuration';
import { prepareScript } from './prepare-script';

export async function prepareExtensionForm(
  command: BaseCommand,
  dumpCode: boolean,
  skipCache: boolean
) {
  // Upload the sources for the contributions. Validate we don't have more
  // than one contribution with the same name.
  const form = new FormData();
  const configuration = readConfiguration();

  if (!configuration.ahaExtension) {
    throw new Error('No ahaExtension configuration found in package.json');
  }
  const { ahaExtension } = configuration;

  if (
    !ahaExtension.contributes ||
    Object.keys(ahaExtension.contributes).length === 0
  ) {
    throw new Error('No contributions found in package.json');
  }
  const contributions = contributionsFromConfiguration(
    ahaExtension.contributes
  );

  const jsxFactory = ahaExtension.jsxFactory || REACT_JSX;
  const jsxFragment = jsxFactory === REACT_JSX ? 'React.Fragment' : 'Fragment';
  const scriptPaths: string[] = [];
  const cache = skipCache ? undefined : await SimpleCache.create('.aha-cache');

  const compilers = contributions
    .map(contribution => {
      process.stdout.write(
        `   contributes ${contribution.type}: '${contribution.name}'\n`
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
        contribution.name,
        contribution.entryPoint,
        dumpCode,
        jsxFactory,
        jsxFragment,
        cache
      );
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
