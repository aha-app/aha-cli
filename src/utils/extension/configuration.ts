import * as fs from 'fs';
import * as globby from 'globby';
import { Contributes, ExtensionPackageJson } from './package-json';

export function readConfiguration(): ExtensionPackageJson {
  try {
    return JSON.parse(fs.readFileSync('package.json', { encoding: 'UTF-8' }));
  } catch (error) {
    throw new Error(`Error loading package.json: ${(error as Error).message}`);
  }
}

export function identifierFromConfiguration(
  configuration: ExtensionPackageJson
) {
  return configuration.name.replace('@', '').replace('/', '.');
}

export function fileNameFromConfiguration(configuration: ExtensionPackageJson) {
  return `${identifierFromConfiguration(configuration)}-v${
    configuration.version
  }`;
}

export function contributionsFromConfiguration(contributes: Contributes) {
  const names = new Set<string>();

  return Object.keys(contributes).flatMap(type =>
    Object.keys(contributes[type]).map(name => {
      if (names.has(name)) {
        throw new Error(
          `Two extensions share the same name of '${name}'. Contribution names must be unique within the extension.`
        );
      }

      names.add(name);
      const { entryPoint } = contributes[type][name];

      return {
        name,
        type,
        entryPoint,
      };
    })
  );
}

export async function filesFromConfiguration(
  configuration: ExtensionPackageJson
) {
  return globby(configuration?.ahaExtension?.files || []);
}
