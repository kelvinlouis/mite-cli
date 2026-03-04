import { vi } from 'vitest';

const mockGetTimeEntryGroups = vi.fn();
const mockGetTeam = vi.fn();
const mockResolveUserIds = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getTimeEntryGroups: mockGetTimeEntryGroups,
  }),
}));

vi.mock('../resolve-users.js', () => ({
  resolveUserIds: (...args: unknown[]) => mockResolveUserIds(...args),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeTimeEntryGroup: (group: { minutes: number }) => group,
}));

const mockFormatSummaryTable = vi.fn(
  (groups: unknown[], _fields: unknown[]) => `summary:${groups.length}`,
);

vi.mock('../output.js', () => ({
  formatSummaryTable: (...args: unknown[]) =>
    mockFormatSummaryTable(...(args as [unknown[], unknown[]])),
}));

vi.mock('../../config/index.js', () => ({
  config: {
    getTeam: mockGetTeam,
  },
}));

const { createSummaryCommand } = await import('./summary.js');

describe('summary command', () => {
  beforeEach(() => {
    mockGetTimeEntryGroups.mockReset();
    mockGetTeam.mockReset();
    mockResolveUserIds.mockReset();
    mockResolveUserIds.mockImplementation((_client: unknown, input: string) =>
      Promise.resolve(input),
    );
    mockFormatSummaryTable.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockExit.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockExit.mockRestore();
  });

  it('fetches grouped entries and prints summary', async () => {
    mockGetTimeEntryGroups.mockResolvedValue([{ minutes: 480 }]);

    const command = createSummaryCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('summary:1');
  });

  it('passes at parameter to API', async () => {
    mockGetTimeEntryGroups.mockResolvedValue([]);

    const command = createSummaryCommand();
    await command.parseAsync(['--at', 'last_week'], { from: 'user' });

    expect(mockGetTimeEntryGroups).toHaveBeenCalledWith(
      expect.objectContaining({ at: 'last_week' }),
    );
  });

  it('uses from/to instead of at when both provided', async () => {
    mockGetTimeEntryGroups.mockResolvedValue([]);

    const command = createSummaryCommand();
    await command.parseAsync(['--from', '2024-01-01', '--to', '2024-01-31'], { from: 'user' });

    expect(mockGetTimeEntryGroups).toHaveBeenCalledWith(
      expect.objectContaining({ from: '2024-01-01', to: '2024-01-31' }),
    );
  });

  it('resolves team name to user IDs', async () => {
    mockGetTeam.mockReturnValue(['1', '2']);
    mockGetTimeEntryGroups.mockResolvedValue([]);

    const command = createSummaryCommand();
    await command.parseAsync(['--team', 'dev'], { from: 'user' });

    expect(mockGetTimeEntryGroups).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: '1,2' }),
    );
  });

  it('exits when team and user are both provided', async () => {
    const command = createSummaryCommand();
    await command.parseAsync(['--team', 'dev', '--user', '1'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error: --team and --user are mutually exclusive.',
    );
    expect(process.exitCode).toBe(5);
    process.exitCode = undefined;
  });

  it('exits when team does not exist', async () => {
    mockGetTeam.mockReturnValue(undefined);

    const command = createSummaryCommand();
    await command.parseAsync(['--team', 'nonexistent'], { from: 'user' });

    expect(process.exitCode).toBe(5);
    process.exitCode = undefined;
  });

  it('passes default group fields to formatter', async () => {
    mockGetTimeEntryGroups.mockResolvedValue([{ minutes: 60 }]);

    const command = createSummaryCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockFormatSummaryTable).toHaveBeenCalledWith(expect.any(Array), [
      'user',
      'project',
      'service',
    ]);
  });

  it('passes custom group fields to formatter', async () => {
    mockGetTimeEntryGroups.mockResolvedValue([{ minutes: 60 }]);

    const command = createSummaryCommand();
    await command.parseAsync(['--group-by', 'customer,project'], { from: 'user' });

    expect(mockFormatSummaryTable).toHaveBeenCalledWith(expect.any(Array), ['customer', 'project']);
  });

  it('exits with validation error for invalid group-by field', async () => {
    const command = createSummaryCommand();
    await command.parseAsync(['--group-by', 'invalid'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid group-by field(s): invalid'),
    );
    expect(process.exitCode).toBe(5);
    process.exitCode = undefined;
  });
});
