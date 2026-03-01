import { vi } from 'vitest';

const mockGetTeams = vi.fn();
const mockGetTeam = vi.fn();
const mockSetTeam = vi.fn();
const mockRemoveTeam = vi.fn();
const mockAddTeamMembers = vi.fn();
const mockRemoveTeamMember = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

vi.mock('../../config/index.js', () => ({
  config: {
    getTeams: mockGetTeams,
    getTeam: mockGetTeam,
    setTeam: mockSetTeam,
    removeTeam: mockRemoveTeam,
    addTeamMembers: mockAddTeamMembers,
    removeTeamMember: mockRemoveTeamMember,
  },
}));

vi.mock('../output.js', () => ({
  formatTeamListTable: (teams: Record<string, string[]>) => `teams:${Object.keys(teams).length}`,
}));

const { createTeamCommand } = await import('./team.js');

describe('team command', () => {
  beforeEach(() => {
    mockGetTeams.mockReset();
    mockGetTeam.mockReset();
    mockSetTeam.mockReset();
    mockRemoveTeam.mockReset();
    mockAddTeamMembers.mockReset();
    mockRemoveTeamMember.mockReset();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockExit.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockExit.mockRestore();
  });

  describe('list', () => {
    it('prints team table when teams exist', async () => {
      mockGetTeams.mockReturnValue({ dev: ['1', '2'] });

      const command = createTeamCommand();
      await command.parseAsync(['list'], { from: 'user' });

      expect(mockConsoleLog).toHaveBeenCalledWith('teams:1');
    });

    it('prints message when no teams exist', async () => {
      mockGetTeams.mockReturnValue({});

      const command = createTeamCommand();
      await command.parseAsync(['list'], { from: 'user' });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('No teams configured'));
    });
  });

  describe('create', () => {
    it('creates team with members', async () => {
      mockGetTeam.mockReturnValue(undefined);

      const command = createTeamCommand();
      await command.parseAsync(['create', 'dev', '1', '2'], { from: 'user' });

      expect(mockSetTeam).toHaveBeenCalledWith('dev', ['1', '2']);
    });

    it('exits when team already exists', async () => {
      mockGetTeam.mockReturnValue(['1']);

      const command = createTeamCommand();
      await command.parseAsync(['create', 'dev'], { from: 'user' });

      expect(mockExit).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes existing team', async () => {
      mockRemoveTeam.mockReturnValue(true);

      const command = createTeamCommand();
      await command.parseAsync(['delete', 'dev'], { from: 'user' });

      expect(mockConsoleLog).toHaveBeenCalledWith('Deleted team "dev".');
    });

    it('exits when team does not exist', async () => {
      mockRemoveTeam.mockReturnValue(false);

      const command = createTeamCommand();
      await command.parseAsync(['delete', 'nonexistent'], { from: 'user' });

      expect(mockExit).toHaveBeenCalled();
    });
  });

  describe('add', () => {
    it('adds members to team', async () => {
      const command = createTeamCommand();
      await command.parseAsync(['add', 'dev', '3', '4'], { from: 'user' });

      expect(mockAddTeamMembers).toHaveBeenCalledWith('dev', ['3', '4']);
    });
  });

  describe('remove', () => {
    it('removes member from team', async () => {
      mockRemoveTeamMember.mockReturnValue(true);

      const command = createTeamCommand();
      await command.parseAsync(['remove', 'dev', '3'], { from: 'user' });

      expect(mockConsoleLog).toHaveBeenCalledWith('Removed user 3 from team "dev".');
    });

    it('exits when member is not in team', async () => {
      mockRemoveTeamMember.mockReturnValue(false);

      const command = createTeamCommand();
      await command.parseAsync(['remove', 'dev', '99'], { from: 'user' });

      expect(mockExit).toHaveBeenCalled();
    });
  });
});
