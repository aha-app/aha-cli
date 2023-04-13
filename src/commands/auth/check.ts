import BaseCommand from '../../base';
import { ux } from '@oclif/core';

export default class Check extends BaseCommand {
  static needsAuth = true;

  static description = `Check if the stored credentials work`;

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    ux.action.start('Checking credentials');
    await this.api.get('/api/v1/me');
    ux.action.stop('Success!');
  }
}
