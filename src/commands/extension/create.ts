import BaseCommand from '../../base';
import ux from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import { packageInfo, packageRoot } from '../../utils/packageInfo';

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

    fs.writeFileSync(`${directoryName}/README.md`, readmeTemplate(name));

    const modulePath = path.join(
      directoryName,
      'node_modules',
      '@aha-app',
      'aha-cli'
    );
    fs.mkdirSync(path.join(modulePath, 'schema'), { recursive: true });
    fs.copyFileSync(
      path.join(packageRoot(), 'aha.d.ts'),
      path.join(modulePath, 'aha.d.ts')
    );
    fs.copyFileSync(
      path.join(packageRoot(), 'schema', 'schema.json'),
      path.join(modulePath, 'schema', 'schema.json')
    );
    fs.copyFileSync(
      path.join(packageRoot(), 'schema', 'package-schema.json'),
      path.join(modulePath, 'schema', 'package-schema.json')
    );
    fs.writeFileSync(`${directoryName}/tsconfig.json`, tsconfigTemplate());
    fs.mkdirSync(`${directoryName}/.vscode`);
    fs.writeFileSync(
      `${directoryName}/.vscode/settings.json`,
      vscodeTemplate()
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
    fs.writeFileSync(`${directoryName}/.gitignore`, gitignoreTemplate());

    ux.action.stop(`Extension created in directory '${directoryName}'`);
  }
}

function readmeTemplate(name: string) {
  return `# ${name}

TODO: Supply a short overview of the functionality the extension brings to Aha! Develop
This [Aha! Develop](https://www.aha.io/develop/overview) extension enables...

It provides these contributions:

TODO: Add a contribution list here. These should briefly describe each of the features provided by this extension.

## Demo

TODO: Add a short .gif screen recording showing some of the highlights of your extension. This can be recorded using a tool like [LICECap](https://www.cockos.com/licecap/).

![demo](demo.gif)

## Installing the extension

**Note: In order to install an extension into your Aha! Develop account, you must be an account administrator.**

TODO: Fill in a link to your built extension package
Install the ${name} extension by clicking [here](https://secure.aha.io/settings/account/extensions/install?url=).

## Working on the extension

Install \`aha-cli\`:

\`\`\`sh
npm install -g aha-cli
\`\`\`

Clone the repo:

TODO: Add the repository URL here
\`\`\`sh
git clone ...
\`\`\`

**Note: In order to install an extension into your Aha! Develop account, you must be an account administrator.**

Install the extension into Aha! and set up a watcher:

\`\`\`sh
aha extension:install
aha extension:watch
\`\`\`

Now, any change you make inside your working copy will automatically take effect in your Aha! account.

## Building

When you have finished working on your extension, build it so that others can install it through its \`.gz\` file:

\`\`\`sh
aha extension:build
\`\`\`

After building, you can upload the \`.gz\` file to a publicly accessible URL, such as GitHub releases, so that others can install it using its URL.

To learn more about developing Aha! Develop extensions, including the API reference, the full documentation is located here: [Aha! Develop Extension API](https://www.aha.io/support/develop/extensions)
`;
}

function packageTemplate(identifier: string, name: string, author: string) {
  const version = packageInfo()['version'];

  return `{
  "name": "${identifier}",
  "description": "${name}",
  "version": "0.0.0",
  "author": "${author}",
  "repository": {
    "type": "git",
    "url": "TODO: Add the GitHub URL to your extension in package.json"
  },
  "license": "MIT",
  "devDependencies": {
    "aha-cli": "^${version}"
  },
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

function tsconfigTemplate() {
  return `{
  "compilerOptions": {
    "checkJs": true,
    "noEmit": true,
    "lib": ["DOM", "ES6", "ES2019"],
    "jsx": "preserve",
    "typeRoots": ["node_modules/@types", "node_modules/@aha-app"],
    "allowSyntheticDefaultImports": true,
    "module": "ES6",
    "moduleResolution": "node",
    "target": "ES6"
  }
}`;
}

function vscodeTemplate() {
  return `{
  "json.schemas": [
    {
      "fileMatch": ["package.json"],
      "url": "./node_modules/aha-cli/schema/package-schema.json"
    }
  ]
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

function gitignoreTemplate() {
  return `node_modules
.aha-cache
`;
}
