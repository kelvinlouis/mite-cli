import { config } from '../config/index.js';
import type {
  MiteTimeEntry,
  MiteTimeEntryGroup,
  MiteUser,
  MiteCustomer,
  MiteProject,
} from '../api/types.js';
import type {
  SanitizedTimeEntry,
  SanitizedTimeEntryGroup,
  SanitizedUser,
  SanitizedCustomer,
  SanitizedProject,
} from './types.js';

export type {
  SanitizedTimeEntry,
  SanitizedTimeEntryGroup,
  SanitizedUser,
  SanitizedCustomer,
  SanitizedProject,
} from './types.js';

export function sanitizeTimeEntry(entry: MiteTimeEntry): SanitizedTimeEntry {
  return {
    id: entry.id,
    minutes: entry.minutes,
    date_at: entry.date_at,
    note: entry.note,
    billable: entry.billable,
    locked: entry.locked,
    user_id: entry.user_id,
    user_name: config.abbreviateUser(entry.user_id),
    project_id: entry.project_id,
    project_name: entry.project_id ? config.abbreviateProject(entry.project_id) : '-',
    customer_id: entry.customer_id,
    customer_name: entry.customer_id ? config.abbreviateCustomer(entry.customer_id) : '-',
    service_id: entry.service_id,
    service_name: entry.service_name || '-',
  };
}

export function sanitizeTimeEntryGroup(group: MiteTimeEntryGroup): SanitizedTimeEntryGroup {
  const result: SanitizedTimeEntryGroup = {
    minutes: group.minutes,
  };

  if (group.user_id !== undefined) {
    result.user_id = group.user_id;
    result.user_name = config.abbreviateUser(group.user_id);
  }
  if (group.project_id !== undefined) {
    result.project_id = group.project_id;
    result.project_name = config.abbreviateProject(group.project_id);
  }
  if (group.service_id !== undefined) {
    result.service_id = group.service_id;
    result.service_name = group.service_name;
  }
  if (group.customer_id !== undefined) {
    result.customer_id = group.customer_id;
    result.customer_name = config.abbreviateCustomer(group.customer_id);
  }

  return result;
}

export function sanitizeUser(user: MiteUser): SanitizedUser {
  return {
    id: user.id,
    name: config.abbreviateUser(user.id),
    role: user.role,
    archived: user.archived,
  };
}

export function sanitizeCustomer(customer: MiteCustomer): SanitizedCustomer {
  return {
    id: customer.id,
    name: config.abbreviateCustomer(customer.id),
    archived: customer.archived,
  };
}

export function sanitizeProject(project: MiteProject): SanitizedProject {
  return {
    id: project.id,
    name: config.abbreviateProject(project.id),
    customer_id: project.customer_id,
    customer_name: config.abbreviateCustomer(project.customer_id),
    archived: project.archived,
  };
}
