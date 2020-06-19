
import * as fs from 'fs';

export function readConfiguration() {
  const json = JSON.parse(
    fs.readFileSync("package.json", { encoding: "UTF-8" })
  );
  return json;
}

export function identifierFromConfiguration(configuration)  {
  return configuration.name.replace('@', '').replace('/', '.')
}