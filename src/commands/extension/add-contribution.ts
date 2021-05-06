import BaseCommand from '../../base';
import ux from 'cli-ux';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import templates from '../../utils/contribution-templates';

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
  static description = 'Add a contribution to an extension';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    //TODO: validate that the packageJson is a valid ahaExtension

    var newContributions: { [k: string]: any } = {};

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
      newContributions[answers.contributionType] = newContributions[answers.contributionType] || {};
      newContributions[answers.contributionType][answers.name] = contribution;      
      packageJson.ahaExtension.contributes[answers.contributionType] = packageJson.ahaExtension.contributes[answers.contributionType] || {};
      packageJson.ahaExtension.contributes[answers.contributionType][answers.name] = contribution;               
    } while ((await inquirer.prompt({
      type: 'list',
      name: 'add',
      message: 'Add another contribution?',
      default: 'no',
      choices: [ 'yes', 'no' ]
    })).add == 'yes')
    
    // Update the package.json file
    ux.action.start('Writing package.json file');
    fs.writeFileSync(
      `./package.json`,
      JSON.stringify(packageJson,
        (key, value) => {
          if (value !== null) return value
        }, 2)
    );
    ux.action.stop('Finished writing package.json file');

    // Create the contributions
    ux.action.start('Creating contributions');

    let directories: string[] = [];
    const paths = JSON.stringify(newContributions).match(/("?)entryPoint\1.*?"(.*?)"/g);
    if(paths){
      paths.forEach((fullPath) => {
        directories = fullPath.split('/').slice(1, fullPath.split('/').length-1);
        directories.forEach((dir, index) => {
          const fullPathToDir = directories.slice(0,index).join('/') + '/' + dir;
          if (!fs.existsSync(`./${fullPathToDir}`)) {
            fs.mkdirSync(`./${fullPathToDir}`);
          }
        });
      });
    }

    for(const contributionName in newContributions.views) {
      const contribution = newContributions.views[contributionName];
      fs.writeFileSync(
        `.${contribution.entryPoint}`,
        templates.viewTemplate(contributionName, contribution.title, contribution.host)
      );
    }
    for(const contributionName in newContributions.commands) {
      const contribution = newContributions.commands[contributionName];
      fs.writeFileSync(
        `.${contribution.entryPoint}`,
        templates.commandTemplate(contributionName)
      );
    }
    for(const contributionName in newContributions.endpoints) {
      const contribution = newContributions.endpoints[contributionName];
      fs.writeFileSync(
        `.${contribution.entryPoint}`,
        templates.endpointTemplate(contributionName)
      );
    }
    for(const contributionName in newContributions.importers) {
      const contribution = newContributions.importers[contributionName];
      fs.writeFileSync(
        `.${contribution.entryPoint}`,
        templates.importerTemplate(packageJson.name, contributionName)
      );
    }
    for(const contributionName in newContributions.eventHandlers) {
      const contribution = newContributions.eventHandlers[contributionName];
      fs.writeFileSync(
        `.${contribution.entryPoint}`,
        templates.eventHandlerTemplate(contribution.handles || [])
      );
    }
    ux.action.stop('Contributions created');
  }
}
