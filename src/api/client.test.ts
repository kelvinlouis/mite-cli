import { vi, beforeEach } from 'vitest';
import { MiteClient } from './client.js';
import { ConnectionError, ValidationError } from '../utils/errors.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

describe('MiteClient', () => {
  let client: MiteClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new MiteClient('testaccount', 'test-api-key');
  });

  it('sends correct headers', async () => {
    mockFetch.mockResolvedValue(mockResponse([]));
    await client.getUsers();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://testaccount.mite.de/users.json',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'X-MiteApiKey': 'test-api-key',
          'User-Agent': 'mite-cli/1.0.0',
        }),
      }),
    );
  });

  it('returns correct number of users', async () => {
    mockFetch.mockResolvedValue(
      mockResponse([
        { user: { id: 1, name: 'Test User', role: 'admin' } },
        { user: { id: 2, name: 'Other User', role: 'time_tracker' } },
      ]),
    );

    const users = await client.getUsers();
    expect(users).toHaveLength(2);
  });

  it('unwraps user ID', async () => {
    mockFetch.mockResolvedValue(
      mockResponse([
        { user: { id: 1, name: 'Test User', role: 'admin' } },
        { user: { id: 2, name: 'Other User', role: 'time_tracker' } },
      ]),
    );

    const users = await client.getUsers();
    expect(users[0].id).toBe(1);
  });

  it('unwraps user name', async () => {
    mockFetch.mockResolvedValue(
      mockResponse([
        { user: { id: 1, name: 'Test User', role: 'admin' } },
        { user: { id: 2, name: 'Other User', role: 'time_tracker' } },
      ]),
    );

    const users = await client.getUsers();
    expect(users[0].name).toBe('Test User');
  });

  it('unwraps time entry responses', async () => {
    mockFetch.mockResolvedValue(
      mockResponse([{ time_entry: { id: 100, minutes: 120, user_id: 1, note: 'Test' } }]),
    );

    const entries = await client.getTimeEntries({ at: 'this_week' });
    expect(entries).toHaveLength(1);
    expect(entries[0].minutes).toBe(120);
  });

  it('unwraps grouped time entry responses', async () => {
    mockFetch.mockResolvedValue(
      mockResponse([{ time_entry_group: { minutes: 480, user_id: 1, user_name: 'Test' } }]),
    );

    const groups = await client.getTimeEntryGroups({ group_by: 'user' });
    expect(groups).toHaveLength(1);
    expect(groups[0].minutes).toBe(480);
  });

  it('includes at parameter in query string', async () => {
    mockFetch.mockResolvedValue(mockResponse([]));
    await client.getTimeEntries({ at: 'last_week', user_id: '123' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('at=last_week'),
      expect.anything(),
    );
  });

  it('includes user_id parameter in query string', async () => {
    mockFetch.mockResolvedValue(mockResponse([]));
    await client.getTimeEntries({ at: 'last_week', user_id: '123' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('user_id=123'),
      expect.anything(),
    );
  });

  it('unwraps customer responses', async () => {
    mockFetch.mockResolvedValue(mockResponse([{ customer: { id: 10, name: 'Acme Corp' } }]));

    const customers = await client.getCustomers();
    expect(customers[0].id).toBe(10);
  });

  it('unwraps project responses', async () => {
    mockFetch.mockResolvedValue(
      mockResponse([{ project: { id: 20, name: 'My Project', customer_id: 10 } }]),
    );

    const projects = await client.getProjects();
    expect(projects[0].id).toBe(20);
  });

  it('filters projects by customer ID', async () => {
    mockFetch.mockResolvedValue(mockResponse([]));
    await client.getProjects(10);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('customer_id=10'),
      expect.anything(),
    );
  });

  it('unwraps service responses', async () => {
    mockFetch.mockResolvedValue(mockResponse([{ service: { id: 30, name: 'Development' } }]));

    const services = await client.getServices();
    expect(services[0].name).toBe('Development');
  });

  it('throws ValidationError on 401', async () => {
    mockFetch.mockResolvedValue(mockResponse({}, 401));
    await expect(client.getUsers()).rejects.toThrow(ValidationError);
    await expect(client.getUsers()).rejects.toThrow('Invalid API key');
  });

  it('throws ValidationError on 404', async () => {
    mockFetch.mockResolvedValue(mockResponse({}, 404));
    await expect(client.getUsers()).rejects.toThrow(ValidationError);
  });

  it('throws ConnectionError on network failure', async () => {
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));
    await expect(client.getUsers()).rejects.toThrow(ConnectionError);
  });
});
