export interface SanitizedTimeEntry {
  id: number;
  minutes: number;
  date_at: string;
  note: string;
  billable: boolean;
  locked: boolean;
  user_id: number;
  user_name: string;
  project_id: number | null;
  project_name: string;
  customer_id: number | null;
  customer_name: string;
  service_id: number | null;
  service_name: string;
}

export interface SanitizedTimeEntryGroup {
  minutes: number;
  user_id?: number;
  user_name?: string;
  project_id?: number;
  project_name?: string;
  service_id?: number;
  service_name?: string;
  customer_id?: number;
  customer_name?: string;
}

export interface SanitizedUser {
  id: number;
  name: string;
  role: string;
  archived: boolean;
}

export interface SanitizedCustomer {
  id: number;
  name: string;
  archived: boolean;
}

export interface SanitizedProject {
  id: number;
  name: string;
  customer_id: number;
  customer_name: string;
  archived: boolean;
}
