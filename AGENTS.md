# Mite CLI — Agent Instructions

## Overview

Read-only CLI for querying mite.de time tracking data. Designed for LLM agent consumption with strict privacy enforcement.

## Privacy Rules

- **Never expand abbreviations** — output uses short codes (e.g., "HB", "ACME", "SS") instead of real names
- **Never look up real names** — do not attempt to resolve abbreviations to full names
- **No financial data** — revenue, hourly rates, and budgets are stripped from all output
- Unmapped entities appear as `User#123`, `Customer#456`, `Project#789`
- `--dangerously-skip-alias` on `users`, `customers`, `projects`, `entries`, `summary` shows real names instead of abbreviations; financial data remains hidden regardless

## Available Commands

| Command                                                                                                                       | Purpose                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `mite init --api-key <key> --account <sub>`                                                                                   | Save credentials, validate connection           |
| `mite config show`                                                                                                            | Print config (API key masked)                   |
| `mite config set-user <id> <abbr>`                                                                                            | Map user ID → abbreviation                      |
| `mite config set-customer <id> <abbr>`                                                                                        | Map customer ID → abbreviation                  |
| `mite config set-project <id> <abbr>`                                                                                         | Map project ID → abbreviation                   |
| `mite config remove-user <id>`                                                                                                | Remove user mapping                             |
| `mite config remove-customer <id>`                                                                                            | Remove customer mapping                         |
| `mite config remove-project <id>`                                                                                             | Remove project mapping                          |
| `mite team list`                                                                                                              | List all teams and members                      |
| `mite team create <name> [userIds...]`                                                                                        | Create a team with optional initial members     |
| `mite team delete <name>`                                                                                                     | Delete a team                                   |
| `mite team add <name> <userIds...>`                                                                                           | Add members to a team                           |
| `mite team remove <name> <userId>`                                                                                            | Remove a member from a team                     |
| `mite users [--dangerously-skip-alias]`                                                                                       | List users (ID, Name, Role)                     |
| `mite customers [--dangerously-skip-alias]`                                                                                   | List customers (ID, Name)                       |
| `mite projects [--customer <id>] [--dangerously-skip-alias]`                                                                  | List projects (ID, Name, Customer)              |
| `mite services`                                                                                                               | List services (ID, Name)                        |
| `mite summary [--at <period>] [--user <ids\|names>] [--team <name>] [--group-by <fields>] [--dangerously-skip-alias]`         | Grouped summary (default: user,project,service) |
| `mite entries (--user <id\|name> \| --team <name>) [--at <period>] [--note <text>] [--empty-note] [--dangerously-skip-alias]` | Time entries for a user or team                 |

### Teams

Teams are named groups of user IDs stored in config (`~/.mite-cli/config.json` under `teams`). They let you run `summary` and `entries` for multiple users at once via `--team <name>` instead of listing comma-separated IDs. `--team` and `--user` are mutually exclusive. When `--team` is used with `entries`, the output includes a User column.

## Time Periods

`--at` accepts: `today`, `yesterday`, `this_week`, `last_week`, `this_month`, `last_month`, or `YYYY-MM-DD`.
Alternative: `--from <date> --to <date>` for custom ranges.
Default: `this_week`.

## Output Format

All output is plain text markdown tables, optimized for LLM parsing.

## Project Structure

```
src/
  index.ts              — Entry point
  constants.ts          — Shared constants
  api/client.ts         — HTTP client (GET-only, native fetch)
  api/types.ts          — Raw API response types
  cli/commands/*.ts     — CLI command implementations
  cli/output.ts         — Markdown table formatters
  config/index.ts       — Config singleton (~/.mite-cli/config.json)
  config/types.ts       — Config schema
  privacy/index.ts      — Sanitization layer
  utils/errors.ts       — Error hierarchy
  utils/time.ts         — Time conversion helpers
```

## Tech Stack

TypeScript + ESM, Commander.js, conf, tsup, vitest, native fetch.

## Commands

- `npm run build` — bundle with tsup (src/index.ts → dist/index.js, ESM)
- `npm test` — run all tests in watch mode (run after every refactoring or code change)
- `npm run test:run` — single-pass test run (CI)
- **Always run `npm run build` after larger refactorings or adjustments** so the user can test immediately
- `npx vitest run src/api/client.test.ts` — run a single test file
- `npm run dev` — run from source via ts-node
- `npm run format` — format all files with Prettier (run before completing any task)

## Code Quality

- Write small, focused functions that do one thing (Single Responsibility)
- Name functions and variables to reveal intent — avoid abbreviations and generic names
- Keep functions short; extract when a block needs a comment to explain _what_ it does
- No dead code, no commented-out code — delete it (git has history)
- Avoid magic numbers/strings — use named constants
- Prefer early returns over deeply nested conditionals
- Keep function arguments to 3 or fewer; group related args into an object
- Don't repeat yourself — but only extract shared logic when duplication is real, not speculative
- Shared type definitions (exported for use by other modules) must live in a dedicated type file (e.g., `foo.types.ts`); do not mix exported types with function implementations
- A single type file may contain multiple related types
- Private types (used only within the file) are fine to keep inline but must be placed at the top of the file, right after import statements — before any variable declarations, constants, or function definitions

## Planning

When creating implementation plans, always structure phases using a TDD approach: each phase should define RED (failing tests first), then GREEN (minimal implementation to pass).

## TDD Workflow

Follow Red-Green-Refactor for all code changes:

1. **Red** — Write a failing test that defines the expected behavior
2. **Green** — Write the minimum code to make the test pass
3. **Refactor** — Clean up while keeping tests green

Rules:

- Never write production code without a failing test first
- Run `npm test` after every change — never leave tests red
- One logical assertion per test; test names describe the behavior, not the implementation
- When fixing a bug, first write a test that reproduces it, then fix

## Testing

- Tests use Vitest with ESM imports and `globals: true` (no need to import `describe`/`it`/`expect`)
- Test files live next to source files with a `.test.ts` suffix
- System dependencies (fetch) are mocked via `vi.mock()` / `vi.fn()`

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages
- Format: `<type>(<optional scope>): <description>` (e.g., `feat: add PDF support`, `fix(mailer): handle timeout`)
- Common types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `perf`, `ci`, `build`

## Formatting

- Prettier is configured via `.prettierrc` (printWidth: 100, singleQuote, trailingComma: all)
- All `.ts` files must be formatted with Prettier

## Contribution Guidelines

- **Keep docs in sync**: Any substantial change (new command, new option, new config field, changed behavior) must be reflected in both `README.md` and `AGENTS.md`. If you add a feature, update the command table in AGENTS.md and the usage examples in README.md.
