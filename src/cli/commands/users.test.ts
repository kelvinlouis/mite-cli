import { vi } from 'vitest';

const mockGetUsers = vi.fn();
const mockSanitizeUser = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getUsers: mockGetUsers,
  }),
  addDangerouslySkipAliasOption: (cmd: unknown) =>
    (cmd as { option: Function }).option('--dangerously-skip-alias'),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeUser: (...args: unknown[]) => mockSanitizeUser(...args),
}));

vi.mock('../output.js', () => ({
  formatUsersTable: (users: unknown[]) => `table:${users.length}`,
}));

const { createUsersCommand } = await import('./users.js');

describe('users command', () => {
  beforeEach(() => {
    mockGetUsers.mockReset();
    mockSanitizeUser.mockReset();
    mockSanitizeUser.mockImplementation((user: { id: number; name: string; role: string }) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      archived: false,
    }));
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

  it('passes useRealNames when --dangerously-skip-alias is set', async () => {
    mockGetUsers.mockResolvedValue([{ id: 1, name: 'Test', role: 'admin' }]);

    const command = createUsersCommand();
    await command.parseAsync(['--dangerously-skip-alias'], { from: 'user' });

    expect(mockSanitizeUser).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ useRealNames: true }),
    );
  });

  it('does not pass useRealNames without the flag', async () => {
    mockGetUsers.mockResolvedValue([{ id: 1, name: 'Test', role: 'admin' }]);

    const command = createUsersCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockSanitizeUser).toHaveBeenCalledWith(expect.any(Object), undefined);
  });
});
