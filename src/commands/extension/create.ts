import BaseCommand from '../../base';
import ux from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import { packageInfo, packageRoot } from '../../utils/package-info';
import * as inquirer from 'inquirer';

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

function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; 
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

const extensionQuestions = [
  {
    type: 'input',
    name: 'name',
    message: 'Enter a human readable name for your extension',
    default: 'Sample Extension'
  },
  {
    type: 'input',
    name: 'author',
    message: 'Who are you? Your personal or organization github handle is a good identifier'
  },
  {
    type: 'input',
    name: 'identifier',
    message: 'Each extension must have a universally unique identifer that is also a valid NPM package name.\nGenerally a good identifier is <organization-name>.<extension-name>.\nEnter an identifier',
    validate: (input: string, answers: { [k: string]: string }) => {
      if (!(input.match(/^[^.]+\.([^.]+)$/))) {
        return 'The identifier should contain exactly one period';
      }
      if (!input.match(/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/)) {
        return 'The identifier should be a valid NPM package name';
      }
      return true;
    }
  }
]

const contributionQuestions = [
  {
    type: 'input',
    name: 'title',
    message: 'Enter a human readable title for your contribution',
    default: 'Sample Page'
  },
  {
    type: 'input',
    name: 'name',
    message: 'Enter a name for your contribution',
    default: (answers: { [k: string]: string }) => {
      return camelize(answers.title);
    }
  },
  {
    type: 'list',
    name: 'contributionType',
    message: 'Select a type for your contribution',
    choices: [
      { name: 'view', value: 'views' },
      { name: 'command', value: 'commands' },
      { name: 'endpoint', value: 'endpoints' },
      { name: 'event handler', value: 'eventHandlers' },
      { name: 'importer', value: 'importers' },
      { name: 'setting', value: 'settings' }
    ],
    default: 'view'
  },
  {
    type: 'input',
    name: 'entryPoint',
    message: 'Enter an entry point for your contribution',
    default: (answers: { [k: string]: string }) => {
      return `/src/${answers["contributionType"]}/${answers["name"]}.js`;
    },
    when: (answers: { [k: string]: string }) => {
      return answers.contributionType != 'settings';
    }
  },
  {
    type: 'list',
    name: 'host',
    message: 'Enter the host for your view',
    choices: [
      { name: 'attribute', value: 'attribute' },
      { name: 'tab', value: 'tab' },
      { name: 'page', value: 'page' }
    ],
    default: 'page',
    when: (answers: { [k: string]: string }) => {
      return answers.contributionType == 'views';
    }
  },
  {
    type: 'checkbox',
    name: 'recordTypes',
    message: 'Select the record types for your contribution',
    choices: [
      { name: 'Feature', value: 'Feature' },
      { name: 'Requirement', value: 'Requirement' },
      { name: 'Epic', value: 'Epic' },
      { name: 'Release', value: 'Release' }
    ],
    default: ['Feature', 'Requirement', 'Release'],
    when: (answers: { [k: string]: string }) => {
      return answers.host != 'page' && answers.contributionType == 'views';
    }
  },
  {
    type: 'list',
    name: 'location',
    message: 'Enter a location for your page',
    choices: [
      { name: 'Work', value: { "menu": "Work" } },
      { name: 'Plan', value: { "menu": "Plan" } },
      { name: 'Document', value: { "menu": "Document" } }
    ],
    default: { "menu": "Work" },
    when: (answers: { [k: string]: string }) => {
      return answers.host == 'page'
    }
  },
  {
    type: 'list',
    name: 'type',
    message: 'Enter the type for your setting',
    choices: [
      "boolean", "color", "string", "number"
    ],
    default: 'color',
    when: (answers: { [k: string]: string }) => {
      return answers.contributionType == 'settings'
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Enter a description for your setting',
    default: 'Choose a color',
    when: (answers: { [k: string]: string }) => {
      return answers.contributionType == 'settings'
    }
  },
  {
    type: 'input',
    name: 'default',
    message: 'Enter the default value for your setting',
    default: (answers: { [k: string]: string }) => {
      switch(answers.type){
        case 'boolean':
          return 'true';
        case 'color':
          return '#000000';
        case 'Default String':
          return '';
        case 'number':
          return '42';
      }
    },
    when: (answers: { [k: string]: string }) => {
      return answers.contributionType == 'settings'
    }
  },
  {
    type: 'checkbox',
    name: 'scope',
    message: 'Select the scops for your setting',
    choices: [
      { name: 'Account', value: 'account' },
      { name: 'User', value: 'user' }
    ],
    default: ['account', 'user'],
    when: (answers: { [k: string]: string }) => {
      return answers.contributionType == 'settings';
    }
  },
  {
    type: 'input',
    name: 'handles',
    message: 'Enter the events your contribution handles, separated by commas',
    default: 'aha.audit,aha.workflow-board.shipped',
    filter: (input: string, answers: { [k: string]: string }) => {
      const cleanInput = input.replace(/\s+/g, '');
      return cleanInput.split(',');
    },
    when: (answers: { [k: string]: string }) => {
      return answers.contributionType == 'eventHandlers';
    }
  }
];
export default class Create extends BaseCommand {
  static description = 'Create an example extension';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const extensionAnswers = (await inquirer.prompt(extensionQuestions));
    const directoryName = extensionAnswers.identifier.match(/^[^.]+\.([^.]+)$/)[1];

    // Check if the extension already exists.
    if (fs.existsSync(directoryName)) {
      throw new Error(`A directory named '${directoryName}' already exists.`);
    }

    let ahaExtensionSchema: { [k: string]: any } = {};
    ahaExtensionSchema.contributes = {};

    const createContributions = (await inquirer.prompt([
      {
        type: 'list',
        name: 'createContributions',
        message: 'Are you ready to add contributions?',
        default: true,
        choices: [
          {
            name: "yes",
            value: true
          },
          {
            name: "skip for now",
            value: false
          }
        ]
      }
    ])).createContributions

    if (createContributions) {
      do {
        process.stdout.write("\n");
        
        var answers = await inquirer.prompt(contributionQuestions);
        
        let contribution: Contribution = {
          title: answers.title,
          entryPoint: answers.entryPoint,
          host: answers.host,
          location: answers.location,
          recordTypes: answers.recordTypes,
          handles: answers.handles,
          description: answers.description,
          default: answers.default,
          type: answers.type,
          scope: answers.scope
        };
               
        ahaExtensionSchema.contributes[answers.contributionType] = ahaExtensionSchema.contributes[answers.contributionType] || {};
        ahaExtensionSchema.contributes[answers.contributionType][answers.name] = contribution;               
      } while ((await inquirer.prompt({
        type: 'list',
        name: 'add',
        message: 'Add another contribution?',
        default: 'no',
        choices: [ 'yes', 'no' ]
      })).add == 'yes')
    } else {
      ahaExtensionSchema.contributes = {
        views: {
          samplePage: {
            title: 'Sample Page',
            entryPoint: '/src/views/samplePage.js',
            host: 'page',
            location: {
              home: 'Work'
            }
          }
        },
        commands: {
          sampleCommand: {
            title: 'Sample Command',
            entryPoint: '/src/commands/sampleCommand.js'
          }
        }
      };
    }

    // Create the extension and template files.
    ux.action.start('Creating');

    fs.mkdirSync(directoryName);
    fs.writeFileSync(
      `${directoryName}/package.json`,
      packageTemplate(extensionAnswers.identifier, extensionAnswers.name, extensionAnswers.author, ahaExtensionSchema)
    );

    fs.writeFileSync(`${directoryName}/README.md`, readmeTemplate(extensionAnswers.name));

    const modulePath = path.join(directoryName, 'node_modules', 'aha-cli');
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

    const paths = JSON.stringify(ahaExtensionSchema).match(/("?)entryPoint\1.*?"(.*?)"/g);
    if(paths){
      paths.forEach((fullPath) => {
        directories = fullPath.split('/').slice(1, fullPath.split('/').length-1);
        directories.forEach((dir, index) => {
          const fullPathToDir = directories.slice(0,index).join('/') + '/' + dir;
          if (!fs.existsSync(`${directoryName}/${fullPathToDir}`)) {
            fs.mkdirSync(`${directoryName}/${fullPathToDir}`);
          }
        });
      });
    }

    for(const contributionName in ahaExtensionSchema.contributes.views) {
      const contribution = ahaExtensionSchema.contributes.views[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        viewTemplate(contributionName, contribution.title, contribution.host)
      );
    }
    for(const contributionName in ahaExtensionSchema.contributes.commands) {
      const contribution = ahaExtensionSchema.contributes.commands[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        commandTemplate(contributionName)
      );
    }
    for(const contributionName in ahaExtensionSchema.contributes.endpoints) {
      const contribution = ahaExtensionSchema.contributes.endpoints[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        endpointTemplate(contributionName)
      );
    }
    for(const contributionName in ahaExtensionSchema.contributes.importers) {
      const contribution = ahaExtensionSchema.contributes.importers[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        importerTemplate(extensionAnswers.identifier, contributionName)
      );
    }
    for(const contributionName in ahaExtensionSchema.contributes.eventHandlers) {
      const contribution = ahaExtensionSchema.contributes.eventHandlers[contributionName];
      fs.writeFileSync(
        `${directoryName}${contribution.entryPoint}`,
        eventHandlerTemplate(contribution.handles || [])
      );
    }

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
    "allowSyntheticDefaultImports": true,
    "module": "ES6",
    "moduleResolution": "node",
    "target": "ES6"
  },
  "include": ["node_modules/aha-cli/aha.d.ts", "src/**/*.ts*"]
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
