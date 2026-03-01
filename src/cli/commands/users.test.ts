import { vi } from 'vitest';

const mockGetUsers = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getUsers: mockGetUsers,
  }),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeUser: (user: { id: number; name: string; role: string }) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    archived: false,
  }),
}));

vi.mock('../output.js', () => ({
  formatUsersTable: (users: unknown[]) => `table:${users.length}`,
}));

const { createUsersCommand } = await import('./users.js');

describe('users command', () => {
  beforeEach(() => {
    mockGetUsers.mockReset();
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('fetches users and prints formatted table', async () => {
    mockGetUsers.mockResolvedValue([{ id: 1, name: 'Test', role: 'admin' }]);

    const command = createUsersCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('table:1');
  });
});
