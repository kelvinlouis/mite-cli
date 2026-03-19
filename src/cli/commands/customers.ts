import { Command } from 'commander';
import { createAuthenticatedClient, addDangerouslySkipAliasOption } from './shared.js';
import { sanitizeCustomer } from '../../privacy/index.js';
import type { SanitizeOptions } from '../../privacy/index.js';
import { formatCustomersTable } from '../output.js';
import { handleError } from '../../utils/errors.js';

interface CustomersOptions {
  dangerouslySkipAlias?: boolean;
}

async function customersAction(options: CustomersOptions): Promise<void> {
  const client = createAuthenticatedClient();
  const sanitizeOptions: SanitizeOptions | undefined = options.dangerouslySkipAlias
    ? { useRealNames: true }
    : undefined;
  const customers = await client.getCustomers();
  const sanitized = customers.map((c) => sanitizeCustomer(c, sanitizeOptions));
  console.log(formatCustomersTable(sanitized));
}

export function createCustomersCommand(): Command {
  const cmd = new Command('customers')
    .description('List all customers')
    .action(async (options: CustomersOptions) => {
      try {
        await customersAction(options);
      } catch (error) {
        handleError(error);
      }
    });
  return addDangerouslySkipAliasOption(cmd);
}
