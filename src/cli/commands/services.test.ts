import { vi } from 'vitest';

const mockGetServices = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getServices: mockGetServices,
  }),
}));

vi.mock('../output.js', () => ({
  formatServicesTable: (services: unknown[]) => `table:${services.length}`,
}));

const { createServicesCommand } = await import('./services.js');

describe('services command', () => {
  beforeEach(() => {
    mockGetServices.mockReset();
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('fetches services and prints formatted table', async () => {
    mockGetServices.mockResolvedValue([{ id: 30, name: 'Development' }]);

    const command = createServicesCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('table:1');
  });
});
