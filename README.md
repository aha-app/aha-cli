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
Their shared interface and implementation patterns are defined in
[Command conventions](docs/command-conventions.md).
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

## Features

`aha feature create`, `list`, `view`, `edit`, and `delete` support both
space-separated and colon-separated syntax. Select an account with `-s` and use
`--json` for scripts. Interactive creation prompts for a missing title when JSON
input is not supplied.
Scripts and JSON mode require a title through flags or input, and deletion
requires confirmation or `--yes`. Missing input and API permission/validation errors
return a nonzero exit code; API v3 failures do not trigger a v1 retry.

```sh
aha feature create --workspace AK --title 'Improve CLI' --json -s big
aha feature create --release AK-R-179 --title 'Improve CLI' -s big
aha feature create --workspace AK -t 'Improve CLI' -b 'Check the examples' -s big
aha feature list --workspace AK --search CLI --json -s big
aha feature list --filters '{"eq[status.id]":"123"}' --fields default,status --json -s big
aha feature view AK-123 --fields default,description,requirements,comments --json -s big
aha feature edit AK-123 --release AK-R-179 --owner @me -s big
aha feature edit AK-123 --status 123 --type 456 --start-date 2026-10-30 -s big
aha feature delete AK-123 --yes --json -s big
```

Creation requires a title and exactly one workspace or release. A workspace
uses its default release. Move an existing feature by selecting its new release.
Use `--title`/`-t` for the title and `--body`/`-b` for a plain-text description.
Workspace, release, team, iteration, epic, and initiative flags accept supported
IDs/references and resolve references through API v3 before submitting ID fields.
Workflow status/type and team status flags take IDs. The `@me` owner shortcut
uses `/api/v1/me` because v3 has no current-user endpoint.

For full writable payloads, pass a **record object** through `--input file.json`
or pipe it to `--input -`; omit the outer `record` envelope. JSON IDs must be
strings to avoid precision loss. Do not supply a field through both JSON and a
flag. `--body` is escaped as plain text, consistently with to-dos. Use
`--body ""` to clear it, or supply HTML in the JSON `description` field.
Use JSON `null` to clear nullable dates/associations.

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

Lists follow every cursor page. Human output is a table; `--json` returns
a bare array of records, consistently with to-dos (including `[]` for no matches).
Use `--per-page` (1–200), `--filters` with documented API v3 filter
keys/string values, and `--fields` for field selection. Choose one parent flag
(`--workspace` or `--release`). `--sort field` and optional `--descending` use API
sorting, which may cap total results. Truncation emits a warning on stderr without
changing the JSON array shape;
remove sorting to retrieve the entire collection.
Embedded collections are independently capped by API v3. Any embedded `has_more`
is preserved in JSON and warned about on stderr; a feature view does not imply
that every nested requirement or comment was returned.

## Requirements

Requirements follow the same command and output conventions as features and
to-dos. Space-separated and colon-separated syntax both work:

```sh
aha requirement create --feature AK-123 --title "Add list command" --body "Details"
aha requirement list --feature AK-123 --json
aha requirement view AK-123-1
aha requirement edit AK-123-1 --owner @me --status 123 --position 2
aha requirement edit AK-123-1 --input changes.json --json
aha requirement delete AK-123-1 --yes
```

Creates require an explicit feature ID/reference and a title. Human output prints
the new reference and URL. Select an account with `-s`/`--subdomain`. `--body`/`-b`
accepts plain text; JSON `description` preserves HTML. `--input` accepts a writable
record object from a file or `-` for stdin, without an outer `record` wrapper:

```json
{
  "description": "<p>Updated details</p>",
  "initial_estimate": 2,
  "start_date": "2026-11-04",
  "tags": [{ "id": "123", "_destroy": true }],
  "custom_fields": { "example_key": "Value" }
}
```

Supported fields include description, owner/status, integer position, dates,
estimates, team/team status, iteration, tags, and custom fields. IDs must be
strings; team fields and time codes depend on account settings. Only supplied
fields change. Tag items add/remove individual associations, leaving others
untouched. Move a requirement with `--feature`; its parent cannot be null.

