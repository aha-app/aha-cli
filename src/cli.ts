#!/usr/bin/env node
import Login from './commands/auth/login';
import Check from './commands/auth/check';
import Build from './commands/extension/build';
import Create from './commands/extension/create';
import Install from './commands/extension/install';
import Tail from './commands/extension/tail';
import Uninstall from './commands/extension/uninstall';
import Watch from './commands/extension/watch';
import AddContribution from './commands/extension/add-contribution';
import BaseCommand from './base';
import { FlagDefinition } from './lib/flags';

const VERSION = '3.0.0';

interface CommandClass {
  new (argv: string[]): BaseCommand;
  description: string;
  flags: Record<string, FlagDefinition>;
}

const COMMANDS: Record<string, CommandClass> = {
  'auth:login': Login,
  'auth:check': Check,
  'extension:build': Build,
  'extension:create': Create,
  'extension:install': Install,
  'extension:tail': Tail,
  'extension:uninstall': Uninstall,
  'extension:watch': Watch,
  'extension:add-contribution': AddContribution,
};

const TOPICS: Record<string, { description: string; default?: string }> = {
  auth: { description: 'Authenticate to Aha!' },
  extension: { description: 'Manage extensions' },
};

function resolveCommand(
  argv: string[]
): { CommandClass: CommandClass; commandArgv: string[] } | null {
  if (argv.length === 0) return null;

  // Try colon form: "auth:login"
  if (argv[0].includes(':')) {
    const cmd = COMMANDS[argv[0]];
    if (cmd) return { CommandClass: cmd, commandArgv: argv.slice(1) };
    return null;
  }

  // Try two-word form: "auth login" (second arg must not be a flag)
  if (argv.length >= 2 && !argv[1].startsWith('-')) {
    const id = `${argv[0]}:${argv[1]}`;
    const cmd = COMMANDS[id];
    if (cmd) return { CommandClass: cmd, commandArgv: argv.slice(2) };
  }

  // Try topic default command
  const topic = TOPICS[argv[0]];
  if (topic?.default) {
    const cmd = COMMANDS[topic.default];
    if (cmd) return { CommandClass: cmd, commandArgv: argv.slice(1) };
  }

  return null;
}

function printHelp() {
  console.log(`Aha! CLI v${VERSION}

USAGE
  $ aha <command> [flags]

TOPICS`);
  for (const [name, topic] of Object.entries(TOPICS)) {
    console.log(`  ${name.padEnd(16)} ${topic.description}`);
  }
  console.log(`\nCOMMANDS`);
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    // Only use first line of description in the list
    const desc = (cmd.description || '').split('\n')[0];
    console.log(`  ${name.padEnd(30)} ${desc}`);
  }
  console.log(
    `\nRun "aha <command> --help" for more information about a command.`
  );
}

function printTopicHelp(topicName: string) {
  const topic = TOPICS[topicName];
  if (!topic) return;

  console.log(`${topic.description}\n`);
  console.log('COMMANDS');
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    if (name.startsWith(topicName + ':')) {
      const subName = name.replace(':', ' ');
      const desc = (cmd.description || '').split('\n')[0];
      console.log(`  ${subName.padEnd(30)} ${desc}`);
    }
  }
}

function printCommandHelp(commandId: string, CommandClass: CommandClass) {
  const usageName = commandId.replace(':', ' ');
  console.log(`${CommandClass.description}\n`);
  console.log(`USAGE`);
  console.log(`  $ aha ${usageName} [flags]\n`);

  const flags = CommandClass.flags;
  if (flags && Object.keys(flags).length > 0) {
    console.log('FLAGS');
    for (const [name, def] of Object.entries(flags)) {
      const kebab = name.replace(/([A-Z])/g, '-$1').toLowerCase();
      const charPart = def.char ? `-${def.char}, ` : '    ';
      const valuePart = def.type === 'string' ? '=<value>' : '';
      const defaultPart =
        def.default !== undefined ? ` (default: ${def.default})` : '';
      console.log(
        `  ${charPart}--${kebab}${valuePart}${' '.repeat(
          Math.max(1, 20 - kebab.length - valuePart.length)
        )}${def.description || ''}${defaultPart}`
      );
    }
  }
}

async function main() {
  const argv = process.argv.slice(2);

  // Handle --version
  if (argv.length === 0 || argv[0] === '--version' || argv[0] === '-v') {
    if (argv[0] === '--version' || argv[0] === '-v') {
      console.log(VERSION);
      return;
    }
  }

  // Handle top-level --help or no args
  if (
    argv.length === 0 ||
    argv[0] === '--help' ||
    argv[0] === '-h' ||
    argv[0] === 'help'
  ) {
    printHelp();
    return;
  }

  // Handle topic --help: "aha auth --help" or "aha auth -h"
  if (
    argv.length >= 1 &&
    TOPICS[argv[0]] &&
    (argv.length === 1 ||
      argv[1] === '--help' ||
      argv[1] === '-h' ||
      argv[1] === 'help')
  ) {
    // If it's just the topic name with no default, show topic help
    if (
      !TOPICS[argv[0]].default ||
      argv[1] === '--help' ||
      argv[1] === '-h' ||
      argv[1] === 'help'
    ) {
      printTopicHelp(argv[0]);
      return;
    }
  }

  // Resolve command
  const resolved = resolveCommand(argv);

  if (!resolved) {
    console.error(`Unknown command: ${argv.join(' ')}`);
    console.error('Run "aha --help" for a list of commands.');
    process.exit(1);
  }

  const { CommandClass, commandArgv } = resolved;

  // Handle command-level --help
  if (commandArgv.includes('--help') || commandArgv.includes('-h')) {
    // Find the command ID
    const commandId =
      Object.entries(COMMANDS).find(([, c]) => c === CommandClass)?.[0] || '';
    printCommandHelp(commandId, CommandClass);
    return;
  }

  const cmd = new CommandClass(commandArgv);
  await cmd.execute();
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
