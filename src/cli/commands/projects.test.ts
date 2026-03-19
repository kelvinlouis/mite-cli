import { vi } from 'vitest';

const mockGetProjects = vi.fn();
const mockSanitizeProject = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getProjects: mockGetProjects,
  }),
  addDangerouslySkipAliasOption: (cmd: unknown) =>
    (cmd as { option: Function }).option('--dangerously-skip-alias'),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeProject: (...args: unknown[]) => mockSanitizeProject(...args),
}));

vi.mock('../output.js', () => ({
  formatProjectsTable: (projects: unknown[]) => `table:${projects.length}`,
}));

const { createProjectsCommand } = await import('./projects.js');

describe('projects command', () => {
  beforeEach(() => {
    mockGetProjects.mockReset();
    mockSanitizeProject.mockReset();
    mockSanitizeProject.mockImplementation((project: { id: number; name: string }) => ({
      id: project.id,
      name: project.name,
      customer_id: 1,
      customer_name: 'ACME',
      archived: false,
    }));
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('fetches all projects and prints formatted table', async () => {
    mockGetProjects.mockResolvedValue([{ id: 20, name: 'My Project' }]);

    const command = createProjectsCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('table:1');
  });

  it('passes customer ID when --customer is provided', async () => {
    mockGetProjects.mockResolvedValue([]);

    const command = createProjectsCommand();
    await command.parseAsync(['--customer', '10'], { from: 'user' });

    expect(mockGetProjects).toHaveBeenCalledWith(10);
  });

  it('passes useRealNames when --dangerously-skip-alias is set', async () => {
    mockGetProjects.mockResolvedValue([{ id: 20, name: 'My Project' }]);

    const command = createProjectsCommand();
    await command.parseAsync(['--dangerously-skip-alias'], { from: 'user' });

    expect(mockSanitizeProject).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ useRealNames: true }),
    );
  });

  it('does not pass useRealNames without the flag', async () => {
    mockGetProjects.mockResolvedValue([{ id: 20, name: 'My Project' }]);

    const command = createProjectsCommand();
    await command.parseAsync([], { from: 'user' });

    expect(mockSanitizeProject).toHaveBeenCalledWith(expect.any(Object), undefined);
  });
});
