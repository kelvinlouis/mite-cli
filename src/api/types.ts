// Raw mite API response types — these are wrapped in envelope objects (e.g., { time_entry: {...} })

export interface MiteTimeEntry {
  id: number;
  minutes: number;
  date_at: string;
  note: string;
  billable: boolean;
  locked: boolean;
  revenue: number | null;
  hourly_rate: number;
  user_id: number;
  user_name: string;
  project_id: number | null;
  project_name: string;
  customer_id: number | null;
  customer_name: string;
  service_id: number | null;
  service_name: string;
  created_at: string;
  updated_at: string;
}

export interface MiteTimeEntryGroup {
  minutes: number;
  revenue: number;
  user_id?: number;
  user_name?: string;
  project_id?: number;
  project_name?: string;
  service_id?: number;
  service_name?: string;
  customer_id?: number;
  customer_name?: string;
}

export interface MiteUser {
  id: number;
  name: string;
  email: string;
  note: string;
  archived: boolean;
  role: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface MiteCustomer {
  id: number;
  name: string;
  note: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  hourly_rate: number | null;
  active_hourly_rate: string | null;
}

export interface MiteProject {
  id: number;
  name: string;
  note: string;
  customer_id: number;
  customer_name: string;
  budget: number;
  budget_type: string;
  archived: boolean;
  hourly_rate: number | null;
  active_hourly_rate: string | null;
  created_at: string;
  updated_at: string;
}

export interface MiteService {
  id: number;
  name: string;
  note: string;
  hourly_rate: number | null;
  archived: boolean;
  billable: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeEntryParams {
  user_id?: string;
  at?: string;
  from?: string;
  to?: string;
  project_id?: string;
  service_id?: string;
  note?: string;
}

export interface GroupedTimeEntryParams extends TimeEntryParams {
  group_by: string;
}