Lists return bare JSON arrays or aligned `ID`, `STATE`, `TITLE` tables, follow all
cursor pages, and support `--search`, `--filters`, `--fields`, `--sort`,
`--descending`, and `--per-page`, as features do. Capped embedded collections and
truncated sorted results warn on stderr. Commands use API v3; `--owner @me` shares
the documented v1 current-user lookup exception. Scripts never prompt; deletion
requires `--yes` in JSON or noninteractive mode.

## Epics

Epics follow the same command and output conventions as features and to-dos:

```sh
aha epic create --workspace AK --title "Improve onboarding" --body "Details"
aha epic list --release AK-R-179 --json
aha epic view AK-E-1
aha epic edit AK-E-1 --release AK-R-180 --owner @me
aha epic edit AK-E-1 --input changes.json --json
aha epic delete AK-E-1 --yes
```

Create in exactly one explicit workspace or release, using an ID or reference.
`--body` accepts plain text; `--input` accepts a writable JSON record object from a
file or `-` for stdin. Structured input supports dates, estimates, progress/score
settings, teams, iterations, strategy associations, tags, watchers, and custom
fields supported by v3. IDs must be strings. Edits change only supplied fields;
collection patches preserve omitted associations. Move an epic with `--release`.

Lists support the feature filters, fields, sorting and pagination options, return
bare JSON arrays, and use aligned tables for people. Views include associated
features by default. Embedded feature collections may be capped: the CLI retains
`has_more`, warns on stderr, and shows how to retrieve the full set:

```sh
aha feature list --filters '{"eq[epic.id]":"1234567890123456789"}' --json
```

Select an account with `-s`/`--subdomain`. All epic operations use API v3; `--owner @me` shares the existing v1 current-user lookup exception. Scripts never prompt,
and deletion requires `--yes` outside interactive use.

## Releases

Use `aha release` to create, list, view, edit, and delete releases and parking lots
with API v3. Set an explicit workspace when creating a release; IDs and references
are accepted for workspaces and parent rollup releases.

```sh
aha release create --workspace DEMO --title "November launch" --release-date 2026-11-30
aha release create --workspace DEMO --title "Later" --parking-lot true
aha release list --workspace DEMO --filters '{"eq[parking_lot]":"false"}' --json
aha release view DEMO-R-1
aha release edit DEMO-R-1 --external-release-date 2026-12-01 --external-date-resolution month
aha release delete DEMO-R-1 --yes
```

Create/edit accept `--title`/`-t`, `--body`/`-b` (plain text), `--owner` (a user ID
or `@me`), `--status`, `--parent`, date flags, and `--parking-lot true|false`.
Use `--type rollup_release` on create for a rollup release. Workspace and type
are create-only. Manage feature moves with `aha feature edit --release`.

Use `--input file.json` or `--input -` for the full writable v3 record, including
HTML descriptions, `released_on`, `development_started_on`, position, progress,
duration settings, watcher patches, and custom fields. Send only desired changes;
omitted fields and associations are preserved. JSON `null` clears nullable fields.
The current v3 API cannot clear release owners or detach parents. The CLI rejects
`owner_id:null` and `parent_id:null` with an explanation; supply a user/rollup release
ID to change those associations.
The API enforces permissions and whether a release can be a parking lot or child.

Lists follow all cursor pages and support `--search`, `--filters`, `--fields`,
`--sort`, `--descending`, and `--per-page`. Human lists use tables; JSON lists are
bare arrays. Sorted or embedded truncation is reported on stderr. JSON mode never
prompts, and scripts must pass `--yes` to delete. Use `-s` to select an account.

## Release phases and milestones

Use `aha release-phase create|list|view|edit|delete` for release phases and
milestones. Create requires a release ID/reference, a title, and an explicit
`--type phase` or `--type milestone`. Single-record commands accept an ID or
reference; colon aliases such as `aha release-phase:view` also work.

