import { Command } from 'commander';
import { createAuthenticatedClient } from './shared.js';
import { sanitizeProject } from '../../privacy/index.js';
import { formatProjectsTable } from '../output.js';
import { handleError } from '../../utils/errors.js';

interface ProjectsOptions {
  customer?: string;
}

async function projectsAction(options: ProjectsOptions): Promise<void> {
  const client = createAuthenticatedClient();
  const customerId = options.customer ? parseInt(options.customer, 10) : undefined;
  const projects = await client.getProjects(customerId);
  const sanitized = projects.map(sanitizeProject);
  console.log(formatProjectsTable(sanitized));
}

export function createProjectsCommand(): Command {
  return new Command('projects')
    .description('List all projects')
    .option('--customer <id>', 'Filter by customer ID')
    .action(async (options: ProjectsOptions) => {
      try {
        await projectsAction(options);
      } catch (error) {
        handleError(error);
      }
    });
}
