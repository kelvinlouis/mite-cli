import { Command } from 'commander';
import { createAuthenticatedClient } from './shared.js';
import { formatServicesTable } from '../output.js';
import { handleError } from '../../utils/errors.js';

async function servicesAction(): Promise<void> {
  const client = createAuthenticatedClient();
  const services = await client.getServices();
  console.log(formatServicesTable(services));
}

export function createServicesCommand(): Command {
  return new Command('services').description('List all services').action(async () => {
    try {
      await servicesAction();
    } catch (error) {
      handleError(error);
    }
  });
}
