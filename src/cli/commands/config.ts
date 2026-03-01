import { Command } from 'commander';
import { config } from '../../config/index.js';
import { formatConfigOutput } from '../output.js';
import { handleError } from '../../utils/errors.js';

export function createConfigCommand(): Command {
  const command = new Command('config').description('Manage CLI configuration');

  command
    .command('show')
    .description('Show current configuration (API key masked)')
    .action(() => {
      try {
        console.log(formatConfigOutput(config.getMaskedConfig()));
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('set-user')
    .description('Map a user ID to an abbreviation')
    .argument('<id>', 'User ID')
    .argument('<abbreviation>', 'Short name (e.g., "HB")')
    .action((id: string, abbreviation: string) => {
      try {
        config.setUser(id, abbreviation);
        console.log(`Mapped user ${id} → ${abbreviation}`);
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('set-customer')
    .description('Map a customer ID to an abbreviation')
    .argument('<id>', 'Customer ID')
    .argument('<abbreviation>', 'Short name (e.g., "BIS")')
    .action((id: string, abbreviation: string) => {
      try {
        config.setCustomer(id, abbreviation);
        console.log(`Mapped customer ${id} → ${abbreviation}`);
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('set-project')
    .description('Map a project ID to an abbreviation')
    .argument('<id>', 'Project ID')
    .argument('<abbreviation>', 'Short name (e.g., "SS")')
    .action((id: string, abbreviation: string) => {
      try {
        config.setProject(id, abbreviation);
        console.log(`Mapped project ${id} → ${abbreviation}`);
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('remove-user')
    .description('Remove a user mapping')
    .argument('<id>', 'User ID')
    .action((id: string) => {
      try {
        if (config.removeUser(id)) {
          console.log(`Removed user mapping for ${id}`);
        } else {
          console.log(`No mapping found for user ${id}`);
        }
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('remove-customer')
    .description('Remove a customer mapping')
    .argument('<id>', 'Customer ID')
    .action((id: string) => {
      try {
        if (config.removeCustomer(id)) {
          console.log(`Removed customer mapping for ${id}`);
        } else {
          console.log(`No mapping found for customer ${id}`);
        }
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('remove-project')
    .description('Remove a project mapping')
    .argument('<id>', 'Project ID')
    .action((id: string) => {
      try {
        if (config.removeProject(id)) {
          console.log(`Removed project mapping for ${id}`);
        } else {
          console.log(`No mapping found for project ${id}`);
        }
      } catch (error) {
        handleError(error);
      }
    });

  return command;
}
