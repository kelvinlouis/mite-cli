import { Command } from 'commander';
import { MiteClient } from '../../api/client.js';
import { config } from '../../config/index.js';
import { handleError } from '../../utils/errors.js';
import type { MiteUser, MiteCustomer, MiteProject } from '../../api/types.js';

interface InitOptions {
  apiKey: string;
  account: string;
}

async function validateAndSaveCredentials(client: MiteClient, options: InitOptions): Promise<void> {
  const accountInfo = await client.getAccount();
  console.log(`Connected to account: ${accountInfo.account.title || accountInfo.account.name}`);
  config.setApiKey(options.apiKey);
  config.setAccount(options.account);
}

function printEntityList(label: string, entities: MiteUser[] | MiteCustomer[] | MiteProject[]) {
  console.log(`\n${label}:`);
  for (const entity of entities) {
    const detail =
      'role' in entity
        ? `${entity.name} (${entity.role})`
        : 'customer_name' in entity
          ? `${entity.name} (${entity.customer_name})`
          : entity.name;
    console.log(`  ${entity.id}: ${detail}`);
  }
}

async function initAction(options: InitOptions): Promise<void> {
  const client = new MiteClient(options.account, options.apiKey);

  await validateAndSaveCredentials(client, options);

  const [users, customers, projects] = await Promise.all([
    client.getUsers(),
    client.getCustomers(),
    client.getProjects(),
  ]);

  printEntityList('Users', users);
  printEntityList('Customers', customers);
  printEntityList('Projects', projects);

  console.log(
    '\nConfiguration saved. Use `mite config set-user/set-customer/set-project` to map IDs to abbreviations.',
  );
}

export function createInitCommand(): Command {
  const command = new Command('init')
    .description('Initialize mite CLI with API credentials')
    .requiredOption('--api-key <key>', 'mite API key')
    .requiredOption('--account <subdomain>', 'mite account subdomain (e.g., "yooapps")')
    .action(async (options: InitOptions) => {
      try {
        await initAction(options);
      } catch (error) {
        handleError(error);
      }
    });

  return command;
}