```sh
aha release-phase create --release PRJ-R-1 --type phase --title "Build" --start-date 2026-12-01 --end-date 2026-12-15
aha release-phase create --release PRJ-R-1 --type milestone --title "Launch" --start-date 2026-12-15
aha release-phase list --release PRJ-R-1 --filters '{"eq[type]":"milestone"}' --json
aha release-phase view PRJ-RP-1
aha release-phase edit PRJ-RP-1 --position 2 --color '#336699' --progress-source manual --progress 25
aha release-phase edit PRJ-RP-1 --input phase-update.json --json
aha release-phase delete PRJ-RP-1 --yes
```

`--body` is plain text; `--input` accepts a writable JSON object from a file or
stdin (`-`), including HTML `description` and `custom_fields`. It also supports
`name`, `type`, `start_date`, `end_date`, `position`, `color`, `progress`,
`progress_source`, and `duration_source`. The release association (`release_id`)
can only be set on creation. Omitted fields and associations stay unchanged.
Milestones use their start date as their date; the API controls milestone date
and progress behavior. Use `--duration-source manual` for milestone dates.
When converting a milestone back to a phase, include `--progress-source manual`;
the current API can reject the automatically selected progress source.

Lists follow all cursor pages and share `--search`, `--filters`, `--sort`,
`--descending`, `--per-page`, and `--fields` with other record commands. Human
views show type, dates, release and metadata; JSON preserves API fields and HTML.
Deletion requires interactive confirmation or `--yes` in scripts.

## Iterations and sprints

Use `aha iteration create|list|view|edit|delete` for a team workspace's sprints.
Create requires `--workspace` (ID/reference) and a title. Single-record commands
accept iteration IDs/references, including the colon alias `aha iteration:view`.

```sh
aha iteration create --workspace TEAM --title "Sprint 1" --status planning --start-date 2026-12-01 --duration 14 --goal "Ship the release"
aha iteration list --workspace TEAM --filters '{"eq[status]":"planning"}' --json
aha iteration view TEAM-SP-1
aha iteration edit TEAM-SP-1 --end-date 2026-12-20 --progress 50
aha iteration edit TEAM-SP-1 --input sprint-update.json --json
aha feature edit TEAM-42 --iteration TEAM-SP-1
aha iteration delete TEAM-SP-1 --yes
```

`--body` accepts plain text. `--input` accepts a writable JSON object from a file
or stdin (`-`): `name`, `status`, `start_date`, `end_date`, `duration`, `goal`,
`progress`, and HTML `description`; `project_id` is creation-only. Use either
an end date or duration in days, since the API derives the end date from the
start and duration. Edits preserve omitted fields. The API enforces status
transitions and deletion restrictions (for example, sprints with records or
started sprints cannot be deleted).

Scheduling features/requirements uses that record's `--iteration` field. The
iteration's feature and requirement collections are read-only, not membership
mutation endpoints. List filters, field selection, cursor pagination, JSON and
human output follow the shared record conventions; deletion requires interactive
confirmation or `--yes` in scripts.

## Workspaces and teams

Use `aha workspace list` to select context for other commands. Lists include string
IDs, prefixes, types, and parents. `view` also shows workspace-line status, children,
and readable descriptions. Both actions accept `--fields` for requested metadata;
embedded children may be capped and produce a warning. Lists follow every cursor
page and share `--search`, `--filters`, `--per-page`, and sorting options.

```sh
aha workspace list --filters '{"eq[type]":"team"}' --json
aha workspace view TEAM --fields default,type,line,parent,children,custom_fields
aha workspace create --title "Client tools" --prefix CLIENT --parent PRODUCTS
aha workspace edit CLIENT --body "Shared tools for client teams"
aha workspace edit CLIENT --input workspace-update.json --json
```

Create requires a title and prefix. View/edit accept an ID or workspace prefix;
`--parent` accepts a workspace-line ID or prefix. Prefix, parent, and plain-text
body flags work on create/edit. Structured `--input` (a file or `-` for stdin)
accepts the full published v3 writable object: `name`, `reference_prefix`,
`parent_id`, HTML `description`, `custom_fields`, and `watchers`. Watchers use item
patches (`{"id":"123"}` adds, `{"id":"123","_destroy":true}` removes);
omitted watchers remain untouched. Set `parent_id` to `null` to clear the parent.
Changing hierarchy requires account permission and a valid workspace-line parent.
Edits send only requested fields; JSON preserves original API HTML.

