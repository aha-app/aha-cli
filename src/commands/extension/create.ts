import BaseCommand from '../../base';
import ux from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import { packageRoot } from '../../utils/package-info';
import * as inquirer from 'inquirer';
import templates from '../../utils/templates';
import questions from '../../utils/questions';

export default class Create extends BaseCommand {
  static description = 'Create an example extension';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const extensionAnswers = (await inquirer.prompt(questions.extensionQuestions));
    const directoryName = extensionAnswers.identifier.match(/^[^.]+\.([^.]+)$/)[1];

    // Check if the extension already exists.
    if (fs.existsSync(directoryName)) {
      throw new Error(`A directory named '${directoryName}' already exists.`);
    }

    let ahaExtensionSchema: { [k: string]: any } = {};
    ahaExtensionSchema.contributes = {};

    const createContributions = (await inquirer.prompt(questions.addContributionsQuestion)).createContributions

    if (createContributions) {
      do {
        process.stdout.write("\n");
        
        const contribution = await questions.getContributionFromQuestions();
                       
        ahaExtensionSchema.contributes[contribution.type] = ahaExtensionSchema.contributes[contribution.type] || {};
        ahaExtensionSchema.contributes[contribution.type][contribution.name] = contribution.contribution;               
      } while ((await inquirer.prompt(questions.addAnotherContributionQuestion)).add == 'yes')
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
    ux.action.start('Creating extension');

    fs.mkdirSync(directoryName);
    fs.writeFileSync(
      `${directoryName}/package.json`,
      templates.packageTemplate(extensionAnswers.identifier, extensionAnswers.name, extensionAnswers.author, ahaExtensionSchema)
    );

    fs.writeFileSync(`${directoryName}/README.md`, templates.readmeTemplate(extensionAnswers.name));

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
    fs.writeFileSync(`${directoryName}/tsconfig.json`, templates.tsconfigTemplate());
    fs.mkdirSync(`${directoryName}/.vscode`);
    fs.writeFileSync(
      `${directoryName}/.vscode/settings.json`,
      templates.vscodeTemplate()
    );
    fs.writeFileSync(`${directoryName}/.gitignore`, templates.gitignoreTemplate());
    
    templates.writeContributionTemplates(fs, directoryName, extensionAnswers.identifier, ahaExtensionSchema.contributes);

    ux.action.stop(`Extension created in directory '${directoryName}'`);
  }
}
