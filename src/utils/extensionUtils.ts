import * as fs from "fs";
import ux from "cli-ux";
const rollup = require("rollup");
const urlResolve = require("rollup-plugin-url-resolve");

export function readConfiguration() {
  const json = JSON.parse(
    fs.readFileSync("package.json", { encoding: "UTF-8" })
  );
  return json;
}

export function identifierFromConfiguration(configuration) {
  return configuration.name.replace("@", "").replace("/", ".");
}

export async function installExtension(api, dumpCode) {
  // TODO: Perhaps the installation should upload the "contributes" section
  // from the package.json file as-is. The server can then track exactly
  // what the extension needs. If the extension creates a custom field then
  // perhaps we could link the field back to the extension, so you could see
  // where it came from, and optionally remove the field if the extension
  // is removed.

  // Read the script sources.
  const source = [];
  const configuration = readConfiguration();
  process.stdout.write(`Installing extension '${configuration.name}'\n`);
  const contributions = configuration.ahaExtension.contributes;
  for (let contributionType in contributions) {
    for (let contributionName in contributions[contributionType]) {
      const contribution = contributions[contributionType][contributionName];
      process.stdout.write(
        `   contributes ${contributionType}: '${contributionName}'\n`
      );
      const { script, sourceMap } = await prepareScript(
        contributionName,
        contribution.entryPoint,
        dumpCode
      );
      source.push({
        entryPoint: contribution.entryPoint,
        script: script,
        sourceMap: sourceMap,
      });
    }
  }

  // Upload to the server.
  ux.action.start("Uploading");
  await api.post(`/api/v1/extensions`, {
    body: {
      extension: {
        identifier: identifierFromConfiguration(configuration),
        name: configuration.description,
        version: configuration.version,
        author: configuration.author,
        repository: configuration.respository.url,
        configuration: configuration.ahaExtension,
        source,
      },
    },
    "content-type": "application/json",
  });
  ux.action.stop("done");
}

// Load script and resolve imports using rollup.
async function prepareScript(name, path, dumpCode) {
  // Check the script exists.
  if (!fs.existsSync(path)) {
    throw new Error(`Script for '${name}' does not exist at '${path}'`);
  }

  const bundle = await rollup.rollup({
    input: path,
    plugins: [urlResolve()],
  });
  const { output } = await bundle.generate({
    format: "esm",
    name: name,
    sourcemap: "inline",
    sourcemapExcludeSources: true,
  });

  let code = "";
  let map = null;
  for (const chunkOrAsset of output) {
    if (chunkOrAsset.type === "chunk") {
      code = code.concat(chunkOrAsset.code);
      map = chunkOrAsset.map.toString();
    }
    if (dumpCode) {
      process.stdout.write(`\n======= Start code for '${name}':\n`);
      process.stdout.write(chunkOrAsset.code);
      process.stdout.write(`\n======= End code for '${name}'\n`);
    }
  }

  await bundle.close();

  return { script: code, sourceMap: map };
}
