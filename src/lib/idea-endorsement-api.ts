import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
import { warnEmbedded } from './record-api';
import { lookupIdentifier } from './idea-lookup-api';
import { descriptionText } from './record-output';
export { fieldQuery } from './record-api';
interface LinkedRecord {
  id: string;
  reference_num?: string;
  name?: string;
  email?: string;
  type?: string;
}
export interface IdeaEndorsementRecord {
  id: string;
  idea?: LinkedRecord | null;
  idea_organization?: LinkedRecord | null;
  contributor?: LinkedRecord | null;
  weight?: number;
  value?: number | string;
  description?: { body: string };
  html_url?: string;
  created_at?: string;
  updated_at?: string;
}
export const ideaEndorsementFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default:
      'default,description,weight,value,idea,idea_organization,contributor',
  }),
};
export function ideaEndorsementIdentifier(args: string[]) {
  return lookupIdentifier(args, 'idea-endorsement');
}
export async function fetchIdeaEndorsement(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<IdeaEndorsementRecord> {
  const result = await api.get(
    `/api/v3/idea_endorsements/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: IdeaEndorsementRecord }).record;
}
export function linkedLabel(record?: LinkedRecord | null) {
  return record
    ? `${record.reference_num || record.id}${
        record.name || record.email ? ` (${record.name || record.email})` : ''
      }${record.type ? ` [${record.type}]` : ''}`
    : '—';
}
export function printIdeaEndorsement(
  command: BaseCommand,
  endorsement: IdeaEndorsementRecord
) {
  warnEmbedded(endorsement);
  if (command.flags.json) {
    command.log(JSON.stringify(endorsement, null, 2));
    return;
  }
  command.log(`Endorsement ${endorsement.id}`);
  if (endorsement.idea) command.log(`Idea: ${linkedLabel(endorsement.idea)}`);
  if (endorsement.idea_organization)
    command.log(`Organization: ${linkedLabel(endorsement.idea_organization)}`);
  if (endorsement.contributor)
    command.log(`Contributor: ${linkedLabel(endorsement.contributor)}`);
  if (typeof endorsement.weight === 'number')
    command.log(`Weight: ${endorsement.weight}`);
  if (
    typeof endorsement.value === 'number' ||
    typeof endorsement.value === 'string'
  )
    command.log(`Value: ${endorsement.value}`);
  if (endorsement.created_at) command.log(`Created: ${endorsement.created_at}`);
  if (endorsement.updated_at) command.log(`Updated: ${endorsement.updated_at}`);
  if (endorsement.description?.body)
    command.log(descriptionText(endorsement.description.body));
  if (endorsement.html_url) command.log(endorsement.html_url);
}
