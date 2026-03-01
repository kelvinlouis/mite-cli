import { Command } from 'commander';
import { createAuthenticatedClient } from './shared.js';
import { sanitizeUser } from '../../privacy/index.js';
import { formatUsersTable } from '../output.js';
import { handleError } from '../../utils/errors.js';

async function usersAction(): Promise<void> {
  const client = createAuthenticatedClient();
  const users = await client.getUsers();
  const sanitized = users.map(sanitizeUser);
  console.log(formatUsersTable(sanitized));
}

export function createUsersCommand(): Command {
  return new Command('users').description('List all users').action(async () => {
    try {
      await usersAction();
    } catch (error) {
      handleError(error);
    }
  });
}
