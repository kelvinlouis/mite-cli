import { vi } from 'vitest';

const mockGetTimeEntries = vi.fn();
const mockGetTeam = vi.fn();
const mockResolveUserIds = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

const mockSanitizeTimeEntry = vi.fn();

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getTimeEntries: mockGetTimeEntries,
  }),
  addDangerouslySkipAliasOption: (cmd: unknown) =>
    (cmd as { option: Function }).option('--dangerously-skip-alias'),
}));

vi.mock('../resolve-users.js', () => ({
  resolveUserIds: (...args: unknown[]) => mockResolveUserIds(...args),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeTimeEntry: (...args: unknown[]) => mockSanitizeTimeEntry(...args),
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
    mockResolveUserIds.mockReset();
    mockSanitizeTimeEntry.mockReset();
    mockSanitizeTimeEntry.mockImplementation((entry: { id: number }) => entry);
    mockResolveUserIds.mockImplementation((_client: unknown, input: string) =>
      Promise.resolve(input),
    );
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
    expect(process.exitCode).toBe(5);
    process.exitCode = undefined;
  });

  it('exits when --team and --user are both provided', async () => {
    const command = createEntriesCommand();
    await command.parseAsync(['--team', 'dev', '--user', '1'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error: --team and --user are mutually exclusive.',
    );
    expect(process.exitCode).toBe(5);
    process.exitCode = undefined;
  });

  it('exits when team does not exist', async () => {
    mockGetTeam.mockReturnValue(undefined);

    const command = createEntriesCommand();
    await command.parseAsync(['--team', 'nonexistent'], { from: 'user' });

    expect(process.exitCode).toBe(5);
    process.exitCode = undefined;
  });

  it('passes at parameter to API', async () => {
    mockGetTimeEntries.mockResolvedValue([]);

    const command = createEntriesCommand();
    await command.parseAsync(['--user', '1', '--at', 'last_week'], { from: 'user' });

    expect(mockGetTimeEntries).toHaveBeenCalledWith(expect.objectContaining({ at: 'last_week' }));
  });

  it('passes note parameter to API', async () => {
    mockGetTimeEntries.mockResolvedValue([]);

    const command = createEntriesCommand();
    await command.parseAsync(['--user', '1', '--note', 'meeting'], { from: 'user' });

    expect(mockGetTimeEntries).toHaveBeenCalledWith(expect.objectContaining({ note: 'meeting' }));
  });

  it('filters out entries with non-empty notes when --no-note is used', async () => {
    mockGetTimeEntries.mockResolvedValue([
      { id: 1, note: '' },
      { id: 2, note: 'has a note' },
      { id: 3, note: '' },
    ]);

    const command = createEntriesCommand();
    await command.parseAsync(['--user', '1', '--empty-note'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('entries:2');
  });

  it('passes useRealNames when --dangerously-skip-alias is set', async () => {
    mockGetTimeEntries.mockResolvedValue([{ id: 1, note: '' }]);

    const command = createEntriesCommand();
    await command.parseAsync(['--user', '1', '--dangerously-skip-alias'], { from: 'user' });

    expect(mockSanitizeTimeEntry).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ useRealNames: true }),
    );
  });

  it('does not pass useRealNames without the flag', async () => {
    mockGetTimeEntries.mockResolvedValue([{ id: 1, note: '' }]);

    const command = createEntriesCommand();
    await command.parseAsync(['--user', '1'], { from: 'user' });

    expect(mockSanitizeTimeEntry).toHaveBeenCalledWith(expect.any(Object), undefined);
  });
});
