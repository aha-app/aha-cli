import { printRecordResult } from '../../lib/record-output';
import { promptForTitle } from '../../lib/record-input';
import BaseCommand from '../../base';
import {
  WorkspaceRecord,
  workspaceFlags,
  workspaceEditFlags,
  workspacePatch,
  resolveWorkspaceIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/workspace-api';

export default class WorkspaceCreate extends BaseCommand {
  static description = 'Create a workspace with a title and reference prefix';
  static flags = {
    ...workspaceFlags,
    ...workspaceEditFlags,
  };
  async run() {
    if (this.parse().argv.length)
      throw new Error('Use --title and --prefix to create a workspace.');
    const query = fieldQuery(this.flags);
    const flags = { ...this.flags };
    if (flags.input === undefined)
      flags.title = await promptForTitle(flags.title, Boolean(flags.json));
    const patch = await workspacePatch(flags, true);
    await this.initAPI();
    await resolveWorkspaceIds(this.api, patch);
    const result = await this.api.post(`/api/v3/projects?${query}`, {
      body: { record: patch },
    });
    const workspace = (result.body as { record: WorkspaceRecord }).record;
    warnEmbedded(workspace);
    printRecordResult(this, workspace, 'Created workspace');
  }
}