The v3 endpoints do not expose workspace deletion or workspace type/line changes.
Those commands and writable fields are intentionally unavailable. Teams can be
listed and viewed; creation uses the API's default workspace type.

## Comments and replies

```sh
aha comment create --record CLI-12 --record-type feature --body "Ready for review"
aha comment list --record CLI-12 --record-type feature --json
aha comment create --record CLI-12 --record-type feature --reply-to 123456789 --body "Agreed"
aha comment view 123456789
aha comment edit 123456789 --input comment-update.json --json
aha comment delete 123456789 --yes
```

Create requires an owning `--record` ID/reference, its API `--record-type`, and a
plain-text `--body`/`-b`. JSON `--input` (file or `-` for stdin) accepts the writable
object directly: `{"record_id":"123","record_type":"feature","body":"<p>HTML</p>"}`.
Add `parent_id` in JSON, or `--reply-to`, for a reply to a top-level comment on the
same owning record. The owning record and reply parent are separate associations;
replies to replies and replies on another record fail with the API's error.
IDs in structured input stay strings. Reference lookup uses the owning type's
published v3 endpoint; types without one require a numeric ID. The API determines
whether a record supports comments and whether the user has access.

List follows all cursor pages and supports `--fields`, `--filters`, `--sort`, and
`--per-page`. `--search` searches comment HTML bodies. Use `--record` together with
`--record-type` to scope a list; otherwise it lists accessible comments across
supported record types. Filter by `eq[parent.id]` to select replies. Human lists
show an excerpt; view shows the readable full body, author, owning record, and
reply parent. JSON preserves the original HTML and requested metadata. Capped
embeds and truncated sorted results produce warnings on stderr.

View/edit/delete use the comment ID. Edit accepts only `body` and preserves the
record, author and reply association. Deleting a top-level comment also removes
its replies. Interactive deletion asks for confirmation; scripts and JSON mode
require `--yes`. Permission, validation and not-found errors return a nonzero exit.

## Tags

```sh
aha tag list --search "Infrastructure" --json
aha tag list --filters '{"eq[name]":"Infrastructure","eq[type]":"general"}' --fields id,name,type,color --json
aha tag create --title "Infrastructure" --type general --color '#123456'
aha tag view 123456789
aha tag edit 123456789 --color '#abcdef'
aha tag delete 123456789 --yes
```

Tag actions use string IDs. Look up a name with `list`; use `eq[name]` for an exact,
case-sensitive match and `eq[type]` to distinguish tag types. Lists follow every
cursor page and share field selection, filters, search, and sorting options.
Create requires `--title`/`-t` or `name` in structured `--input` (file or `-` for
stdin). The full writable object is `{"name":"Infrastructure","type":"general","color":"#123456"}`.
View shows name, type and color; edit sends only requested fields. Tags have no
body/description field. Type is `general` or `research`; research requires Aha!
Discovery. Although v3 accepts a type field on update, the current API rejects
changing a tag's type after creation. A tag still in use cannot be deleted.
Interactive delete confirms first; scripts/JSON require `--yes`. API validation,
permission and missing-record errors fail without changing associations.

Feature, requirement and epic commands use tag **item patches**, preserving tags
omitted from the input. Add a general tag by ID, then remove just that tag:

```sh
printf '%s' '{"tags":[{"id":"123456789"}]}' | aha feature edit CLI-12 --input - --json
printf '%s' '{"tags":[{"id":"123456789","_destroy":true}]}' | aha feature edit CLI-12 --input - --json
```

The same JSON works with `aha requirement edit CLI-12-1` and `aha epic edit CLI-E-1`.
Existing tag names can also be matched case-sensitively with `{"name":"Infrastructure"}`;
IDs take precedence if both are supplied. An empty `tags` array changes nothing.
Deleting a tag is separate from removing an association: detach it from every
record before attempting deletion. Omitted and unrelated tags remain attached.

## Goals

