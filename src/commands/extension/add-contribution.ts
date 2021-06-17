import BaseCommand from '../../base';
import ux from 'cli-ux';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import templates from '../../utils/templates';
import questions from '../../utils/questions';

export default class AddContribution extends BaseCommand {
  static description = 'Add a contribution to an extension';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    if (!fs.existsSync('./package.json')) {
      throw new Error('Unable to find package.json in the current directory.');
    }

    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    if (!packageJson.ahaExtension) {
      throw new Error('Unable to find the ahaExtension entry in package.json.');
    }

    packageJson.ahaExtension.contributes =
      packageJson.ahaExtension.contributes || {};

    const newContributions: { [k: string]: any } = {};

    do {
      process.stdout.write('\n');

      const contribution = await questions.getContributionFromQuestions();

      newContributions[contribution.type] =
        newContributions[contribution.type] || {};
      newContributions[contribution.type][contribution.name] =
        contribution.contribution;
      packageJson.ahaExtension.contributes[contribution.type] =
        packageJson.ahaExtension.contributes[contribution.type] || {};
      packageJson.ahaExtension.contributes[contribution.type][
        contribution.name
      ] = contribution.contribution;
    } while (
      (await inquirer.prompt(questions.addAnotherContributionQuestion)).add ===
      'yes'
    );

    // Update the package.json file
    ux.action.start('Writing package.json file');
    fs.writeFileSync(
      `./package.json`,
      JSON.stringify(
        packageJson,
        (key, value) => {
          if (value !== null) return value;
        },
        2
      )
    );
    ux.action.stop('Finished writing package.json file');

    // Create the contributions
    ux.action.start('Creating contributions');

    templates.writeContributionTemplates(
      fs,
      '.',
      packageJson.name,
      newContributions
    );

    ux.action.stop('Contributions created');
  }
}
