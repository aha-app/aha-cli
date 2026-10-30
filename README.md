# aha-cli

Command line interface for working with [Aha!](https://www.aha.io).

Currently supported commands are for creating and managing extensions, to-dos, and features.

<!-- toc -->
* [aha-cli](#aha-cli)
* [Usage](#usage)
* [Commands](#commands)
* [Aha! app commands](#aha-app-commands)
* [Development](#development)
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

_See code: [src/commands/auth/check.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/auth/check.ts)_

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

_See code: [src/commands/auth/login.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/auth/login.ts)_

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

_See code: [src/commands/extension/add-contribution.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/extension/add-contribution.ts)_

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

_See code: [src/commands/extension/build.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/extension/build.ts)_

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

_See code: [src/commands/extension/create.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/extension/create.ts)_

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

_See code: [src/commands/extension/install.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/extension/install.ts)_

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

_See code: [src/commands/extension/tail.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/extension/tail.ts)_

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

_See code: [src/commands/extension/uninstall.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/extension/uninstall.ts)_

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

_See code: [src/commands/extension/watch.ts](https://github.com/aha-app/aha-cli/blob/v2.1.0/src/commands/extension/watch.ts)_

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

# Aha! app commands

Commands for working with records in an Aha! instance use space-separated syntax.
Authenticate with `aha auth login`, or use an API key from standard input:

```sh-session
$ aha auth login --with-token --url https://your-account.aha.io < /path/to/api-key
```

Credentials are saved in `~/.netrc`. Use `-s <subdomain>` to select a saved account.
For API-key login, use `--subdomain <alias>` to give another instance a distinct
saved name (for example, `acme-local`). Login refuses to replace an alias belonging
to a different instance.

## To-dos

Create a to-do in My work, automatically assigned to yourself:

```sh-session
$ aha todo create --title "Review the release notes"
$ aha todo create -t "Review the release notes" -b "Check the examples" --due 2026-11-01
```

The title is prompted for when running interactively; scripts and `--json` mode must
provide `--title`. The optional `--body` is plain text, and `--due` uses `YYYY-MM-DD`.
The command prints the created to-do's URL.

List, view, edit, complete, reopen, or delete a to-do:

```sh-session
$ aha todo list
$ aha todo list --state completed --search "release notes"
$ aha todo list --state all --json
$ aha todo view PERSONAL-TODO-1
$ aha todo edit PERSONAL-TODO-1 --title "Review updated notes" --due 2026-11-02
$ aha todo complete PERSONAL-TODO-1
$ aha todo reopen PERSONAL-TODO-1
$ aha todo delete PERSONAL-TODO-1 --yes
```

The list includes all pages of to-dos assigned to you. `--state` accepts `pending`
(the default), `completed`, or `all`, based on your assignment's status. `--search`
matches text in the title. Individual commands accept a numeric ID or reference.
`view` shows the description, due date, overall status, assignees, parent, and link.

`edit` changes only the supplied fields. Use `--body ""`, `--clear-due`, or
`--clear-record` to clear the description, due date, or parent link. `complete` and
`reopen` update only your assignment; repeating either action reports when it is
already in the requested state. `delete` removes the entire shared to-do and asks
for confirmation unless `--yes` is supplied. Scripts must use `--yes`.

Assign users or link a to-do to a parent record when creating or editing it:

```sh-session
$ aha todo create -t "Review implementation" --assignee @me,123456789 --record DEMO-123 --record-type feature
$ aha todo edit PERSONAL-TODO-1 --add-assignee 123456789 --remove-assignee @me
$ aha todo edit PERSONAL-TODO-1 --record DEMO-123-1 --record-type requirement
```

Assignment options accept comma-separated numeric user IDs or `@me`. Create defaults
to yourself; an explicit `--assignee` selects those users, and `--unassigned` creates
without assignees. Edit adds or removes only the specified users, preserving other
assignments and their states. Parent links require both `--record` (ID or reference)
and `--record-type` (a v3 record type such as `feature`, `requirement`, `release`, or `page`).

All to-do commands accept `--json`: list returns an array of v3 records, record
commands return one v3 record, and delete returns `{ "id": "…", "deleted": true }`.
JSON preserves v3 fields, including overall status and individual assignment states.
Use `-s <subdomain>` to select an account when multiple accounts are saved; JSON mode
does not prompt. JSON deletion requires `--yes`.

Colon-separated commands also work, for example `aha todo:view` and `aha todo:edit`.

# Development

## Building

Build the CLI package into a `.tgz` file:

```sh-session
$ npm pack
```

This runs the `prepack` script automatically, which cleans the `lib/` directory, compiles TypeScript, and generates the oclif manifest. The output is a file like `aha-cli-v1.17.0.tgz`.

## Testing a local build

You can test the packaged CLI locally without installing it globally using `npx`:

```sh-session
$ npx --yes --package aha-cli-v1.17.0.tgz aha extension:watch
```

Replace `aha-cli-v1.17.0.tgz` with the actual filename produced by `npm pack`. Any `aha` command can be used this way, for example:

```sh-session
$ npx --yes --package aha-cli-v1.17.0.tgz aha extension:build
$ npx --yes --package aha-cli-v1.17.0.tgz aha extension:install
```

## Generating a binary executable

You can compile the CLI into a standalone executable for your current platform using Bun.

Install Bun:
https://bun.com/docs/installation

Install dependencies:

```sh
bun install
```

Build the executable:

```sh
bun run build:bun
```

This produces a binary at:

```sh
dist/aha
```

You can test it directly:

```sh
./dist/aha --version
```

If you want to install it locally on your PATH:

```sh
sudo mv dist/aha /usr/local/bin/
aha --version
```

## Feature commands (API v3)

`aha feature create`, `list`, `view`, `edit`, and `delete` support both
space-separated and colon-separated syntax. Select an account with `-s` and use
`--json` for scripts. These commands never prompt except for an interactive
feature deletion. Missing input and API permission/validation errors return a
nonzero exit code; API v3 failures do not trigger a v1 retry.

```sh
aha feature create --workspace AK --title 'Improve CLI' --json -s big
aha feature create --release AK-R-179 --title 'Improve CLI' -s big
aha feature list --workspace AK --search CLI --json -s big
aha feature list --filters '{"eq[status.id]":"123"}' --fields default,status --json -s big
aha feature view AK-123 --fields default,description,requirements,comments --json -s big
aha feature edit AK-123 --release AK-R-179 --owner @me -s big
aha feature edit AK-123 --status 123 --type 456 --start-date 2026-10-30 -s big
aha feature delete AK-123 --yes --json -s big
```

Creation requires a title and exactly one workspace or release. A workspace
uses its default release. Move an existing feature by selecting its new release.
Workspace, release, team, iteration, epic, and initiative flags accept supported
IDs/references and resolve references through API v3 before submitting ID fields.
Workflow status/type and team status flags take IDs. The `@me` owner shortcut
uses `/api/v1/me` because v3 has no current-user endpoint.

For full writable payloads, pass a **record object** through `--input file.json`
or pipe it to `--input -`; omit the outer `record` envelope. JSON IDs must be
strings to avoid precision loss. Do not supply a field through both JSON and a
flag. `--description` and JSON descriptions contain HTML; an empty description
clears it. Use JSON `null` to clear nullable dates/associations.

```sh
printf '%s' '{"description":"<p>Details</p>","initial_estimate":5,"remaining_estimate":3,"tags":[{"name":"CLI"}],"goals":[{"reference_num":"AK-G-1"}],"key_results":[{"reference_num":"AK-KR-1"}],"custom_fields":{"your_field_key":"value"}}' |
  aha feature edit AK-123 --input - --json -s big
```

JSON input also exposes detailed estimates/work done, duration/progress/estimate
sources, release phases, program increments, time codes, score facts, watchers,
and the other writable feature fields in API v3. Collection changes use v3 patch
semantics: omitted associations are untouched; use `{"id":"123","_destroy":true}`
to remove a specific collection item. Read-only or unknown top-level fields are
rejected locally. The server validates account-specific fields and permissions.

Lists follow every cursor page and return `{ "records": [...], "pagination": ... }`
in JSON mode. Use `--per-page` (1–200), `--filters` with documented API v3 filter
keys/string values, and `--fields` for field selection. Choose one parent flag
(`--workspace` or `--release`). `--sort field` and optional `--descending` use API
sorting, which may cap total results. Truncation remains in the JSON pagination
metadata and emits a warning; remove sorting to retrieve the entire collection.
Embedded collections are independently capped by API v3. Any embedded `has_more`
is preserved in JSON and warned about on stderr; a feature view does not imply
that every nested requirement or comment was returned.