```sh
aha goal create --workspace CLI --title "Improve retention" --body "Keep customers" --progress-source manual --progress 25 --effort 35 --value 85
aha goal list --workspace CLI --filters '{"eq[progress_source]":"manual"}' --json
aha goal view CLI-G-1
aha goal edit CLI-G-1 --status 123456789 --time-frame 987654321 --success-metric-name "Renewals"
aha goal edit CLI-G-1 --input goal-update.json --json
aha goal delete CLI-G-1 --yes
```

Create requires an explicit workspace ID/prefix and a title. Lists can be scoped
by `--workspace` and follow every cursor page; field selection, filters, sorting
and search share the standard CLI behavior. View/edit/delete accept an ID or goal
reference. Edits preserve omitted fields and cannot move a goal to another workspace.
Use `--progress-source manual` when entering manual progress; calculated sources
use the public API names such as `from_features` and `from_key_results`.

Flags cover title, plain-text body, status/timeframe IDs, success metric name,
progress/source, integer effort/value (0–100), position and color. Structured
`--input` (file or `-` for stdin) supports all published writable fields:
`name`, `position`, `color`, `effort`, `value`, `progress`, `progress_source`,
`status_id`, `time_frame_id`, HTML `description`, `success_metric_name`, HTML
`success_metric_description`, and `custom_fields`, plus `project_id` on create.
IDs must remain strings. Status/timeframe flags take IDs; inspect existing goals
with `--fields default,status,time_frame,project` to identify their current IDs.
The API validates status workflow and timeframe access. Its status lookup requires
account-owned workflow statuses; global/default status IDs can be rejected. A
fresh `goal view` confirms saved assignments because the current create response
can contain stale association embeds. Read-only associations
such as features, rollup goals and key results cannot be written through goal input.

Human output renders goal and metric descriptions as text; JSON preserves HTML
and selected metadata. Request associations with `--fields`; capped embeds and
sorted-result truncation produce warnings. Interactive deletion confirms first;
scripts/JSON require `--yes`. API permission and validation failures return a
nonzero exit without retrying through v1.

## Initiatives

```sh
aha initiative create --workspace CLI --title "Modernize the platform" --owner @me --body "Improve delivery" --start-date 2026-12-01 --end-date 2027-03-31 --duration-source manual --progress-source manual --progress 25
aha initiative list --workspace CLI --filters '{"eq[progress_source]":"manual"}' --json
aha initiative view CLI-S-1
aha initiative edit CLI-S-1 --initial-estimate 12 --remaining-estimate 8 --work-done 4
aha initiative edit CLI-S-1 --input initiative-update.json --json
aha initiative delete CLI-S-1 --yes
```

Create requires an explicit workspace ID/prefix and title. Lists follow all cursor
pages and support workspace scope, fields, filters, search and sorting. Single-record
actions accept IDs or initiative references. Edits preserve omitted fields and
cannot change the workspace. Use public progress/duration source names and set
`manual` explicitly when entering manual values. Dates can change the API's date
calculation mode; the API applies its own estimate/score calculations.

Flags expose owner/status, dates, timeframe/time code, estimates, progress/source,
duration source, score, effort/value, position and color. JSON `--input` (file or
`-` for stdin) accepts all published writable fields: `name`, HTML `description`,
`start_date`, `end_date`, `position`, `progress_source`, `duration_source`, `progress`,
`score`, `color`, `initial_estimate`, `detailed_estimate`, `remaining_estimate`,
`work_done`, `effort`, `value`, `status_id`, `assigned_to_user_id`, `time_frame_id`,
`time_code_id`, `score_facts`, `custom_fields`, `watchers`, and create-only `project_id`.
Time codes require the account's timesheet capability; they are omitted from default
field selection. Read-only parent/goals associations cannot be written here.

Score facts use item patches, identified by `scoring_system_metric_id`: an item
with `value` sets that metric, `_destroy: true` removes it, omitted metrics remain
untouched, and an empty array changes nothing. Watchers use the same add/remove
semantics with `id`. For example:

```json
{"score_facts":[{"scoring_system_metric_id":"123456789","value":4}],"watchers":[{"id":"987654321"}]}
```

