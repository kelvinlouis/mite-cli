import { vi } from 'vitest';

const mockGetMaskedConfig = vi.fn();
const mockSetUser = vi.fn();
const mockSetCustomer = vi.fn();
const mockSetProject = vi.fn();
const mockRemoveUser = vi.fn();
const mockRemoveCustomer = vi.fn();
const mockRemoveProject = vi.fn();
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('../../config/index.js', () => ({
  config: {
    getMaskedConfig: mockGetMaskedConfig,
    setUser: mockSetUser,
    setCustomer: mockSetCustomer,
    setProject: mockSetProject,
    removeUser: mockRemoveUser,
    removeCustomer: mockRemoveCustomer,
    removeProject: mockRemoveProject,
  },
}));

vi.mock('../output.js', () => ({
  formatConfigOutput: (data: unknown) => JSON.stringify(data),
}));

const { createConfigCommand } = await import('./config.js');

describe('config command', () => {
  beforeEach(() => {
    mockGetMaskedConfig.mockReset();
    mockSetUser.mockReset();
    mockSetCustomer.mockReset();
    mockSetProject.mockReset();
    mockRemoveUser.mockReset();
    mockRemoveCustomer.mockReset();
    mockRemoveProject.mockReset();
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('show prints masked config', async () => {
    mockGetMaskedConfig.mockReturnValue({ apiKey: 'abcd****' });

    const command = createConfigCommand();
    await command.parseAsync(['show'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('{"apiKey":"abcd****"}');
  });

  it('set-user maps user ID to abbreviation', async () => {
    const command = createConfigCommand();
    await command.parseAsync(['set-user', '123', 'HB'], { from: 'user' });

    expect(mockSetUser).toHaveBeenCalledWith('123', 'HB');
  });

  it('set-customer maps customer ID to abbreviation', async () => {
    const command = createConfigCommand();
    await command.parseAsync(['set-customer', '100', 'ACME'], { from: 'user' });

    expect(mockSetCustomer).toHaveBeenCalledWith('100', 'ACME');
  });

  it('set-project maps project ID to abbreviation', async () => {
    const command = createConfigCommand();
    await command.parseAsync(['set-project', '200', 'SS'], { from: 'user' });

    expect(mockSetProject).toHaveBeenCalledWith('200', 'SS');
  });

  it('remove-user removes existing mapping', async () => {
    mockRemoveUser.mockReturnValue(true);

    const command = createConfigCommand();
    await command.parseAsync(['remove-user', '123'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('Removed user mapping for 123');
  });

  it('remove-user reports when mapping not found', async () => {
    mockRemoveUser.mockReturnValue(false);

    const command = createConfigCommand();
    await command.parseAsync(['remove-user', '999'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith('No mapping found for user 999');
  });
});
