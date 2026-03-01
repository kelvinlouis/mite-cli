import { Command } from 'commander';
import { createAuthenticatedClient } from './shared.js';
import { sanitizeTimeEntry } from '../../privacy/index.js';
import { formatEntriesTable, formatTeamEntriesTable } from '../output.js';
import { handleError, EXIT_CODES } from '../../utils/errors.js';
import { config } from '../../config/index.js';
import { DEFAULT_PERIOD } from '../../constants.js';

interface EntriesOptions {
  user?: string;
  team?: string;
  at?: string;
  from?: string;
  to?: string;
}

async function entriesAction(options: EntriesOptions): Promise<void> {
  if (options.team && options.user) {
    console.error('Error: --team and --user are mutually exclusive.');
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }

  if (!options.team && !options.user) {
    console.error('Error: either --user or --team must be provided.');
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }

  const client = createAuthenticatedClient();

  let userIds: string | undefined;
  let isTeamQuery = false;

  if (options.team) {
    const teamMembers = config.getTeam(options.team);
    if (!teamMembers) {
      console.error(`Error: Team "${options.team}" does not exist.`);
      process.exit(EXIT_CODES.GENERAL_ERROR);
      return;
    }
    userIds = teamMembers.join(',');
    isTeamQuery = true;
  } else {
    userIds = options.user;
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
  });

  const sanitized = entries.map(sanitizeTimeEntry);
  console.log(isTeamQuery ? formatTeamEntriesTable(sanitized) : formatEntriesTable(sanitized));
}

export function createEntriesCommand(): Command {
  return new Command('entries')
    .description('List time entries for a user or team')
    .option('--user <id>', 'User ID')
    .option('--team <name>', 'Team name (resolves to member user IDs)')
    .option(
      '--at <period>',
      'Time period (today, yesterday, this_week, last_week, this_month, last_month, or YYYY-MM-DD)',
    )
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .action(async (options: EntriesOptions) => {
      try {
        await entriesAction(options);
      } catch (error) {
        handleError(error);
      }
    });
}
