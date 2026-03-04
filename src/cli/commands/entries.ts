import { Command } from 'commander';
import { createAuthenticatedClient } from './shared.js';
import { sanitizeTimeEntry } from '../../privacy/index.js';
import { formatEntriesTable, formatTeamEntriesTable } from '../output.js';
import { handleError, ValidationError } from '../../utils/errors.js';
import { config } from '../../config/index.js';
import { DEFAULT_PERIOD } from '../../constants.js';
import { resolveUserIds } from '../resolve-users.js';

interface EntriesOptions {
  user?: string;
  team?: string;
  at?: string;
  from?: string;
  to?: string;
  note?: string;
  emptyNote?: boolean;
}

async function entriesAction(options: EntriesOptions): Promise<void> {
  if (options.team && options.user) {
    throw new ValidationError('--team and --user are mutually exclusive.');
  }

  if (!options.team && !options.user) {
    throw new ValidationError('either --user or --team must be provided.');
  }

  const client = createAuthenticatedClient();

  let userIds: string | undefined;
  let isTeamQuery = false;

  if (options.team) {
    const teamMembers = config.getTeam(options.team);
    if (!teamMembers) {
      throw new ValidationError(`Team "${options.team}" does not exist.`);
    }
    userIds = teamMembers.join(',');
    isTeamQuery = true;
  } else {
    userIds = await resolveUserIds(client, options.user!);
  }

  const params: Record<string, string | undefined> = {
    user_id: userIds,
  };

  if (options.from && options.to) {
    params.from = options.from;
    params.to = options.to;
  } else {
    params.at = options.at || DEFAULT_PERIOD;
  }

  const entries = await client.getTimeEntries({
    user_id: params.user_id,
    at: params.at,
    from: params.from,
    to: params.to,
    note: options.note,
  });

  const filtered = options.emptyNote ? entries.filter((e) => e.note === '') : entries;
  const sanitized = filtered.map(sanitizeTimeEntry);
  console.log(isTeamQuery ? formatTeamEntriesTable(sanitized) : formatEntriesTable(sanitized));
}

export function createEntriesCommand(): Command {
  return new Command('entries')
    .description('List time entries for a user or team')
    .option('--user <id>', 'User ID or name')
    .option('--team <name>', 'Team name (resolves to member user IDs)')
    .option(
      '--at <period>',
      'Time period (today, yesterday, this_week, last_week, this_month, last_month, or YYYY-MM-DD)',
    )
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .option('--note <text>', 'Filter entries by note text')
    .option('--empty-note', 'Show only entries with empty notes')
    .action(async (options: EntriesOptions) => {
      try {
        await entriesAction(options);
      } catch (error) {
        handleError(error);
      }
    });
}
