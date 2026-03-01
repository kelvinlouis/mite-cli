import { vi } from 'vitest';
import { ConfigError } from '../../utils/errors.js';

const mockGetApiKey = vi.fn();
const mockGetAccount = vi.fn();

vi.mock('../../config/index.js', () => ({
  config: {
    getApiKey: mockGetApiKey,
    getAccount: mockGetAccount,
  },
}));

const { createAuthenticatedClient } = await import('./shared.js');

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
