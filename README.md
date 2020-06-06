aha-cli
=======

Aha! command line interface

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/aha-cli.svg)](https://npmjs.org/package/aha-cli)
[![Downloads/week](https://img.shields.io/npm/dw/aha-cli.svg)](https://npmjs.org/package/aha-cli)
[![License](https://img.shields.io/npm/l/aha-cli.svg)](https://github.com/aha-app/aha-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g aha-cli
$ aha COMMAND
running command...
$ aha (-v|--version|version)
aha-cli/0.0.0 darwin-x64 node-v10.20.1
$ aha --help [COMMAND]
USAGE
  $ aha COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aha hello [FILE]`](#aha-hello-file)
* [`aha help [COMMAND]`](#aha-help-command)

## `aha hello [FILE]`

describe the command here

```
USAGE
  $ aha hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ aha hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/aha-app/aha-cli/blob/v0.0.0/src/commands/hello.ts)_

## `aha help [COMMAND]`

display help for aha

```
USAGE
  $ aha help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_
<!-- commandsstop -->
