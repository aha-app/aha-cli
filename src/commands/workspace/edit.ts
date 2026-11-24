import { printRecordResult } from '../../lib/record-output';
import BaseCommand from '../../base';
import {
  WorkspaceRecord,
  workspaceFlags,
  workspaceEditFlags,
  workspaceIdentifier,
  workspacePatch,
  resolveWorkspaceIds,
  fieldQuery,
  warnEmbedded,
} from '../../lib/workspace-api';

export default class WorkspaceEdit extends BaseCommand {
  static description = 'Edit only the supplied workspace fields';
  static args = '<id-or-prefix>';
  static flags = { ...workspaceFlags, ...workspaceEditFlags };
  async run() {
    const id = workspaceIdentifier(this.parse().argv, 'edit');
    const query = fieldQuery(this.flags);
    const patch = await workspacePatch(this.flags, false);
    await this.initAPI();
    await resolveWorkspaceIds(this.api, patch);
    const result = await this.api.put(
      `/api/v3/projects/${encodeURIComponent(id)}?${query}`,
      { body: { record: patch } }
    );
    const workspace = (result.body as { record: WorkspaceRecord }).record;
    warnEmbedded(workspace);
    printRecordResult(this, workspace, 'Updated workspace');
  }
}
