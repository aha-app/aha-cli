import BaseCommand from '../../base';
import ux from 'cli-ux';
import * as fs from 'fs';

export default class Create extends BaseCommand {
  static description = 'Create an example extension';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    // Prompt the user for the key information we need.
    const name = await ux.prompt('Give your extension a human readable name');
    const author = await ux.prompt(
      'Who are you? Your personal or organization github handle is a good identifier'
    );
    process.stdout.write(
      'Each extension must have a universally unique identifer that is also a valid NPM package name.\n'
    );
    process.stdout.write(
      'Generally a good identifier is <organization-name>.<extension-name>.\n'
    );
    let identifier;
    let matches = null;
    do {
      const possibleIdentifier = await ux.prompt('Extension identifier');
      if (!(matches = possibleIdentifier.match(/^[^.]+\.([^.]+)$/))) {
        process.stdout.write(
          'The identifier should contain exactly one period.\n'
        );
        continue;
      }
      if (
        !possibleIdentifier.match(
          /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
        )
      ) {
        process.stdout.write(
          'The identifier should be a valid NPM package name.\n'
        );
        continue;
      }
      identifier = possibleIdentifier;
    } while (!identifier);

    const directoryName = matches[1];

    // Check if the extension already exists.
    if (fs.existsSync(directoryName)) {
      throw new Error(`A directory named '${directoryName}' already exists.`);
    }

    // Create the extension and template files.
    ux.action.start('Creating');
    fs.mkdirSync(directoryName);
    fs.writeFileSync(
      `${directoryName}/package.json`,
      packageTemplate(identifier, name, author)
    );
    fs.mkdirSync(`${directoryName}/src`);
    fs.mkdirSync(`${directoryName}/src/views`);
    fs.mkdirSync(`${directoryName}/src/commands`);
    fs.writeFileSync(
      `${directoryName}/src/views/samplePage.js`,
      pageTemplate()
    );
    fs.writeFileSync(
      `${directoryName}/src/commands/sampleCommand.js`,
      commandTemplate()
    );

    ux.action.stop(`Extension created in directory '${directoryName}'`);
  }
}

function packageTemplate(identifier: string, name: string, author: string) {
  return `{
  "name": "${identifier}",
  "description": "${name}",
  "version": "0.0.0",
  "author": "${author}",
  "repository": {
    "type": "git",
    "url": "Add github URL here"
  },
  "license": "MIT",
  "ahaExtension": {
    "cspSources": [],
    "contributes": {
      "views": {
        "samplePage": {
          "title": "Sample page",
          "host": "page",
          "entryPoint": "src/views/samplePage.js",
          "location": {
            "menu": "Work"
          }
        }
      },
      "commands": {
        "sampleCommand": {
          "title": "Sample command",
          "entryPoint": "src/commands/sampleCommand.js"
        }
      }
    }
  }
}`;
}

function commandTemplate() {
  return `aha.on("sampleCommand", ({ record }, { settings }) => {
  if (record) {
    aha.commandOutput(
      \`Running sample command for record: \${record.typename} / \${record.referenceNum}.\`
    );
  } else {
    aha.commandOutput(\`Running sample command without a record.\`);
  }
});`;
}

function pageTemplate() {
  return `import React from "react";

const Styles = () => {
  return (
    <style>
      {\`
    .title {
      color: var(--aha-green-800);
      font-size: 20px;
      text-align: center;
      margin: 20px;
    }
    \`}
    </style>
  );
};

aha.on("samplePage", ({ record, fields }, { settings }) => {
  return (
    <>
      <Styles />
      <div className='title'>Sample page</div>
    </>
  );
});`;
}