IDs must stay strings. The shared API client preserves numeric identifier tokens
as strings before parsing, including large metric IDs in score-fact responses;
estimates, scores and other values remain numbers. Body HTML is preserved in JSON
and rendered readably for humans. Capped embeds and sorted truncation warn on stderr.
Use `assigned_to_user_id: null` in JSON input to clear the owner.
Owner `@me` reuses the existing `/api/v1/me` current-user lookup because v3 exposes
users only by ID; record operations use v3. Workflow status/timeframe IDs must be
accessible to the account; inspect current records or workspace configuration.
Delete confirms interactively or requires `--yes` in scripts/JSON mode.

## Key results

```sh
aha key-result create --goal CLI-G-1 --title "Improve renewal" --owner @me --starting-metric "50%" --current-metric "65%" --target-metric "80%" --progress 50
aha key-result list --goal CLI-G-1 --json
aha key-result list --workspace CLI --filters '{"eq[status.id]":"123"}' --json
aha key-result view CLI-G-1-KR-1
aha key-result edit CLI-G-1-KR-1 --current-metric "70%" --progress 67
aha key-result edit CLI-G-1-KR-1 --input key-result-update.json --json
aha key-result delete CLI-G-1-KR-1 --yes
```

Key results require an Enterprise+ plan or the account's enabled key-result
capability, plus permission to access the goal. API denials fail with the original
error and capability/permission context; they do not retry through v1.

Create requires an explicit goal ID/reference and title. The goal determines the
workspace; it cannot be changed on edit. Starting/current/target metrics are text
(such as `"80%"`), while progress is a separate number: changing metric text does
not calculate progress. Position is an integer. Status uses a workflow status ID;
owner accepts a user ID or `@me`. JSON `assigned_to_user_id: null` clears the owner.
`@me` reuses the existing v1 current-user lookup because v3 exposes users only by
ID; all record operations use v3.

JSON `--input` accepts a writable object from a file or stdin (`-`): `name`, HTML
`description`, `position`, `progress`, `starting_metric`, `current_metric`,
`target_metric`, `status_id`, `assigned_to_user_id`, `custom_fields`, `watchers`, and
create-only `goal_id`. Edits send only supplied fields. Watcher items add by string
`id`, remove with `_destroy: true`, preserve omitted watchers, and leave everything
unchanged for an empty array. Read-only associations and progress-source changes
are not writable through this API.

List across the account or choose one parent scope: goal or workspace. Lists follow
cursor pages and support fields, filters, search, and sorting. Capped embeds and
sorted truncation warn on stderr. Human views show the goal, metrics, owner,
status, progress and readable description; JSON retains HTML and string IDs.
Delete confirms interactively or requires `--yes` in scripts/JSON mode.

## Personas

```sh
aha persona create --workspace CLI --title "Product leader" --occupation "Product manager" --quote "Help me prioritize" --color '#123456'
aha persona list --workspace CLI --filters '{"eq[occupation]":"Product manager"}' --json
aha persona view CLI-P-1
aha persona edit CLI-P-1 --quote "Show me the customer impact"
aha persona edit CLI-P-1 --input persona-update.json --json
aha persona delete CLI-P-1 --yes
```

Create requires an explicit workspace ID/prefix and title. Single-record actions
accept IDs or persona references. Workspace assignment is create-only. Occupation
and quote are plain text; an empty string clears either. Colors use six-digit hex
strings (including `#000000`); malformed colors fail before API access rather than
being silently ignored by the API.

JSON `--input` accepts a writable object from a file or stdin (`-`): `name`,
`occupation`, `quote`, `color`, `watchers`, `custom_fields`, and create-only
`project_id`. Edits send only supplied changes. Watcher items add by string `id`,
remove with `_destroy: true`, preserve omitted watchers, and an empty array changes
nothing. Use configured custom-field keys for supported structured persona data.
There is no top-level description/body, image upload, or document editing field in
this API; these commands do not expose `--body` or those writes.

Lists follow all cursor pages with workspace scope, fields, filters, search, and
sorting. Human views show workspace, occupation, quote, and color; JSON retains
selected API fields. Capped embedded collections and sorted truncation warn on
stderr. Delete confirms interactively or requires `--yes` in scripts/JSON mode.
Record operations use v3; permission/validation failures never retry through v1.

