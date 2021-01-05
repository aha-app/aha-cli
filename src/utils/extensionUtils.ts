import * as fs from "fs";
import ux from "cli-ux";
const rollup = require("rollup");
const urlResolve = require("rollup-plugin-url-resolve");
const FormData = require("form-data");
const { Readable } = require("stream");

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

  // Upload the sources for the contributions. Validate we don't have more
  // than one contribution with the same name.
  const contributionScripts = {};
  const configuration = readConfiguration();
  const form = new FormData();
  process.stdout.write(`Installing extension '${configuration.name}'\n`);
  const contributions = configuration.ahaExtension.contributes;
  for (let contributionType in contributions) {
    for (let contributionName in contributions[contributionType]) {
      if (contributionScripts[contributionName]) {
        throw new Error(
          `Two extensions share the same name of '${contributionName}'. Contribution names must be unique within the extension.`
        );
      }

      const contribution = contributions[contributionType][contributionName];
      process.stdout.write(
        `   contributes ${contributionType}: '${contributionName}'\n`
      );

      // Compile and upload script. We just generate a promise here and
      // then wait for them all in parallel below.

      // Compile the script.
      // TODO: We could parallelize this to speed things up.
      const { script, sourceMap } = await prepareScript(
        contributionName,
        contribution.entryPoint,
        dumpCode
      );

      form.append("extension[scripts][][name]", contributionName);
      form.append("extension[scripts[][script_text]", script, "script.txt");
      form.append(
        "extension[scripts[][source_map]",
        sourceMap,
        "source_map.txt"
      );
    }
  }

  // Add general extension parameters
  form.append(
    "extension[identifier]",
    identifierFromConfiguration(configuration)
  );
  form.append("extension[name]", configuration.description);
  form.append("extension[version]", configuration.version);
  form.append("extension[author]", configuration.author);
  form.append("extension[repository]", configuration.respository.url);
  form.append(
    "extension[configuration]",
    JSON.stringify(configuration.ahaExtension)
  );

  // Upload all of the scripts and configuration in one go. This requires the
  // use of form encoding, but it turns out to be much faster to just have one
  // server round-trip with more data, than multiple round trips. It also allows
  // us to treat extension updates atomically - which prevents mismatched code.
  ux.action.start("Uploading");
  await api.post(`/api/v1/extensions`, {
    body: new Readable({
      read() {
        this.push(form.getBuffer());
        this.push(null);
      },
    }),
    headers: {
      "content-type": "multipart/form-data; boundary=" + form.getBoundary(),
    },
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
