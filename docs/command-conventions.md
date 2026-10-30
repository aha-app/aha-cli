# Record command conventions

Use these patterns when adding or changing record command families. To-dos and
features are the working examples; resource-specific fields and actions can differ.

## Commands and files

- Use `aha <singular-resource> <action>`, with the existing colon aliases supported.
- Use `create`, `list`, `view`, `edit`, and `delete` where the API supports them.
  Put each action in `src/commands/<resource>/<action>.ts`, exporting one default
  command class. Register it explicitly in `src/cli.ts`.
- Keep action orchestration in the command file and reusable resource logic in
  `src/lib/<resource>-api.ts` or a focused helper. Share behavior that is actually
  common through `record-input.ts`, `record-output.ts`, and `current-user.ts`.
- Accept a positional ID/reference for single-record actions. Use `--title`/`-t`
  and `--body`/`-b` for titles and plain-text descriptions. Escape plain text to
  HTML before submitting it; render descriptions as readable text for humans.
  JSON input/output preserves the API's original HTML.

## Output contracts

| Action | `--json` stdout | Human stdout |
| --- | --- | --- |
| List | Bare array of API records, including `[]` | Aligned table, or an empty-list message |
| View | One API record | Readable record details and description |
| Create/edit/state change | One API record | Confirmation plus URL, or ID when no URL exists |
| Delete | `{ "id": "...", "deleted": true }` | Deletion confirmation |

Use `printTable` so list columns align and embedded newlines cannot split rows.
Include `ID`, `STATE`, and `TITLE`; insert resource-specific columns such as `DUE`
where useful. Keep warnings/errors on stderr, including warnings about capped
embedded collections or truncated sorted results. JSON stdout must remain valid
JSON with the same shape across command families. Do not add a list envelope to
expose pagination metadata in only one command family.

Follow all cursor pages by default. Refuse missing/repeated cursors when the API
claims more pages, and do not print a partial list as successful complete output.
If sorting limits the collection, warn explicitly and explain how to retrieve the
full result. Preserve embedded collection `has_more` markers in returned records.

## Input and scripting

- Support `-s`/`--subdomain` and `--json`. Scripts/JSON mode must never prompt.
  Require an explicit account when several are saved in noninteractive mode.
- Interactive creates may prompt for a missing title through `promptForTitle`.
  Resource parents and other required context must still be explicit. JSON input
  is intentional structured input, so missing required fields are errors.
- Require interactive confirmation for deletion, or `--yes` in scripts/JSON mode.
- Where `--input` is supported, accept a writable record object from a file or
  `-` for stdin, without an outer `record` envelope. Reject conflicting flag/JSON
  values. Preserve IDs as strings. Send only requested changes; collections use
  the API's item patch semantics and leave omitted associations untouched.
- Prefer API v3. Use v1 only for a verified missing v3 capability, documented at
  the call site. Resolve supported references before submitting fields requiring
  numeric IDs. API permission/validation errors must fail with actionable messages;
  a v3 failure does not justify an automatic v1 retry.

## Verification

Test the shared public contracts across families as well as resource behavior:
JSON shapes, tables, plain text/HTML handling, scripting, pagination/truncation,
partial updates, validation and deletion confirmation. Run the full tests/lint
suite and both TypeScript and Bun builds. Exercise changed commands against the
local Aha instance through TypeScript source, the Node package entrypoint and
the compiled Bun binary, using disposable local fixtures.
