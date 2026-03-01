import { Command } from 'commander';
import { config } from '../../config/index.js';
import { formatTeamListTable } from '../output.js';
import { handleError, EXIT_CODES } from '../../utils/errors.js';

export function createTeamCommand(): Command {
  const command = new Command('team').description('Manage teams of users');

  command
    .command('list')
    .description('List all teams and their members')
    .action(() => {
      try {
        const teams = config.getTeams();
        if (Object.keys(teams).length === 0) {
          console.log(
            'No teams configured. Use `mite team create <name> [userIds...]` to create one.',
          );
          return;
        }
        console.log(formatTeamListTable(teams));
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('create')
    .description('Create a team, optionally with initial members')
    .argument('<name>', 'Team name')
    .argument('[userIds...]', 'Initial user IDs')
    .action((name: string, userIds: string[]) => {
      try {
        if (config.getTeam(name)) {
          console.error(`Team "${name}" already exists. Use \`mite team add\` to add members.`);
          process.exit(EXIT_CODES.GENERAL_ERROR);
        }
        config.setTeam(name, userIds);
        console.log(`Created team "${name}" with ${userIds.length} member(s).`);
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('delete')
    .description('Delete a team')
    .argument('<name>', 'Team name')
    .action((name: string) => {
      try {
        if (config.removeTeam(name)) {
          console.log(`Deleted team "${name}".`);
        } else {
          console.error(`Team "${name}" does not exist.`);
          process.exit(EXIT_CODES.GENERAL_ERROR);
        }
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('add')
    .description('Add one or more users to a team')
    .argument('<name>', 'Team name')
    .argument('<userIds...>', 'User IDs to add')
    .action((name: string, userIds: string[]) => {
      try {
        config.addTeamMembers(name, userIds);
        console.log(`Added ${userIds.length} member(s) to team "${name}".`);
      } catch (error) {
        handleError(error);
      }
    });

  command
    .command('remove')
    .description('Remove a user from a team')
    .argument('<name>', 'Team name')
    .argument('<userId>', 'User ID to remove')
    .action((name: string, userId: string) => {
      try {
        if (config.removeTeamMember(name, userId)) {
          console.log(`Removed user ${userId} from team "${name}".`);
        } else {
          console.error(`User ${userId} is not a member of team "${name}".`);
          process.exit(EXIT_CODES.GENERAL_ERROR);
        }
      } catch (error) {
        handleError(error);
      }
    });

  return command;
}
