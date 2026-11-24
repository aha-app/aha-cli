import BaseCommand from '../../base';
import {
  workspaceFlags,
  workspaceIdentifier,
  fieldQuery,
  fetchWorkspace,
  printWorkspace,
} from '../../lib/workspace-api';

export default class WorkspaceView extends BaseCommand {
  static description = 'View a workspace or team by ID or prefix';
  static args = '<id-or-prefix>';
  static flags = workspaceFlags;
  async run() {
    const id = workspaceIdentifier(this.parse().argv, 'view');
    const query = fieldQuery(this.flags);
    await this.initAPI();
    printWorkspace(this, await fetchWorkspace(this.api, id, query));
  }
}
