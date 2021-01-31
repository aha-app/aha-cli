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
$ npm install -g @aha-app/aha-cli
$ aha COMMAND
running command...
$ aha (-v|--version|version)
@aha-app/aha-cli/1.0.3 darwin-x64 node-v12.19.1
$ aha --help [COMMAND]
USAGE
  $ aha COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aha auth:check`](#aha-authcheck)
* [`aha auth:login`](#aha-authlogin)
* [`aha extension:create`](#aha-extensioncreate)
* [`aha extension:install`](#aha-extensioninstall)
* [`aha extension:tail`](#aha-extensiontail)
* [`aha extension:uninstall`](#aha-extensionuninstall)
* [`aha extension:watch`](#aha-extensionwatch)
* [`aha help [COMMAND]`](#aha-help-command)

## `aha auth:check`

Check if the stored credentials work

```
USAGE
  $ aha auth:check

OPTIONS
  -s, --subdomain=subdomain  Aha! subdomain to use for authentication
```

_See code: [src/commands/auth/check.ts](https://github.com/aha-app/aha-cli/blob/v1.0.3/src/commands/auth/check.ts)_

## `aha auth:login`

Login to Aha! and save credentials for other commands

```
USAGE
  $ aha auth:login

OPTIONS
  -s, --subdomain=subdomain  Aha! subdomain to use for authentication
  --authServer=authServer    [default: https://secure.aha.io] server to use for authentication
  --browser=browser          browser to use for login, e.g. 'safari' or 'firefox'

DESCRIPTION
  Credentials are saved in ~/.netrc
```

_See code: [src/commands/auth/login.ts](https://github.com/aha-app/aha-cli/blob/v1.0.3/src/commands/auth/login.ts)_

## `aha extension:create`

Create an example extension

```
USAGE
  $ aha extension:create

OPTIONS
  -s, --subdomain=subdomain  Aha! subdomain to use for authentication
```

_See code: [src/commands/extension/create.ts](https://github.com/aha-app/aha-cli/blob/v1.0.3/src/commands/extension/create.ts)_

## `aha extension:install`

Install the extension from the current directory

```
USAGE
  $ aha extension:install

OPTIONS
  -s, --subdomain=subdomain  Aha! subdomain to use for authentication
  --dumpCode                 dump all code as it is uploaded
```

_See code: [src/commands/extension/install.ts](https://github.com/aha-app/aha-cli/blob/v1.0.3/src/commands/extension/install.ts)_

## `aha extension:tail`

Live tail extension logs

```
USAGE
  $ aha extension:tail

OPTIONS
  -s, --subdomain=subdomain  Aha! subdomain to use for authentication
```

_See code: [src/commands/extension/tail.ts](https://github.com/aha-app/aha-cli/blob/v1.0.3/src/commands/extension/tail.ts)_

## `aha extension:uninstall`

Uninstall the extension in the current directory

```
USAGE
  $ aha extension:uninstall

OPTIONS
  -s, --subdomain=subdomain  Aha! subdomain to use for authentication
```

_See code: [src/commands/extension/uninstall.ts](https://github.com/aha-app/aha-cli/blob/v1.0.3/src/commands/extension/uninstall.ts)_

## `aha extension:watch`

Watch the current directory for changes and install the extension each time a file changes

```
USAGE
  $ aha extension:watch

OPTIONS
  -s, --subdomain=subdomain  Aha! subdomain to use for authentication
```

_See code: [src/commands/extension/watch.ts](https://github.com/aha-app/aha-cli/blob/v1.0.3/src/commands/extension/watch.ts)_

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
