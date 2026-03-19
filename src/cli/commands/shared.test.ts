import { vi } from 'vitest';
import { Command } from 'commander';
import { ConfigError } from '../../utils/errors.js';

const mockGetApiKey = vi.fn();
const mockGetAccount = vi.fn();

vi.mock('../../config/index.js', () => ({
  config: {
    getApiKey: mockGetApiKey,
    getAccount: mockGetAccount,
  },
}));

const { createAuthenticatedClient, addDangerouslySkipAliasOption } = await import('./shared.js');

describe('createAuthenticatedClient', () => {
  it('throws ConfigError when API key is not set', () => {
    mockGetApiKey.mockReturnValue(undefined);
    expect(() => createAuthenticatedClient()).toThrow(ConfigError);
  });

  it('throws ConfigError when account is not set', () => {
    mockGetApiKey.mockReturnValue('test-key');
    mockGetAccount.mockReturnValue(undefined);
    expect(() => createAuthenticatedClient()).toThrow(ConfigError);
  });

  it('returns MiteClient when credentials are configured', () => {
    mockGetApiKey.mockReturnValue('test-key');
    mockGetAccount.mockReturnValue('testaccount');
    const client = createAuthenticatedClient();
    expect(client).toBeDefined();
  });
});

describe('addDangerouslySkipAliasOption', () => {
  it('adds --dangerously-skip-alias option to a command', () => {
    const cmd = addDangerouslySkipAliasOption(new Command('test'));
    cmd.parse(['--dangerously-skip-alias'], { from: 'user' });
    expect(cmd.opts().dangerouslySkipAlias).toBe(true);
  });

  it('defaults to false when flag is not provided', () => {
    const cmd = addDangerouslySkipAliasOption(new Command('test'));
    cmd.parse([], { from: 'user' });
    expect(cmd.opts().dangerouslySkipAlias).toBeUndefined();
  });
});
