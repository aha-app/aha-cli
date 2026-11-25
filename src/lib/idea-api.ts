import { recordIdentifier, warnEmbedded } from './record-api';
export { fieldQuery } from './record-api';
import { descriptionText, printTable } from './record-output';
import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';

interface EmbeddedCollection {
  records: unknown[];
  has_more?: boolean;
}
export interface IdeaRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  status?: { id?: string; name?: string };
  project?: { id: string; name?: string; reference_prefix?: string };
  assigned_to_user?: { id: string; name?: string } | null;
  submitted_idea_portal?: { id: string; name?: string } | null;
  contributor?: { id: string; name?: string; type?: string } | null;
  description?: { body: string };
  score?: number | string;
  endorsements_count?: number;
  spam?: boolean;
  visibility?: string;
  created_at?: string;
  updated_at?: string;
  score_facts?: {
    records: {
      scoring_system_metric_id: string;
      name?: string;
      value?: number | string | null;
    }[];
    has_more?: boolean;
  };
  comments?: EmbeddedCollection;
  portal_comments?: EmbeddedCollection;
  watchers?: EmbeddedCollection;
}
export const ideaFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default:
      'default,description,status,project,assigned_to_user,submitted_idea_portal,contributor,score,endorsements_count,spam,visibility',
  }),
};
export function ideaIdentifier(args: string[]) {
  return recordIdentifier(args, 'view', 'idea');
}
export async function fetchIdea(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<IdeaRecord> {
  const result = await api.get(
    `/api/v3/ideas/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: IdeaRecord }).record;
}
export function printIdea(command: BaseCommand, idea: IdeaRecord) {
  warnEmbedded(idea);
  if (command.flags.json) command.log(JSON.stringify(idea, null, 2));
  else {
    command.log(
      `${idea.reference_num || idea.id}${idea.name ? `: ${idea.name}` : ''}`
    );
    if (idea.status?.name) command.log(`Status: ${idea.status.name}`);
    if (idea.project)
      command.log(
        `Workspace: ${
          idea.project.name || idea.project.reference_prefix || idea.project.id
        }`
      );
    if (idea.assigned_to_user)
      command.log(
        `Owner: ${idea.assigned_to_user.name || idea.assigned_to_user.id}`
      );
    if (idea.submitted_idea_portal)
      command.log(
        `Submitted portal: ${
          idea.submitted_idea_portal.name || idea.submitted_idea_portal.id
        }`
      );
    if (idea.contributor)
      command.log(
        `Contributor: ${idea.contributor.name || idea.contributor.id}${
          idea.contributor.type ? ` (${idea.contributor.type})` : ''
        }`
      );
    if (typeof idea.score === 'number' || typeof idea.score === 'string')
      command.log(`Score: ${idea.score}`);
    if (typeof idea.endorsements_count === 'number')
      command.log(`Endorsements: ${idea.endorsements_count}`);
    if (typeof idea.spam === 'boolean')
      command.log(`Spam: ${idea.spam ? 'yes' : 'no'}`);
    if (idea.visibility) command.log(`Visibility: ${idea.visibility}`);
    if (idea.created_at) command.log(`Created: ${idea.created_at}`);
    if (idea.updated_at) command.log(`Updated: ${idea.updated_at}`);
    if (idea.description?.body)
      command.log(descriptionText(idea.description.body));
    if (idea.score_facts?.records.length)
      printTable(
        command,
        ['METRIC ID', 'METRIC', 'VALUE'],
        idea.score_facts.records.map(fact => [
          fact.scoring_system_metric_id,
          fact.name || '',
          String(fact.value ?? ''),
        ])
      );
    for (const [label, collection] of [
      ['Internal comments', idea.comments],
      ['Portal comments', idea.portal_comments],
      ['Watchers', idea.watchers],
    ] as const)
      if (collection)
        command.log(`${label} shown: ${collection.records.length}`);
    if (idea.html_url) command.log(idea.html_url);
  }
}
