import BaseCommand from '../../base';
import * as chalk from 'chalk';

interface LogContent {
  t: string;
  s: string;
  m: string;
}
interface LogEntry {
  createdAt: string;
  content: LogContent[];
  extensionContribution: {
    identifier: string;
  };
}

interface ExtensionLogResult {
  body?: {
    data: {
      extensionLogs: {
        nodes: LogEntry[];
      };
    };
  };
}

const colorizeSeverity = (s: string) => {
  let color;
  switch (s) {
    case 'e':
      color = chalk.bgRed.dim.bold;
      break;
    case 'w':
      color = chalk.bgYellow.dim.bold;
      break;
    case 'i':
      color = chalk.bgCyan.dim.bold;
      break;
    case 'd':
      color = chalk.bgWhite.dim.bold;
      break;
    default:
      color = chalk.dim.bold;
  }

  return color(` ${s.toUpperCase()} `);
};

const outputLog = (logGroup: LogEntry, log: LogContent) => {
  process.stdout.write(chalk.blue(log.t));
  process.stdout.write(' ');
  process.stdout.write(chalk.dim(logGroup.extensionContribution.identifier));
  process.stdout.write(' ');
  process.stdout.write(colorizeSeverity(log.s));
  process.stdout.write(' ');
  if (typeof log.m === 'string') process.stdout.write(log.m);
  else process.stdout.write(JSON.stringify(log.m));
  process.stdout.write('\n');
};

export default class Tail extends BaseCommand {
  static needsAuth = true;

  static description = 'Live tail extension logs';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    let lastTimestamp = new Date().toISOString();
    const loopDelayStart = 100;
    const loopDelayMax = 5000;
    let loopDelayMs = loopDelayStart;
    const startTime = new Date().getTime();

    while (true) {
      // Only loop for one hour so this can't use infinite resources.
      if (startTime + 60 * 60 * 1000 < new Date().getTime()) {
        process.stdout.write('Stopping after one hour.\n');
        break;
      }
      const result = (await this.api.post(`/api/v2/graphql`, {
        body: {
          query: `{
            extensionLogs(filters: {createdSince: "${lastTimestamp}"}) {
              nodes {
                extensionContribution {
                  identifier
                }
                content
                createdAt
              }
            }
          }
          `,
        },
      })) as ExtensionLogResult;

      if (result.body && result.body.data.extensionLogs.nodes.length === 0) {
        // Nothing happening. Wait a bit before looping again.
        await new Promise(resolve => setTimeout(resolve, loopDelayMs));
        if (loopDelayMs < loopDelayMax) loopDelayMs += 500;
      } else if (result.body) {
        // Check faster next time.
        loopDelayMs = loopDelayStart;

        for (const logGroup of result.body.data.extensionLogs.nodes) {
          for (const log of logGroup.content) {
            outputLog(logGroup, log);
          }
          lastTimestamp = logGroup.createdAt;
        }
      }
    }
  }
}
