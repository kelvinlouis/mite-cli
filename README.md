# mite-cli

Read-only CLI for querying [mite.de](https://mite.de) time tracking data, designed for LLM agent consumption.

## Features

- Privacy-first: real names replaced with configurable abbreviations
- No financial data leaked (revenue, rates, budgets stripped)
- Plain markdown table output for easy LLM parsing
- Two key workflows: team weekly summaries and per-user time entries

## Setup

```bash
npm install
npm run build
npm link   # symlinks the package globally — exposes the `mite` command for local dev and makes it callable by agents
```

## Configuration

```bash
# Initialize with your mite credentials
mite init --api-key <your-api-key> --account <subdomain>

# Map entities to abbreviations
mite config set-user 219528 xyz
mite config set-customer 179138 XYZ
mite config set-project 88309 XYZ_abc
```

## Teams

Define named teams of user IDs so you can run summaries and entries for your whole team without specifying IDs each time.

```bash
# Create a team with initial members
mite team create frontend 219528 219529 219530

# Manage members
mite team add frontend 219531
mite team remove frontend 219530

# List all teams
mite team list

# Delete a team
mite team delete frontend
```

## Usage

```bash
# List entities
mite users
mite customers
mite projects
mite services

# Weekly summary (defaults to this_week)
mite summary
mite summary --at last_week
mite summary --at last_week --user 219528
mite summary --team frontend
mite summary --group-by customer,project

# Time entries for a user or team
mite entries --user 219528
mite entries --user 219528 --at last_week
mite entries --user 219528 --from 2024-01-01 --to 2024-01-31
mite entries --team frontend
mite entries --team frontend --at last_week
```

> `--team` and `--user` are mutually exclusive on both `summary` and `entries`.

## Development

```bash
npm test          # Run tests (watch mode)
npm run test:run  # Run tests once
npm run build     # Build to dist/
npm run format    # Format with prettier
```
