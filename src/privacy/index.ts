import { config } from '../config/index.js';
import type {
  MiteTimeEntry,
  MiteTimeEntryGroup,
  MiteUser,
  MiteCustomer,
  MiteProject,
} from '../api/types.js';
import type {
  SanitizeOptions,
  SanitizedTimeEntry,
  SanitizedTimeEntryGroup,
  SanitizedUser,
  SanitizedCustomer,
  SanitizedProject,
} from './types.js';

export type {
  SanitizeOptions,
  SanitizedTimeEntry,
  SanitizedTimeEntryGroup,
  SanitizedUser,
  SanitizedCustomer,
  SanitizedProject,
} from './types.js';

export function sanitizeTimeEntry(
  entry: MiteTimeEntry,
  options?: SanitizeOptions,
): SanitizedTimeEntry {
  const useReal = options?.useRealNames;
  return {
    id: entry.id,
    minutes: entry.minutes,
    date_at: entry.date_at,
    note: entry.note,
    billable: entry.billable,
    locked: entry.locked,
    user_id: entry.user_id,
    user_name: useReal ? entry.user_name : config.abbreviateUser(entry.user_id),
    project_id: entry.project_id,
    project_name: entry.project_id
      ? useReal
        ? entry.project_name
        : config.abbreviateProject(entry.project_id)
      : '-',
    customer_id: entry.customer_id,
    customer_name: entry.customer_id
      ? useReal
        ? entry.customer_name
        : config.abbreviateCustomer(entry.customer_id)
      : '-',
    service_id: entry.service_id,
    service_name: entry.service_name || '-',
  };
}

export function sanitizeTimeEntryGroup(
  group: MiteTimeEntryGroup,
  options?: SanitizeOptions,
): SanitizedTimeEntryGroup {
  const useReal = options?.useRealNames;
  const result: SanitizedTimeEntryGroup = {
    minutes: group.minutes,
  };

  if (group.user_id !== undefined) {
    result.user_id = group.user_id;
    result.user_name = useReal ? group.user_name : config.abbreviateUser(group.user_id);
  }
  if (group.project_id !== undefined) {
    result.project_id = group.project_id;
    result.project_name = useReal ? group.project_name : config.abbreviateProject(group.project_id);
  }
  if (group.service_id !== undefined) {
    result.service_id = group.service_id;
    result.service_name = group.service_name;
  }
  if (group.customer_id !== undefined) {
    result.customer_id = group.customer_id;
    result.customer_name = useReal
      ? group.customer_name
      : config.abbreviateCustomer(group.customer_id);
  }

  return result;
}

export function sanitizeUser(user: MiteUser, options?: SanitizeOptions): SanitizedUser {
  return {
    id: user.id,
    name: options?.useRealNames ? user.name : config.abbreviateUser(user.id),
    role: user.role,
    archived: user.archived,
  };
}

export function sanitizeCustomer(
  customer: MiteCustomer,
  options?: SanitizeOptions,
): SanitizedCustomer {
  return {
    id: customer.id,
    name: options?.useRealNames ? customer.name : config.abbreviateCustomer(customer.id),
    archived: customer.archived,
  };
}

export function sanitizeProject(project: MiteProject, options?: SanitizeOptions): SanitizedProject {
  const useReal = options?.useRealNames;
  return {
    id: project.id,
    name: useReal ? project.name : config.abbreviateProject(project.id),
    customer_id: project.customer_id,
    customer_name: useReal ? project.customer_name : config.abbreviateCustomer(project.customer_id),
    archived: project.archived,
  };
}