## Competitors

```sh
aha competitor create --workspace CLI --title "Acme" --subtitle "Alternative platform" --website 'https://acme.example.com' --color '#123456'
aha competitor list --workspace CLI --filters '{"eq[subtitle]":"Alternative platform"}' --json
aha competitor view CLI-C-1
aha competitor edit CLI-C-1 --website 'https://acme.example.com/products'
aha competitor edit CLI-C-1 --input competitor-update.json --json
aha competitor delete CLI-C-1 --yes
```

Create requires an explicit workspace ID/prefix and title. Single-record actions
accept IDs or competitor references. Workspace assignment is create-only. Subtitle
and website are text; an empty string clears either. Website uses the API's
`website` field, distinct from the Aha record's `html_url` and API `url`. Hostnames
without a scheme are accepted by the API. Colors use six-digit hex strings,
including `#000000`; malformed colors fail before access instead of being silently
ignored by the API.

JSON `--input` accepts a writable object from a file or stdin (`-`): `name`,
`subtitle`, `website`, `color`, `custom_fields`, and create-only `project_id`.
Edits send only supplied changes. Use configured custom-field keys for supported
structured competitor data. Watchers, top-level description/body, image upload,
and document editing are not writable in this payload; `--body` is not exposed.

Lists follow cursor pages with workspace scope, fields, filters, search, and
sorting. Human views show workspace, subtitle, company website, color, and the Aha
record URL; JSON retains selected API fields. Capped embeds and sorted truncation
warn on stderr. Delete confirms interactively or requires `--yes` in scripts/JSON.
Record operations use v3; API failures never retry through v1.

## Idea endorsements (read-only)

```sh
aha idea-endorsement list --search 'Onboarding' --json
aha idea-endorsement list --filters '{"eq[idea.id]":"123","gte[weight]":"2"}' --sort value --descending --json
aha idea-endorsement list --filters '{"eq[idea_organization.id]":"456","contains[contributor.email]":"example.com"}' --json
aha idea-endorsement view 789
aha idea-endorsement view 789 --fields 'default,description,weight,value,idea,idea_organization,contributor,custom_fields,created_at,updated_at' --json
```

Inspect existing support for ideas using the published GET-only API v3 endpoints.
Endorsements have numeric IDs, not reference numbers. Linked ideas and organizations
retain their own references. Human lists show the linked idea title, weight, value,
contributor and organization; views also render descriptions as readable text.
Weight and value remain separate values, including zero; no currency or total vote
count is inferred from them. The current API formats value as an integer, so
fractional stored values are not returned. Missing optional associations are handled without
inventing a linked record.

`--search` filters linked idea titles through `idea.name`. Other supported filters
include endorsement ID, weight/value, timestamps, and available nested idea,
organization and contributor fields. `--fields` selects metadata, custom fields
and associations; `--json` preserves their original representation and HTML.
Lists use the shared cursor pagination, sort/filter options and truncation warnings.
Account and linked-record permissions apply. This command cannot cast votes,
create/delete endorsements, or change their weight, value, or relationships.

## Idea organizations (read-only)

```sh
aha idea-organization list --search 'Acme' --json
aha idea-organization list --filters '{"gte[revenue]":"100000"}' --sort revenue --descending --json
aha idea-organization view ACCOUNT-O-1
aha idea-organization view ACCOUNT-O-1 --fields 'default,description,creator,revenue,email_domains,custom_fields,created_at,updated_at' --json
```

List and view idea organizations through the published GET-only API v3 endpoints.
Single-record lookups accept an organization reference or numeric ID. Human views
show readable descriptions, revenue (including zero and decimals), email domains,
and the creator when present. JSON preserves the selected fields and original
HTML, including custom fields and available associations. The API currently
exposes the description and creator associations; portal membership/contact lists
and relationship mutations are not available on this endpoint.

