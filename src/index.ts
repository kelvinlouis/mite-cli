#!/usr/bin/env node

import { Command } from 'commander';
import { CLI_VERSION } from './constants.js';
import { createInitCommand } from './cli/commands/init.js';
import { createConfigCommand } from './cli/commands/config.js';
import { createUsersCommand } from './cli/commands/users.js';
import { createCustomersCommand } from './cli/commands/customers.js';
import { createProjectsCommand } from './cli/commands/projects.js';
import { createServicesCommand } from './cli/commands/services.js';
import { createSummaryCommand } from './cli/commands/summary.js';
import { createEntriesCommand } from './cli/commands/entries.js';
import { createTeamCommand } from './cli/commands/team.js';

const program = new Command();

program
  .name('mite')
  .description('Read-only CLI for querying mite.de time tracking data')
  .version(CLI_VERSION, '-v, --version', 'Output version number');

program.addCommand(createInitCommand());
program.addCommand(createConfigCommand());
program.addCommand(createUsersCommand());
program.addCommand(createCustomersCommand());
program.addCommand(createProjectsCommand());
program.addCommand(createServicesCommand());
program.addCommand(createSummaryCommand());
program.addCommand(createEntriesCommand());
program.addCommand(createTeamCommand());

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}
