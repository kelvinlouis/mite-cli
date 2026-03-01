import { EMPTY_CELL, MAX_CELL_LENGTH } from '../constants.js';
import type { GroupField } from '../constants.js';
import { minutesToDecimalHours } from '../utils/time.js';
import { config } from '../config/index.js';
import type {
  SanitizedTimeEntry,
  SanitizedTimeEntryGroup,
  SanitizedUser,
  SanitizedCustomer,
  SanitizedProject,
} from '../privacy/index.js';
import type { MiteService } from '../api/types.js';

export function truncateCell(value: string, maxLength = MAX_CELL_LENGTH): string {
  let result = value.replace(/\n/g, ' ').trim();
  result = result.replace(/\|/g, '\\|');
  if (result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + '...';
  }
  return result || EMPTY_CELL;
}

function markdownTable(headers: string[], rows: string[][]): string {
  const separator = headers.map(() => '---');
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...rows.map((row) => `| ${row.map((cell) => truncateCell(cell)).join(' | ')} |`),
  ];
  return lines.join('\n');
}

export function formatUsersTable(users: SanitizedUser[]): string {
  const headers = ['ID', 'Name', 'Role', 'Archived'];
  const rows = users.map((user) => [
    String(user.id),
    user.name,
    user.role,
    user.archived ? 'yes' : 'no',
  ]);
  return markdownTable(headers, rows);
}

export function formatCustomersTable(customers: SanitizedCustomer[]): string {
  const headers = ['ID', 'Name', 'Archived'];
  const rows = customers.map((customer) => [
    String(customer.id),
    customer.name,
    customer.archived ? 'yes' : 'no',
  ]);
  return markdownTable(headers, rows);
}

export function formatProjectsTable(projects: SanitizedProject[]): string {
  const headers = ['ID', 'Name', 'Customer', 'Archived'];
  const rows = projects.map((project) => [
    String(project.id),
    project.name,
    project.customer_name,
    project.archived ? 'yes' : 'no',
  ]);
  return markdownTable(headers, rows);
}

export function formatServicesTable(services: MiteService[]): string {
  const headers = ['ID', 'Name', 'Billable', 'Archived'];
  const rows = services.map((service) => [
    String(service.id),
    service.name,
    service.billable ? 'yes' : 'no',
    service.archived ? 'yes' : 'no',
  ]);
  return markdownTable(headers, rows);
}

interface GroupFieldColumn {
  header: string;
  accessor: 'user_name' | 'customer_name' | 'project_name' | 'service_name';
}

const GROUP_FIELD_COLUMNS: Record<GroupField, GroupFieldColumn> = {
  user: { header: 'User', accessor: 'user_name' },
  customer: { header: 'Customer', accessor: 'customer_name' },
  project: { header: 'Project', accessor: 'project_name' },
  service: { header: 'Service', accessor: 'service_name' },
};

export function formatSummaryTable(
  groups: SanitizedTimeEntryGroup[],
  groupFields: GroupField[],
): string {
  const columns = groupFields.map((f) => GROUP_FIELD_COLUMNS[f]);
  const headers = [...columns.map((c) => c.header), 'Hours'];
  const rows = groups.map((g) => [
    ...columns.map((c) => g[c.accessor] ?? EMPTY_CELL),
    minutesToDecimalHours(g.minutes),
  ]);

  const totalMinutes = groups.reduce((sum, g) => sum + g.minutes, 0);
  rows.push([
    '**Total**',
    ...Array(columns.length - 1).fill(''),
    `**${minutesToDecimalHours(totalMinutes)}**`,
  ]);

  return markdownTable(headers, rows);
}

export function formatEntriesTable(entries: SanitizedTimeEntry[]): string {
  const headers = ['Date', 'Customer', 'Project', 'Service', 'Note', 'Hours'];
  const rows = entries.map((entry) => [
    entry.date_at,
    entry.customer_name,
    entry.project_name,
    entry.service_name || EMPTY_CELL,
    entry.note || EMPTY_CELL,
    minutesToDecimalHours(entry.minutes),
  ]);

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  rows.push(['**Total**', '', '', '', '', `**${minutesToDecimalHours(totalMinutes)}**`]);

  return markdownTable(headers, rows);
}

export function formatTeamEntriesTable(entries: SanitizedTimeEntry[]): string {
  const headers = ['Date', 'User', 'Customer', 'Project', 'Service', 'Note', 'Hours'];
  const rows = entries.map((entry) => [
    entry.date_at,
    entry.user_name,
    entry.customer_name,
    entry.project_name,
    entry.service_name || EMPTY_CELL,
    entry.note || EMPTY_CELL,
    minutesToDecimalHours(entry.minutes),
  ]);

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  rows.push(['**Total**', '', '', '', '', '', `**${minutesToDecimalHours(totalMinutes)}**`]);

  return markdownTable(headers, rows);
}

export function formatTeamListTable(teams: Record<string, string[]>): string {
  const headers = ['Team', 'Members'];
  const rows = Object.entries(teams).map(([name, userIds]) => [
    name,
    userIds.map((id) => config.abbreviateUser(id)).join(', ') || EMPTY_CELL,
  ]);
  return markdownTable(headers, rows);
}

export function formatConfigOutput(masked: Record<string, unknown>): string {
  return JSON.stringify(masked, null, 2);
}
