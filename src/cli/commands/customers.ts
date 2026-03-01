import { Command } from 'commander';
import { createAuthenticatedClient } from './shared.js';
import { sanitizeCustomer } from '../../privacy/index.js';
import { formatCustomersTable } from '../output.js';
import { handleError } from '../../utils/errors.js';

async function customersAction(): Promise<void> {
  const client = createAuthenticatedClient();
  const customers = await client.getCustomers();
  const sanitized = customers.map(sanitizeCustomer);
  console.log(formatCustomersTable(sanitized));
}

export function createCustomersCommand(): Command {
  return new Command('customers').description('List all customers').action(async () => {
    try {
      await customersAction();
    } catch (error) {
      handleError(error);
    }
  });
}
