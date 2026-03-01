import { vi } from 'vitest';

const mockGetCustomers = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getCustomers: mockGetCustomers,
  }),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeCustomer: (customer: { id: number; name: string }) => ({
    id: customer.id,
    name: customer.name,
    archived: false,
  }),
}));

vi.mock('../output.js', () => ({
  formatCustomersTable: (customers: unknown[]) => `table:${customers.length}`,
}));

const { createCustomersCommand } = await import('./customers.js');

describe('customers command', () => {
  beforeEach(() => {
    mockGetCustomers.mockReset();
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('fetches customers and prints formatted table', async () => {
    mockGetCustomers.mockResolvedValue([{ id: 10, name: 'Acme' }]);

    const command = createCustomersCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('table:1');
  });
});
