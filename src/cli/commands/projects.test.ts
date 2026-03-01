import { vi } from 'vitest';

const mockGetProjects = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('./shared.js', () => ({
  createAuthenticatedClient: () => ({
    getProjects: mockGetProjects,
  }),
}));

vi.mock('../../privacy/index.js', () => ({
  sanitizeProject: (project: { id: number; name: string }) => ({
    id: project.id,
    name: project.name,
    customer_id: 1,
    customer_name: 'ACME',
    archived: false,
  }),
}));

vi.mock('../output.js', () => ({
  formatProjectsTable: (projects: unknown[]) => `table:${projects.length}`,
}));

const { createProjectsCommand } = await import('./projects.js');

describe('projects command', () => {
  beforeEach(() => {
    mockGetProjects.mockReset();
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
});
