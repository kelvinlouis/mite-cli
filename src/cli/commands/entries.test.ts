import { vi } from 'vitest';

const mockGetTimeEntries = vi.fn();
const mockGetTeam = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getTimeEntries: mockGetTimeEntries,
  }),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeTimeEntry: (entry: { id: number }) => entry,
}));

vi.mock('../output.js', () => ({
  formatEntriesTable: (entries: unknown[]) => `entries:${entries.length}`,
  formatTeamEntriesTable: (entries: unknown[]) => `team-entries:${entries.length}`,
}));

vi.mock('../../config/index.js', () => ({
  config: {
    getTeam: mockGetTeam,
  },
}));

const { createEntriesCommand } = await import('./entries.js');

describe('entries command', () => {
  beforeEach(() => {
    mockGetTimeEntries.mockReset();
    mockGetTeam.mockReset();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockExit.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockExit.mockRestore();
  });

  it('fetches entries for a user and prints table', async () => {
    mockGetTimeEntries.mockResolvedValue([{ id: 1 }]);

    const command = createEntriesCommand();
    await command.parseAsync(['--user', '123'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('entries:1');
  });

  it('uses team entries format when --team is provided', async () => {
    mockGetTeam.mockReturnValue(['1', '2']);
    mockGetTimeEntries.mockResolvedValue([{ id: 1 }]);

    const command = createEntriesCommand();
    await command.parseAsync(['--team', 'dev'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('team-entries:1');
  });

  it('exits when neither --user nor --team is provided', async () => {
    const command = createEntriesCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error: either --user or --team must be provided.',
    );
    expect(mockExit).toHaveBeenCalled();
  });

  it('exits when --team and --user are both provided', async () => {
    const command = createEntriesCommand();
    await command.parseAsync(['--team', 'dev', '--user', '1'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error: --team and --user are mutually exclusive.',
    );
    expect(mockExit).toHaveBeenCalled();
  });

  it('exits when team does not exist', async () => {
    mockGetTeam.mockReturnValue(undefined);

    const command = createEntriesCommand();
    await command.parseAsync(['--team', 'nonexistent'], { from: 'user' });

    expect(mockExit).toHaveBeenCalled();
  });

  it('passes at parameter to API', async () => {
    mockGetTimeEntries.mockResolvedValue([]);

    const command = createEntriesCommand();
    await command.parseAsync(['--user', '1', '--at', 'last_week'], { from: 'user' });

    expect(mockGetTimeEntries).toHaveBeenCalledWith(expect.objectContaining({ at: 'last_week' }));
  });
});
