import BaseCommand from '../../base';
import ux from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import { packageInfo, packageRoot } from '../../utils/packageInfo';

type Contribution = {
  title: string;
  entryPoint: string | null;
  host: string | null;
  location: Object | null;
  recordTypes: string[] | null;
  handles: string[] | null;
  description: string | null;
  default: string | null;
  type: string | null;
  scope: string[] | null;
}

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

    let views: {[k: string]: Contribution} = {};
    let commands: {[k: string]: Contribution} = {};
    let endpoints: {[k: string]: Contribution} = {};
    let settings: {[k: string]: Contribution} = {};
    let importers: {[k: string]: Contribution} = {};
    let eventHandlers: {[k: string]: Contribution} = {};
    let paths: string[] = [];

    process.stdout.write(
      'Now create a contribution...\n'
    );

    do {
      process.stdout.write("\n");
      let contribFailed = false;
      do {
        contribFailed = false;
        const contributionTitle = await this.prompt_with_default('Enter a human readable title for your contribution (Sample Page)', 'Sample Page');
        const contributionName: string = await this.prompt_with_default(`Enter a name for your contribution (${this.camelize(contributionTitle)})`, this.camelize(contributionTitle));
        let contribution: Contribution = {
          title: contributionTitle,
          entryPoint: null,
          host: null,
          location: null,
          recordTypes: null,
          handles: null,
          description: null,
          default: null,
          type: null,
          scope: null
        };
        const contributionPrompt = await this.prompt_with_default('Which contribution type would you like to add: [v]iew, [c]ommand, [e]ndpoint, [s]etting, [i]mporter, event [h]andler? (view)', 'v');
        switch(contributionPrompt.toLowerCase().charAt(0)) {
          case 'v':
            let vPromptFailed = false;
            contribution.entryPoint = await this.prompt_with_default(`Enter an entry point for your contribution (/src/views/${contributionName}.js)`, `/src/views/${contributionName}.js`);
            paths.push(contribution.entryPoint);
            do {
              vPromptFailed = false;
              switch ((await this.prompt_with_default('Is this an [a]ttribute, [t]ab, or [p]age view? (page)', 'p')).toLowerCase().charAt(0)) {
                case 'a':
                  contribution.host = "attribute";
                  contribution.recordTypes = ["Feature", "Requirement", "Epic", "Release"];
                  break;
                case 't':
                  contribution.host = "tab";
                  contribution.recordTypes = ["Feature", "Requirement", "Epic", "Release"];
                  break;
                case 'p':
                  contribution.host = "page";
                  switch ((await this.prompt_with_default('Which location for your page: [p]lan, [w]ork, or [d]ocument? (work)', 'w')).toLowerCase().charAt(0)) {
                    case 'p':
                      contribution.location = { "menu": "Plan" };
                      break;
                    case 'w':
                      contribution.location = { "menu": "Work" };
                      break;
                    case 'd':
                      contribution.location = { "menu": "Document" };
                      break;
                    default:
                      process.stdout.write('Unable to understand input, please try again\n');
                      vPromptFailed = true;
                      break;
                  }
                  break;
                default:
                  process.stdout.write('Unable to understand input, please try again\n');
                  vPromptFailed = true;
                  break;
              }
            } while (vPromptFailed)
            views[contributionName] = contribution;
            break;
          case 'c':
            contribution.entryPoint = await this.prompt_with_default(`Enter an entry point for your contribution (/src/commands/${contributionName}.js)`, `/src/commands/${contributionName}.js`);
            paths.push(contribution.entryPoint);
            commands[contributionName] = contribution;
            break;
          case 'e':
            contribution.entryPoint = await this.prompt_with_default(`Enter an entry point for your contribution (/src/endpoints/${contributionName}.js)`, `/src/endpoints/${contributionName}.js`);
            paths.push(contribution.entryPoint);
            endpoints[contributionName] = contribution;
            break;
          case 's':
            contribution.description = await this.prompt_with_default('Enter a description for your setting (Choose a color)', 'Choose a color');
            let sPromptFailed = false;
            do {
              sPromptFailed = false;
              switch((await this.prompt_with_default('Enter the type of setting: [b]oolean, [c]olor, [s]tring, or [n]umber? (color)', 'c')).toLowerCase().charAt(0)) {
                case 'b':
                  contribution.type = "boolean";
                  contribution.default = await this.prompt_with_default('Enter a default value (true)', 'true');
                  break;
                case 'c':
                  contribution.type = "color";
                  contribution.default = await this.prompt_with_default('Enter a default value (#000000)', '#000000');
                  break;
                case 's':
                  contribution.type = "string";
                  contribution.default = await this.prompt_with_default('Enter a default value (Default String)', 'Default String');
                  break;
                case 'n':
                  contribution.type = "number";
                  contribution.default = await this.prompt_with_default('Enter a default value (42)', '42');
                  break;
                default:
                  process.stdout.write('Unable to understand input, please try again\n');
                  sPromptFailed = true;
                  break;
              }
            } while (sPromptFailed)
            let s1PromptFailed = false;
            do {
              s1PromptFailed = false;
              switch((await this.prompt_with_default('Enter the scope of setting: [a]ccount, [u]ser, or [b]oth? (both)', 'b')).toLowerCase().charAt(0)) {
                case 'a':
                  contribution.scope = ["account"];
                  break;
                case 'u':
                  contribution.scope = ["user"];
                  break;
                case 'b':
                  contribution.scope = ["account", "user"];
                  break;
                default:
                  process.stdout.write('Unable to understand input, please try again\n');
                  s1PromptFailed = true;
                  break;
              }
            } while (s1PromptFailed)
            // TODO: Get options ?
            settings[contributionName] = contribution;
            break;
          case 'i':
            contribution.entryPoint = await this.prompt_with_default(`Enter an entry point for your contribution (/src/importers/${contributionName}.js)`, `/src/importers/${contributionName}.js`);
            paths.push(contribution.entryPoint);
            importers[contributionName] = contribution;
            break;
          case 'h':
            contribution.entryPoint = await this.prompt_with_default(`Enter an entry point for your contribution (/src/handlers/${contributionName}.js)`, `/src/handlers/${contributionName}.js`);
            paths.push(contribution.entryPoint);
            let addingHandles = true;
            let handles: string[] = [];
            while (addingHandles) {
              const handle = await ux.prompt("Enter an event to handle, return to stop adding events",{required: false});
              if (handle != '') {
                handles.push(handle);
              } else {
                addingHandles = false;
              }
            }
            contribution.handles = handles;
            eventHandlers[contributionName] = contribution;
            break;
          default:
            process.stdout.write(`Unable to add contribution type: ${contributionPrompt}`);
            contribFailed = true;
            break;
        }
      } while (contribFailed)                                
    } while ((await this.prompt_with_default('Add another contribution [y]es or [n]o (no)', 'n')).toLowerCase().charAt(0) == 'y')

    let ahaExtensionSchema: { [k: string]: any } = {};
    ahaExtensionSchema.contributes = {};

    if(Object.keys(views).length > 0){
      ahaExtensionSchema.contributes.views = views;
    }
    if(Object.keys(commands).length > 0){
      ahaExtensionSchema.contributes.commands = commands;
    }
    if(Object.keys(endpoints).length > 0){
      ahaExtensionSchema.contributes.endpoints = endpoints;
    }
    if(Object.keys(settings).length > 0){
      ahaExtensionSchema.contributes.settings = settings;
    }
    if(Object.keys(importers).length > 0){
      ahaExtensionSchema.contributes.importers = importers;
    }
    if(Object.keys(eventHandlers).length > 0){
      ahaExtensionSchema.contributes.eventHandlers = eventHandlers;
    }

    const ahaExtensionsSchemaString = JSON.stringify(
      {"ahaExtentsion": ahaExtensionSchema},
      (key, value) => {
        if (value !== null) return value
      }, 2);

    // Create the extension and template files.
    ux.action.start('Creating');

    fs.mkdirSync(directoryName);
    fs.writeFileSync(
      `${directoryName}/package.json`,
      packageTemplate(identifier, name, author, ahaExtensionSchema)
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
    
    let directories: string[] = [];
    paths.forEach((fullPath) => {
      directories = fullPath.split('/').slice(1, fullPath.split('/').length-1);
      directories.forEach((dir, index) => {
        const fullPathToDir = directories.slice(0,index).join('/') + '/' + dir;
        if (!fs.existsSync(`${directoryName}/${fullPathToDir}`)) {
          fs.mkdirSync(`${directoryName}/${fullPathToDir}`);
        }
      });
    });

    for(const contributionName in views) {
      const contribution = views[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        viewTemplate(contributionName, contribution.title, contribution.host)
      );
    }
    for(const contributionName in commands) {
      const contribution = commands[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        commandTemplate(contributionName)
      );
    }
    for(const contributionName in endpoints) {
      const contribution = endpoints[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        endpointTemplate(contributionName)
      );
    }
    for(const contributionName in importers) {
      const contribution = importers[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        importerTemplate(identifier, contributionName)
      );
    }
    for(const contributionName in eventHandlers) {
      const contribution = eventHandlers[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        eventHandlerTemplate(contribution.handles || [])
      );
    }

    fs.writeFileSync(`${directoryName}/.gitignore`, gitignoreTemplate());

    ux.action.stop(`Extension created in directory '${directoryName}'`);
  }

  async prompt_with_default(text: string, defaultInput: string): Promise<string> {
    const inputValue = await ux.prompt(text, {required: false});
    return inputValue == '' ? defaultInput : inputValue;
  }
  
  camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; 
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
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