Lists share `--search` (name), `--filters`, `--fields`, `--sort`, `--descending`,
`--per-page`, account selection, and `--json`. They follow cursor pages and warn
about capped embeds or sorted-result truncation. Supported filters include ID,
reference number, name, revenue, timestamps, and empty/nonempty associations;
email-domain filtering/sorting is not supported by this API. Organization access
is scoped to the selected account and its API permissions. No organization
creation, edits, deletion, or relationship changes are exposed.

## Idea portals and users (read-only)

```sh
aha idea-portal list --search "Customer" --json
aha idea-portal view 123 --fields 'default,external_url,access,enabled,projects'
aha idea-user list --search 'customer@example.com' --json
aha idea-user list --filters '{"contains[first_name]":"Alex"}' --json
aha idea-user view 456 --fields 'default,portal_users,custom_fields' --json
aha portal-user list --filters '{"eq[idea_portal.id]":"123","eq[idea_user.id]":"456"}' --json
aha portal-user view 789
```

These are three distinct API v3 resources: an idea portal, an idea user (a person),
and a portal user (that person's membership in one portal). Single-record lookups
require numeric IDs; these resources have no reference numbers. Membership views
show the linked portal and idea-user IDs, permissions, enabled/verified status and
subscription settings. Portal views distinguish the customer-facing portal URL
from its Aha settings URL and API URL.

All three families support `list`, `view`, `--fields`, `--filters`, `--sort`,
`--descending`, `--per-page`, `--json`, and account selection. Lists follow all
cursor pages, return bare JSON arrays, and warn on truncated results or capped
embedded collections. Collection counts in human views say how many are shown,
not the total. Use `portal-user list` with `eq[idea_user.id]` to retrieve memberships
beyond a capped idea-user embed. Portals and memberships are restricted to portals
in workspaces accessible to the selected account user.

`idea-portal list --search` filters portal names. `idea-user list --search` filters email
addresses; use `contains[first_name]` / `contains[last_name]` filters for names.
The API cannot directly filter or sort portal memberships by their associated
person's name or email, so `portal-user list` has no `--search`. Look up an idea
user first, then filter memberships by `eq[idea_user.id]`. Other supported filters
include portal `eq[access]` / `eq[enabled]`, and membership `eq[permission]`,
`eq[enabled]`, `eq[verified]` and `eq[unsubscribed]`. Unsupported API filters or
sort fields return the API's error.

The published endpoints are GET-only. No invitations, access changes, creation,
edits, or deletion are exposed. Requested JSON fields and embedded `has_more`
markers are preserved, including custom fields. Account/API permissions still apply.

## Ideas (read-only)

```sh
aha idea list --workspace CLI --search "onboarding" --json
aha idea list --filters '{"eq[status.id]":"123","eq[visibility]":"public"}' --sort score --descending --json
aha idea view CLI-I-1
aha idea view CLI-I-1 --fields 'default,description,status,project,assigned_to_user,submitted_idea_portal,contributor,score_facts,portal_comments,custom_fields' --json
```

The published v3 idea endpoints are GET-only. These commands list/filter and view
ideas; they expose no creation, edits, deletion, promotion, or voting. Idea writes
are deferred until API support exists, with no fallback to v1.

Single-record views accept an idea ID or reference. Lists follow all cursor pages
and support field selection, search, filters, and sorting. `--workspace` accepts a
workspace ID/prefix and resolves it to `filter.eq[project.id]`; the idea endpoint
has no `project_id` parent parameter. Use that filter directly in `--filters`
instead if preferred, and do not supply the same scope in both places. Other
associated filters can select status, owner, submitted portal, or contributor as
supported by the API.

Human views show requested idea metadata, owner, submitted portal, contributor,
score/endorsement count, spam/visibility, readable description, score facts, and
the Aha record link. Internal and portal comment counts are labeled separately
as the number shown. `--json` preserves the selected fields and original HTML,
including custom fields and embedded metadata. Embedded comments, score facts,
watchers, and status history can be capped; `has_more` markers are retained and
incomplete collections warn on stderr. No embedded collection is silently fetched
as complete. Sorted-result truncation also warns; omit sorting to retrieve all
matching ideas. Permission, field/filter, and not-found errors return a nonzero
exit without a legacy retry.

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
