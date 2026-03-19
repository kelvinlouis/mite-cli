import { vi } from 'vitest';

const mockGetCustomers = vi.fn();
const mockSanitizeCustomer = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getCustomers: mockGetCustomers,
  }),
  addDangerouslySkipAliasOption: (cmd: unknown) =>
    (cmd as { option: Function }).option('--dangerously-skip-alias'),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeCustomer: (...args: unknown[]) => mockSanitizeCustomer(...args),
}));

vi.mock('../output.js', () => ({
  formatCustomersTable: (customers: unknown[]) => `table:${customers.length}`,
}));

const { createCustomersCommand } = await import('./customers.js');

describe('customers command', () => {
  beforeEach(() => {
    mockGetCustomers.mockReset();
    mockSanitizeCustomer.mockReset();
    mockSanitizeCustomer.mockImplementation((customer: { id: number; name: string }) => ({
      id: customer.id,
      name: customer.name,
      archived: false,
    }));
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

  it('passes useRealNames when --dangerously-skip-alias is set', async () => {
    mockGetCustomers.mockResolvedValue([{ id: 10, name: 'Acme' }]);

    const command = createCustomersCommand();
    await command.parseAsync(['--dangerously-skip-alias'], { from: 'user' });

    expect(mockSanitizeCustomer).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ useRealNames: true }),
    );
  });

  it('does not pass useRealNames without the flag', async () => {
    mockGetCustomers.mockResolvedValue([{ id: 10, name: 'Acme' }]);

    const command = createCustomersCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockSanitizeCustomer).toHaveBeenCalledWith(expect.any(Object), undefined);
  });
});