Install [\`aha-cli\`](https://github.com/aha-app/aha-cli):

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

When you have finished working on your extension, package it into a \`.gz\` file so that others can install it:

\`\`\`sh
aha extension:build
\`\`\`

After building, you can upload the \`.gz\` file to a publicly accessible URL, such as a GitHub release, so that others can install it using that URL.

To learn more about developing Aha! Develop extensions, including the API reference, the full documentation is located here: [Aha! Develop Extension API](https://www.aha.io/support/develop/extensions)
`;
}

function packageTemplate(identifier: string, name: string, author: string, ahaExtensionsSchema: { [k: string]: any }) {
  const version = packageInfo()['version'];
  const packageJson: { [k: string]: any } = {};
  packageJson.name = identifier;
  packageJson.description = name;
  packageJson.version = '0.0.0';
  packageJson.author = author;
  packageJson.repository = {
    "type": "git",
    "url": "TODO: Add the GitHub URL to your extension in package.json"
  }
  packageJson.license = "MIT"
  packageJson.devDependencies = {
    "aha-cli": version
  }
  packageJson.ahaExtension = ahaExtensionsSchema;
  return JSON.stringify(packageJson,
    (key, value) => {
      if (value !== null) return value
    }, 2);
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

function viewTemplate(name: string, title: string, host: string) {
  if (host == 'attribute'){
    return `import React from "react";

const Styles = () => {
  return (
    <style>
      {\`
    .text-class {
      color: var(--aha-black-800);
    }
    \`}
    </style>
  );
};

aha.on("${name}", ({ record, fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Styles />
      <div className='text-class'>${title}</div>
    </>
  );
});`;
  } else {
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

aha.on("${name}", ({ ${host != 'page' ? 'record, ' : ''}fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Styles />
      <div className='title'>${title}</div>
    </>
  );
});`;
  }
}

function commandTemplate(name: string) {
  return `aha.on("${name}", ({ record }, { identifier, settings }) => {
  if (record) {
    aha.commandOutput(
      \`Running sample command for record: \${record.typename} / \${record.referenceNum}.\`
    );
  } else {
    aha.commandOutput(\`Running sample command without a record.\`);
  }
});`;
}

function endpointTemplate(name: string) {
  return `aha.on("${name}", ({ headers, payload }, { identifier, settings }) => {
  //Endpoint code goes here
});`;
}

function importerTemplate(identifier: string, name: string) {
  return `const importer = aha.getImporter("${identifier}.${name}");

importer.on({ action: "listCandidates" }, async ({ filters, nextPage }, {identifier, settings}) => {
  return { records: [], nextPage: 2 };
});

//Optional
//importer.on({ action: "listFilters" }, ({}, {identifier, settings}) => {
//  return {
//    filterName: {
//      title: "Filter Name",
//      required: true,
//      type: "text",
//    },
//  };
//});

//Optional
//importer.on({ action: "filterValues" }, async ({ filterName, filters }, {identifier, settings}) => {
//  return [{ text: "Filter Text", value: "Filter Value" }];
//});

//Optional
//importer.on({ action: "renderRecord" }, ({ record, onUnmounted }, { identifier, settings }) => {
//  onUnmounted(() => {
//    console.log("Un-mounting component for", record.identifier);
//  });
//
//  return \`\${record.identifier} \${record.name}\`;
//});

//Optional
//importer.on({ action: "importRecord" }, async ({ importRecord, ahaRecord }, {identifier, settings}) => {
//  //Import record code goes here
//});
`;
}

function eventHandlerTemplate(events: string[]) {
  let returnTemplate = "";
  events.forEach((event) => {
    returnTemplate += `
aha.on({ event: '${event}' }, (arg, { identifier, settings }) => {
  //Event handler code for ${event}
});
`
  });
  return returnTemplate;
}

function gitignoreTemplate() {
  return `node_modules
.aha-cache
`;
}
