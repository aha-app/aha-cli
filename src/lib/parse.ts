import { FlagDefinition } from './flags';

export function parseArgs(
  argv: string[],
  flagDefs: Record<string, FlagDefinition>
): { flags: Record<string, any>; args: Record<string, any>; argv: string[] } {
  const flags: Record<string, any> = {};
  const positional: string[] = [];

  // Set defaults
  for (const [name, def] of Object.entries(flagDefs)) {
    if (def.default !== undefined) flags[name] = def.default;
    if (def.type === 'boolean' && def.default === undefined) flags[name] = false;
  }

  // Build char -> name map
  const charMap: Record<string, string> = {};
  for (const [name, def] of Object.entries(flagDefs)) {
    if (def.char) charMap[def.char] = name;
  }

  // Build kebab -> camel map
  const kebabMap: Record<string, string> = {};
  for (const name of Object.keys(flagDefs)) {
    const kebab = name.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (kebab !== name) kebabMap[kebab] = name;
  }

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--') {
      positional.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      const rawKey = eqIdx >= 0 ? arg.slice(2, eqIdx) : arg.slice(2);
      const eqValue = eqIdx >= 0 ? arg.slice(eqIdx + 1) : undefined;

      // Resolve flag name: try exact match, then kebab-to-camel
      const flagName = flagDefs[rawKey] ? rawKey : (kebabMap[rawKey] || rawKey);
      const def = flagDefs[flagName];

      if (!def) {
        // Unknown flag — treat as positional to be lenient
        positional.push(arg);
        i++;
        continue;
      }

      if (def.type === 'boolean') {
        flags[flagName] = true;
      } else {
        const value = eqValue ?? argv[++i];
        if (value === undefined) {
          throw new Error(`Flag --${rawKey} requires a value`);
        }
        flags[flagName] = value;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const char = arg[1];
      const name = charMap[char];
      if (!name) {
        positional.push(arg);
        i++;
        continue;
      }
      const def = flagDefs[name];
      if (def.type === 'boolean') {
        flags[name] = true;
      } else {
        const value = argv[++i];
        if (value === undefined) {
          throw new Error(`Flag -${char} requires a value`);
        }
        flags[name] = value;
      }
    } else {
      positional.push(arg);
    }

    i++;
  }

  return { flags, args: {}, argv: positional };
}
