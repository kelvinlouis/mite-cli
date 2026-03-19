import { Command } from 'commander';
import { createAuthenticatedClient, addDangerouslySkipAliasOption } from './shared.js';
import { sanitizeTimeEntryGroup } from '../../privacy/index.js';
import type { SanitizeOptions } from '../../privacy/index.js';
import { formatSummaryTable } from '../output.js';
import { handleError, ValidationError } from '../../utils/errors.js';
import { config } from '../../config/index.js';
import { DEFAULT_PERIOD, DEFAULT_GROUP_BY, VALID_GROUP_FIELDS } from '../../constants.js';
import { resolveUserIds } from '../resolve-users.js';
import type { GroupField } from '../../constants.js';

interface SummaryOptions {
  at?: string;
  from?: string;
  to?: string;
  user?: string;
  team?: string;
  groupBy?: string;
  dangerouslySkipAlias?: boolean;
}

function parseGroupFields(input: string): GroupField[] {
  const fields = input.split(',').map((f) => f.trim());
  const invalid = fields.filter((f) => !(VALID_GROUP_FIELDS as readonly string[]).includes(f));
  if (invalid.length > 0) {
    throw new ValidationError(
      `Invalid group-by field(s): ${invalid.join(', ')}. Valid fields: ${VALID_GROUP_FIELDS.join(', ')}`,
    );
  }
  return fields as GroupField[];
}

async function summaryAction(options: SummaryOptions): Promise<void> {
  if (options.team && options.user) {
    throw new ValidationError('--team and --user are mutually exclusive.');
  }

  const groupByInput = options.groupBy || DEFAULT_GROUP_BY;
  const groupFields = parseGroupFields(groupByInput);

  const client = createAuthenticatedClient();

  const params: Record<string, string | undefined> = {
    group_by: groupByInput,
  };

  if (options.from && options.to) {
    params.from = options.from;
    params.to = options.to;
  } else {
    params.at = options.at || DEFAULT_PERIOD;
  }

  if (options.team) {
    const teamMembers = config.getTeam(options.team);
    if (!teamMembers) {
      throw new ValidationError(`Team "${options.team}" does not exist.`);
    }
    params.user_id = teamMembers.join(',');
  } else if (options.user) {
    params.user_id = await resolveUserIds(client, options.user);
  }

  const groups = await client.getTimeEntryGroups({
    group_by: params.group_by!,
    at: params.at,
    from: params.from,
    to: params.to,
    user_id: params.user_id,
  });

  const sanitizeOptions: SanitizeOptions | undefined = options.dangerouslySkipAlias
    ? { useRealNames: true }
    : undefined;
  const sanitized = groups.map((g) => sanitizeTimeEntryGroup(g, sanitizeOptions));
  console.log(formatSummaryTable(sanitized, groupFields));
}

export function createSummaryCommand(): Command {
  const cmd = new Command('summary')
    .description('Weekly summary grouped by user, project, and service')
    .option(
      '--at <period>',
      'Time period (today, yesterday, this_week, last_week, this_month, last_month, or YYYY-MM-DD)',
    )
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .option('--user <ids>', 'Comma-separated user IDs or names')
    .option('--team <name>', 'Team name (resolves to member user IDs)')
    .option('--group-by <fields>', 'Comma-separated group fields', DEFAULT_GROUP_BY)
    .action(async (options: SummaryOptions) => {
      try {
        await summaryAction(options);
      } catch (error) {
        handleError(error);
      }
    });
  return addDangerouslySkipAliasOption(cmd);
}
