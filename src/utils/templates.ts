import { packageInfo } from './package-info';

export default {
  writeContributionTemplates(
    fs: any,
    directory: string,
    name: string,
    contributions: { [k: string]: any }
  ) {
    let directories: string[] = [];
    for (const contributionType in contributions) {
      if (contributionType !== 'settings') {
        for (const contributionName in contributions[contributionType]) {
          const contribution =
            contributions[contributionType][contributionName];
          directories = contribution.entryPoint
              .split('/')
              .slice(0, contribution.entryPoint.split('/').length - 1);
          directories.forEach((dir, index) => {
            const fullPathToDir =
              directories.slice(0, index).join('/') + '/' + dir;
            if (!fs.existsSync(`${directory}/${fullPathToDir}`)) {
              fs.mkdirSync(`${directory}/${fullPathToDir}`);
            }
          });
          fs.writeFileSync(
            `${directory}/${contribution.entryPoint}`,
            exports.default[`${contributionType}Template`](
              contributionName,
              contribution
            )
          );
        }
      }
    }
  },

  viewsTemplate(contributionName: string, contribution: { [k: string]: any }) {
    if (contribution.host === 'attribute') {
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

aha.on("${contributionName}", ({ record, fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Styles />
      <div className='text-class'>${contribution.title}</div>
    </>
  );
});`;
    }
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

aha.on("${contributionName}", ({ ${
      contribution.host === 'page' ? '' : 'record, '
    }fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Styles />
      <div className='title'>${contribution.title}</div>
    </>
  );
});`;
  },

  commandsTemplate(
    contributionName: string,
    _contribution: { [k: string]: any }
  ) {
    return `aha.on("${contributionName}", ({ record }, { identifier, settings }) => {
  if (record) {
    aha.commandOutput(
      \`Running sample command for record: \${record.typename} / \${record.referenceNum}.\`
    );
  } else {
    aha.commandOutput(\`Running sample command without a record.\`);
  }
});`;
  },

  endpointsTemplate(contributionName: string) {
    return `aha.on("${contributionName}", ({ headers, payload }, { identifier, settings }) => {
  //Endpoint code goes here
});`;
  },

  importersTemplate(
    contributionName: string,
    contribution: { [k: string]: any }
  ) {
    return `const importer = aha.getImporter("${contribution.name}.${contributionName}");

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
  },

  eventHandlersTemplate(
    contributionName: string,
    contribution: { [k: string]: any }
  ) {
    let returnTemplate = '';
    contribution.handles.forEach((event: string) => {
      returnTemplate += `
aha.on({ event: '${event}' }, (arg, { identifier, settings }) => {
  //Event handler code for ${event}
});
`;
    });
    return returnTemplate;
  },

  packageTemplate(
    identifier: string,
    name: string,
    author: string,
    ahaExtensionsSchema: { [k: string]: any }
  ) {
    const version = packageInfo().version;
    const packageJson: { [k: string]: any } = {
      name: identifier,
      description: name,
      version: '0.0.0',
      author: author,
      repository: {
        type: 'git',
        url: 'TODO: Add the GitHub URL to your extension in package.json',
      },
      license: 'MIT',
      devDependencies: {
        'aha-cli': version,
      },
      ahaExtension: ahaExtensionsSchema,
    };
    return JSON.stringify(
      packageJson,
      (key, value) => {
        if (value !== null) return value;
      },
      2
    );
  },

  readmeTemplate(name: string) {
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
  },

  tsconfigTemplate() {
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
  },

  vscodeTemplate() {
    return `{
  "json.schemas": [
    {
      "fileMatch": ["package.json"],
      "url": "./node_modules/aha-cli/schema/package-schema.json"
    }
  ]
}`;
  },

  gitignoreTemplate() {
    return `node_modules
.aha-cache
`;
  },
};
