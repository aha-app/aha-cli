const { spawn } = require('node:child_process');
const { createServer } = require('node:http');
const { mkdtemp, writeFile, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

const cli = resolve(__dirname, '../lib/cli.js');

async function setup(t, handler) {
  const dir = await mkdtemp(join(tmpdir(), 'aha-cli-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const requests = [];
  const server = createServer(async (req, res) => {
    let text = '';
    for await (const chunk of req) text += chunk;
    requests.push({
      method: req.method,
      url: req.url,
      auth: req.headers.authorization,
      body: text ? JSON.parse(text) : undefined,
    });
    const response = handler
      ? handler(req, requests.at(-1))
      : req.url === '/api/v1/me'
      ? { user: { id: '1234567890123456789', email: 'me@example.test' } }
      : {
          record: {
            id: '99',
            name: 'Review notes',
            html_url: 'https://example.test/tasks/99',
            url: 'https://example.test/api/v3/tasks/99',
          },
        };
    res.writeHead(response.status || 200, {
      'content-type': 'application/json',
    });
    res.end(JSON.stringify(response));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  await writeFile(
    join(dir, '.netrc'),
    `machine local\n  type aha\n  token test-key\n  url http://127.0.0.1:${
      server.address().port
    }\n`,
    { mode: 0o600 }
  );
  return { dir, requests };
}

function run(dir, args, { input = '', response, confirm } = {}) {
  // Give each subprocess an isolated credential store without touching the user's home.
  const bootstrap = `const credentialHome = process.argv[1]; require('node:os').homedir = () => credentialHome;
    ${
      confirm !== undefined
        ? `Object.defineProperty(process.stdin, 'isTTY', {value: true}); require('inquirer').prompt = async () => ({confirmed: ${JSON.stringify(
            confirm
          )}});`
        : ''
    }
    ${
      response
        ? `global.fetch = async () => new Response(${JSON.stringify(
            JSON.stringify(response.body)
          )}, {status: ${
            response.status || 200
          }, headers: {'content-type': 'application/json'}});`
        : ''
    }
    process.argv = [process.execPath, ${JSON.stringify(
      cli
    )}, ...process.argv.slice(2)];
    require(${JSON.stringify(cli)});`;
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', bootstrap, dir, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '';
    child.stdout.on('data', data => {
      stdout += data;
    });
    child.stderr.on('data', data => {
      stderr += data;
    });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
    child.stdin.end(input);
  });
}

module.exports = { setup, run };
