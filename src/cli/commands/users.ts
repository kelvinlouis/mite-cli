import { Command } from 'commander';
import { createAuthenticatedClient, addDangerouslySkipAliasOption } from './shared.js';
import { sanitizeUser } from '../../privacy/index.js';
import type { SanitizeOptions } from '../../privacy/index.js';
import { formatUsersTable } from '../output.js';
import { handleError } from '../../utils/errors.js';

interface UsersOptions {
  dangerouslySkipAlias?: boolean;
}

async function usersAction(options: UsersOptions): Promise<void> {
  const client = createAuthenticatedClient();
  const sanitizeOptions: SanitizeOptions | undefined = options.dangerouslySkipAlias
    ? { useRealNames: true }
    : undefined;
  const users = await client.getUsers();
  const sanitized = users.map((u) => sanitizeUser(u, sanitizeOptions));
  console.log(formatUsersTable(sanitized));
}

export function createUsersCommand(): Command {
  const cmd = new Command('users')
    .description('List all users')
    .action(async (options: UsersOptions) => {
      try {
        await usersAction(options);
      } catch (error) {
        handleError(error);
      }
    });
  return addDangerouslySkipAliasOption(cmd);
}
