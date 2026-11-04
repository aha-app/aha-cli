import AhaAPI from '../api';

export async function currentUserId(api: AhaAPI): Promise<string> {
  // V3 exposes users by ID, but has no current-user endpoint.
  const result = await api.get('/api/v1/me');
  const me = result.body as { user?: { id?: string } };
  if (typeof me?.user?.id !== 'string' || !me.user.id) {
    throw new Error(
      'Could not determine the signed-in user. No record was changed.'
    );
  }
  return me.user.id;
}
