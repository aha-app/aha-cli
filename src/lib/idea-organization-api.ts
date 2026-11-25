import BaseCommand from '../base';
import AhaAPI from '../api';
import { Flags } from './flags';
import { recordIdentifier, warnEmbedded } from './record-api';
import { descriptionText } from './record-output';
export { fieldQuery } from './record-api';

interface IdeaOrganizationRecord {
  id: string;
  reference_num?: string;
  name?: string;
  html_url?: string;
  revenue?: number | string | null;
  email_domains?: string[];
  description?: { body: string };
  creator?: { id: string; name?: string; email?: string; type?: string } | null;
  created_at?: string;
  updated_at?: string;
}
export const ideaOrganizationFlags = {
  ...BaseCommand.flags,
  json: Flags.boolean({ description: 'Output JSON without prompting' }),
  fields: Flags.string({
    description:
      'Comma-separated API v3 fields (embedded collections may be capped)',
    default: 'default,description,revenue,email_domains,creator',
  }),
};
export function ideaOrganizationIdentifier(args: string[]) {
  return recordIdentifier(args, 'view', 'idea-organization');
}
export async function fetchIdeaOrganization(
  api: AhaAPI,
  id: string,
  query: URLSearchParams
): Promise<IdeaOrganizationRecord> {
  const result = await api.get(
    `/api/v3/idea_organizations/${encodeURIComponent(id)}?${query}`
  );
  return (result.body as { record: IdeaOrganizationRecord }).record;
}
export function printIdeaOrganization(
  command: BaseCommand,
  organization: IdeaOrganizationRecord
) {
  warnEmbedded(organization);
  if (command.flags.json) {
    command.log(JSON.stringify(organization, null, 2));
    return;
  }
  command.log(
    `${organization.reference_num || organization.id}${
      organization.name ? `: ${organization.name}` : ''
    }`
  );
  if (
    typeof organization.revenue === 'number' ||
    typeof organization.revenue === 'string'
  )
    command.log(`Revenue: ${organization.revenue}`);
  if (organization.email_domains)
    command.log(
      `Email domains: ${organization.email_domains.join(', ') || '—'}`
    );
  if (organization.creator) {
    const creator = organization.creator;
    command.log(
      `Creator: ${creator.name || creator.email || creator.id}${
        creator.type ? ` (${creator.type})` : ''
      } [${creator.id}]`
    );
  }
  if (organization.created_at)
    command.log(`Created: ${organization.created_at}`);
  if (organization.updated_at)
    command.log(`Updated: ${organization.updated_at}`);
  if (organization.description?.body)
    command.log(descriptionText(organization.description.body));
  if (organization.html_url) command.log(organization.html_url);
}
