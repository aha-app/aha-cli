import * as inquirer from 'inquirer';

export default {
  async getContributionFromQuestions() {
    const answers = await inquirer.prompt(
      exports.default.contributionQuestions
    );
    return {
      type: answers.contributionType,
      name: answers.name,
      contribution: {
        title: answers.title,
        entryPoint: answers.entryPoint,
        host: answers.host,
        location: answers.location,
        recordTypes: answers.recordTypes,
        handles: answers.handles,
        description: answers.description,
        default: answers.default,
        type: answers.type,
        scope: answers.scope,
      },
    };
  },

  extensionQuestions: [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a human readable name for your extension:',
      default: 'Sample Extension',
    },
    {
      type: 'input',
      name: 'author',
      message:
        'Who are you? Your personal or organization GitHub handle is a good identifier:',
    },
    {
      type: 'input',
      name: 'identifier',
      message:
        'Each extension must have a universally unique identifer that is also a valid NPM package name.\nGenerally a good identifier is <organization-name>.<extension-name>.\nEnter an identifier:',
      validate: (input: string, answers: { [k: string]: string }) => {
        if (!input.match(/^[^.]+\.([^.]+)$/)) {
          return 'The identifier should contain exactly one period';
        }
        if (
          !input.match(/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/)
        ) {
          return 'The identifier should be a valid NPM package name';
        }
        return true;
      },
    },
  ],

  addContributionsQuestion: {
    type: 'list',
    name: 'createContributions',
    message: 'Are you ready to add contributions?',
    default: true,
    choices: [
      {
        name: 'yes',
        value: true,
      },
      {
        name: 'skip for now',
        value: false,
      },
    ],
  },

  addAnotherContributionQuestion: {
    type: 'list',
    name: 'add',
    message: 'Add another contribution?',
    default: 'no',
    choices: ['yes', 'no'],
  },

  contributionQuestions: [
    {
      type: 'input',
      name: 'title',
      message: 'Enter a human readable title for your contribution:',
      default: 'Sample Page',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for your contribution:',
      default: (answers: { [k: string]: string }) => {
        return answers.title.replace(
          /^([A-Z])|[\s-_]+(\w)/g,
          function (match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();
          }
        );
      },
    },
    {
      type: 'list',
      name: 'contributionType',
      message: 'Select a type for your contribution:',
      choices: [
        { name: 'view', value: 'views' },
        { name: 'command', value: 'commands' },
        { name: 'endpoint', value: 'endpoints' },
        { name: 'event handler', value: 'eventHandlers' },
        { name: 'importer', value: 'importers' },
        { name: 'setting', value: 'settings' },
      ],
      default: 'view',
    },
    {
      type: 'input',
      name: 'entryPoint',
      message: 'Enter an entry point for your contribution:',
      default: (answers: { [k: string]: string }) => {
        return `src/${answers.contributionType}/${answers.name}.js`;
      },
      when: (answers: { [k: string]: string }) => {
        return answers.contributionType != 'settings';
      },
    },
    {
      type: 'list',
      name: 'host',
      message: 'Enter the host for your view:',
      choices: [
        { name: 'attribute', value: 'attribute' },
        { name: 'tab', value: 'tab' },
        { name: 'page', value: 'page' },
      ],
      default: 'page',
      when: (answers: { [k: string]: string }) => {
        return answers.contributionType == 'views';
      },
    },
    {
      type: 'checkbox',
      name: 'recordTypes',
      message: 'Select the record types for your contribution:',
      choices: [
        { name: 'Feature', value: 'Feature' },
        { name: 'Requirement', value: 'Requirement' },
        { name: 'Epic', value: 'Epic' },
        { name: 'Release', value: 'Release' },
      ],
      default: ['Feature', 'Requirement', 'Release'],
      when: (answers: { [k: string]: string }) => {
        return answers.host != 'page' && answers.contributionType == 'views';
      },
    },
    {
      type: 'list',
      name: 'location',
      message: 'Enter a navigation menu location for your page:',
      choices: [
        { name: 'Work', value: { menu: 'Work' } },
        { name: 'Plan', value: { menu: 'Plan' } },
        { name: 'Document', value: { menu: 'Document' } },
      ],
      default: { menu: 'Work' },
      when: (answers: { [k: string]: string }) => {
        return answers.host == 'page';
      },
    },
    {
      type: 'list',
      name: 'type',
      message: 'Enter the type for your setting:',
      choices: ['boolean', 'color', 'string', 'number'],
      default: 'color',
      when: (answers: { [k: string]: string }) => {
        return answers.contributionType == 'settings';
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter a description for your setting:',
      default: (answers: { [k: string]: string }) => {
        switch (answers.type) {
          case 'boolean':
            return 'Enable Option';
          case 'color':
            return 'Choose a color';
          case 'string':
            return 'Description';
          case 'number':
            return 'Choose a number';
        }
      },
      when: (answers: { [k: string]: string }) => {
        return answers.contributionType == 'settings';
      },
    },
    {
      type: 'input',
      name: 'default',
      message: 'Enter the default value for your setting:',
      default: (answers: { [k: string]: string }) => {
        switch (answers.type) {
          case 'boolean':
            return 'true';
          case 'color':
            return '#000000';
          case 'string':
            return 'Default String';
          case 'number':
            return '42';
        }
      },
      when: (answers: { [k: string]: string }) => {
        return answers.contributionType == 'settings';
      },
    },
    {
      type: 'checkbox',
      name: 'scope',
      message: 'Select the scops for your setting:',
      choices: [
        { name: 'Account', value: 'account' },
        { name: 'User', value: 'user' },
      ],
      default: ['account', 'user'],
      when: (answers: { [k: string]: string }) => {
        return answers.contributionType === 'settings';
      },
    },
    {
      type: 'input',
      name: 'handles',
      message:
        'Enter the events your contribution handles, separated by commas:',
      default: 'aha.audit,aha.workflow-board.shipped',
      filter: (input: string, _answers: { [k: string]: string }) => {
        const cleanInput = input.replace(/\s+/g, '');
        return cleanInput.split(',');
      },
      when: (answers: { [k: string]: string }) => {
        return answers.contributionType === 'eventHandlers';
      },
    },
  ],
};
