import { vi } from 'vitest';

const mockGetAccount = vi.fn();
const mockGetUsers = vi.fn();
const mockGetCustomers = vi.fn();
const mockGetProjects = vi.fn();
const mockSetApiKey = vi.fn();
const mockSetAccount = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('../../api/client.js', () => ({
  MiteClient: class {
    getAccount = mockGetAccount;
    getUsers = mockGetUsers;
    getCustomers = mockGetCustomers;
    getProjects = mockGetProjects;
  },
}));

vi.mock('../../config/index.js', () => ({
  config: {
    setApiKey: mockSetApiKey,
    setAccount: mockSetAccount,
  },
}));

const { createInitCommand } = await import('./init.js');

describe('init command', () => {
  beforeEach(() => {
    mockGetAccount.mockReset();
    mockGetUsers.mockReset();
    mockGetCustomers.mockReset();
    mockGetProjects.mockReset();
    mockSetApiKey.mockReset();
    mockSetAccount.mockReset();
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('saves credentials after validating account', async () => {
    mockGetAccount.mockResolvedValue({ account: { id: 1, name: 'test', title: 'Test Co' } });
    mockGetUsers.mockResolvedValue([]);
    mockGetCustomers.mockResolvedValue([]);
    mockGetProjects.mockResolvedValue([]);

    const command = createInitCommand();
    await command.parseAsync(['--api-key', 'my-key', '--account', 'testaccount'], {
      from: 'user',
    });

    expect(mockSetApiKey).toHaveBeenCalledWith('my-key');
    expect(mockSetAccount).toHaveBeenCalledWith('testaccount');
  });

  it('prints account title on successful connection', async () => {
    mockGetAccount.mockResolvedValue({ account: { id: 1, name: 'test', title: 'Test Co' } });
    mockGetUsers.mockResolvedValue([]);
    mockGetCustomers.mockResolvedValue([]);
    mockGetProjects.mockResolvedValue([]);

    const command = createInitCommand();
    await command.parseAsync(['--api-key', 'my-key', '--account', 'testaccount'], {
      from: 'user',
    });

    expect(mockConsoleLog).toHaveBeenCalledWith('Connected to account: Test Co');
  });

  it('prints fetched users', async () => {
    mockGetAccount.mockResolvedValue({ account: { id: 1, name: 'test', title: 'Test Co' } });
    mockGetUsers.mockResolvedValue([{ id: 1, name: 'Alice', role: 'admin' }]);
    mockGetCustomers.mockResolvedValue([]);
    mockGetProjects.mockResolvedValue([]);

    const command = createInitCommand();
    await command.parseAsync(['--api-key', 'my-key', '--account', 'testaccount'], {
      from: 'user',
    });

    expect(mockConsoleLog).toHaveBeenCalledWith('  1: Alice (admin)');
  });
});
