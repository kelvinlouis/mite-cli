import { USER_AGENT, MITE_BASE_URL_TEMPLATE, HTTP_STATUS } from '../constants.js';
import { ConnectionError, ValidationError } from '../utils/errors.js';
import type {
  MiteTimeEntry,
  MiteTimeEntryGroup,
  MiteUser,
  MiteCustomer,
  MiteProject,
  MiteService,
  TimeEntryParams,
  GroupedTimeEntryParams,
} from './types.js';

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined,
  );
  if (entries.length === 0) return '';
  return (
    '?' +
    entries
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  );
}

export class MiteClient {
  private baseURL: string;
  private apiKey: string;

  constructor(account: string, apiKey: string) {
    this.baseURL = MITE_BASE_URL_TEMPLATE.replace('{account}', account);
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'X-MiteApiKey': this.apiKey,
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    };

    try {
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        await this.handleHttpError(response, endpoint);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      if (error instanceof TypeError) {
        throw new ConnectionError(
          `Could not connect to ${this.baseURL}. Check your account name and network connection.`,
          error,
        );
      }
      throw error;
    }
  }

  private async handleHttpError(response: Response, endpoint: string): Promise<never> {
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      throw new ValidationError('Invalid API key. Check your configuration.');
    }
    if (response.status === HTTP_STATUS.NOT_FOUND) {
      throw new ValidationError(`Not found: ${endpoint}`);
    }
    const body = await response.text().catch(() => '');
    throw new ValidationError(`API error (${response.status}): ${body || response.statusText}`);
  }

  async getTimeEntries(params?: TimeEntryParams): Promise<MiteTimeEntry[]> {
    const qs = buildQueryString(params || {});
    const response = await this.request<Array<{ time_entry: MiteTimeEntry }>>(
      `/time_entries.json${qs}`,
    );
    return response.map((item) => item.time_entry);
  }

  async getTimeEntryGroups(params: GroupedTimeEntryParams): Promise<MiteTimeEntryGroup[]> {
    const qs = buildQueryString(params);
    const response = await this.request<Array<{ time_entry_group: MiteTimeEntryGroup }>>(
      `/time_entries.json${qs}`,
    );
    return response.map((item) => item.time_entry_group);
  }

  async getUsers(): Promise<MiteUser[]> {
    const response = await this.request<Array<{ user: MiteUser }>>('/users.json');
    return response.map((item) => item.user);
  }

  async getCustomers(): Promise<MiteCustomer[]> {
    const response = await this.request<Array<{ customer: MiteCustomer }>>('/customers.json');
    return response.map((item) => item.customer);
  }

  async getProjects(customerId?: number): Promise<MiteProject[]> {
    const qs = buildQueryString({ customer_id: customerId });
    const response = await this.request<Array<{ project: MiteProject }>>(`/projects.json${qs}`);
    return response.map((item) => item.project);
  }

  async getServices(): Promise<MiteService[]> {
    const response = await this.request<Array<{ service: MiteService }>>('/services.json');
    return response.map((item) => item.service);
  }

  async getAccount(): Promise<{ account: { id: number; name: string; title: string } }> {
    return this.request('/account.json');
  }

  async getMyself(): Promise<{ user: MiteUser }> {
    return this.request('/myself.json');
  }
}
