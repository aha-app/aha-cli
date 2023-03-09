aha-cli
=======

Command line interface for working with [Aha!](https://www.aha.io).

Currently supported commands are for creating and managing extensions. 

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
```sh-session
$ npm install -g aha-cli
$ aha auth:login
Authentication to Aha!...
$ aha extension:create
Create a new extension...
$ aha extension:install
Install the extension into your Aha! account...
```
# Commands
<!-- commands -->
* [`aha auth:check`](#aha-authcheck)
* [`aha auth:login`](#aha-authlogin)
* [`aha extension:add-contribution`](#aha-extensionadd-contribution)
* [`aha extension:build`](#aha-extensionbuild)
* [`aha extension:create`](#aha-extensioncreate)
* [`aha extension:install`](#aha-extensioninstall)
* [`aha extension:tail`](#aha-extensiontail)
* [`aha extension:uninstall`](#aha-extensionuninstall)
* [`aha extension:watch`](#aha-extensionwatch)
* [`aha help [COMMANDS]`](#aha-help-commands)

## `aha auth:check`

Check if the stored credentials work

```
USAGE
  $ aha auth:check [-s <value>]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication

DESCRIPTION
  Check if the stored credentials work
```

_See code: [src/commands/auth/check.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/auth/check.ts)_

## `aha auth:login`

Login to Aha! and save credentials for other commands

```
USAGE
  $ aha auth:login [-s <value>] [--authServer <value>] [--browser <value>]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication
  --authServer=<value>     [default: https://secure.aha.io] server to use for authentication
  --browser=<value>        browser to use for login, e.g. 'safari' or 'firefox'

DESCRIPTION
  Login to Aha! and save credentials for other commands
  Credentials are saved in ~/.netrc
```

_See code: [src/commands/auth/login.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/auth/login.ts)_

## `aha extension:add-contribution`

Add a contribution to an extension

```
USAGE
  $ aha extension:add-contribution [-s <value>]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication

DESCRIPTION
  Add a contribution to an extension
```

_See code: [src/commands/extension/add-contribution.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/extension/add-contribution.ts)_

## `aha extension:build`

Build an extension into a zip file for ease of distribution

```
USAGE
  $ aha extension:build [-s <value>] [--noCache]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication
  --noCache                skip cached http imports

DESCRIPTION
  Build an extension into a zip file for ease of distribution
```

_See code: [src/commands/extension/build.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/extension/build.ts)_

## `aha extension:create`

Create an example extension

```
USAGE
  $ aha extension:create [-s <value>]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication

DESCRIPTION
  Create an example extension
```

_See code: [src/commands/extension/create.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/extension/create.ts)_

## `aha extension:install`

Install the extension from the current directory

```
USAGE
  $ aha extension:install [-s <value>] [--dumpCode] [--noCache]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication
  --dumpCode               dump all code as it is uploaded
  --noCache                skip cached http imports

DESCRIPTION
  Install the extension from the current directory
```

_See code: [src/commands/extension/install.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/extension/install.ts)_

## `aha extension:tail`

Live tail extension logs

```
USAGE
  $ aha extension:tail [-s <value>]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication

DESCRIPTION
  Live tail extension logs
```

_See code: [src/commands/extension/tail.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/extension/tail.ts)_

## `aha extension:uninstall`

Uninstall the extension in the current directory

```
USAGE
  $ aha extension:uninstall [-s <value>]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication

DESCRIPTION
  Uninstall the extension in the current directory
```

_See code: [src/commands/extension/uninstall.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/extension/uninstall.ts)_

## `aha extension:watch`

Watch the current directory for changes and install the extension each time a file changes

```
USAGE
  $ aha extension:watch [-s <value>] [--noCache]

FLAGS
  -s, --subdomain=<value>  Aha! subdomain to use for authentication
  --noCache                skip cached http imports

DESCRIPTION
  Watch the current directory for changes and install the extension each time a file changes
```

_See code: [src/commands/extension/watch.ts](https://github.com/aha-app/aha-cli/blob/v1.13.1/src/commands/extension/watch.ts)_

## `aha help [COMMANDS]`

Display help for aha.

```
USAGE
  $ aha help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for aha.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.7/src/commands/help.ts)_
<!-- commandsstop -->
