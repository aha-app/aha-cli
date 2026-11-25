// Quote numeric identifier tokens before JSON.parse can round a large integer.
// String tokens are consumed whole, preserving HTML and JSON-looking body text.
export function parseJSONWithStringIds(source: string) {
  let identifierKey = false;
  let identifierValue = false;
  const tokens = /"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|[^\s]/g;
  const normalized = source.replace(tokens, token => {
    if (token.startsWith('"')) {
      const key: string = JSON.parse(token);
      identifierKey = key === 'id' || key.endsWith('_id');
      identifierValue = false;
      return token;
    }
    if (token === ':') {
      identifierValue = identifierKey;
      identifierKey = false;
      return token;
    }
    const numericIdentifier = identifierValue && /^-?\d/.test(token);
    identifierValue = false;
    identifierKey = false;
    if (!numericIdentifier) return token;
    if (!/^-?(?:0|[1-9]\d*)$/.test(token))
      throw new Error('The API returned a non-integer numeric identifier.');
    return JSON.stringify(token);
  });
  return JSON.parse(normalized);
}
