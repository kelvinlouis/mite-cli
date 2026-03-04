import { vi } from 'vitest';
import type { MiteClient } from '../api/client.js';
import { resolveUserIds } from './resolve-users.js';
import { ValidationError } from '../utils/errors.js';
import { config } from '../config/index.js';

vi.mock('../config/index.js', () => ({
  config: {
    getUsers: vi.fn().mockReturnValue({}),
  },
}));

function createMockClient(users: Array<{ id: number; name: string }> = []): MiteClient {
  return {
    getUsers: vi.fn().mockResolvedValue(users),
  } as unknown as MiteClient;
}

describe('resolveUserIds', () => {
  beforeEach(() => {
    vi.mocked(config.getUsers).mockReturnValue({});
  });

  it('passes through numeric IDs without API call', async () => {
    const client = createMockClient();

    const result = await resolveUserIds(client, '123');

    expect(result).toBe('123');
    expect(client.getUsers).not.toHaveBeenCalled();
  });

  it('passes through multiple numeric IDs', async () => {
    const client = createMockClient();

    const result = await resolveUserIds(client, '123,456');

    expect(result).toBe('123,456');
    expect(client.getUsers).not.toHaveBeenCalled();
  });

  it('resolves a name to a user ID', async () => {
    const client = createMockClient([
      { id: 1, name: 'Hans Bildmeyer' },
      { id: 2, name: 'Maria Schmidt' },
    ]);

    const result = await resolveUserIds(client, 'Hans Bildmeyer');

    expect(result).toBe('1');
  });

  it('resolves names case-insensitively', async () => {
    const client = createMockClient([{ id: 1, name: 'Hans Bildmeyer' }]);

    const result = await resolveUserIds(client, 'hans bildmeyer');

    expect(result).toBe('1');
  });

  it('resolves partial name matches (substring)', async () => {
    const client = createMockClient([
      { id: 1, name: 'Hans Bildmeyer' },
      { id: 2, name: 'Maria Schmidt' },
    ]);

    const result = await resolveUserIds(client, 'Hans');

    expect(result).toBe('1');
  });

  it('handles mixed input of names and IDs', async () => {
    const client = createMockClient([{ id: 1, name: 'Hans Bildmeyer' }]);

    const result = await resolveUserIds(client, 'Hans,456');

    expect(result).toBe('1,456');
  });

  it('fetches users only once for multiple name lookups', async () => {
    const client = createMockClient([
      { id: 1, name: 'Hans Bildmeyer' },
      { id: 2, name: 'Maria Schmidt' },
    ]);

    await resolveUserIds(client, 'Hans,Maria');

    expect(client.getUsers).toHaveBeenCalledTimes(1);
  });

  it('throws when a name matches no users', async () => {
    const client = createMockClient([{ id: 1, name: 'Hans Bildmeyer' }]);

    await expect(resolveUserIds(client, 'Unknown')).rejects.toThrow(ValidationError);
    await expect(resolveUserIds(client, 'Unknown')).rejects.toThrow(
      'No user found matching "Unknown"',
    );
  });

  it('throws when a name matches multiple users', async () => {
    const client = createMockClient([
      { id: 1, name: 'Hans Bildmeyer' },
      { id: 2, name: 'Hans Mueller' },
    ]);

    await expect(resolveUserIds(client, 'Hans')).rejects.toThrow(ValidationError);
    await expect(resolveUserIds(client, 'Hans')).rejects.toThrow(
      'Multiple users match "Hans": Hans Bildmeyer (1), Hans Mueller (2)',
    );
  });

  it('trims whitespace from tokens', async () => {
    const client = createMockClient([{ id: 1, name: 'Hans Bildmeyer' }]);

    const result = await resolveUserIds(client, ' Hans , 456 ');

    expect(result).toBe('1,456');
  });

  describe('config abbreviations', () => {
    it('resolves abbreviation from config without API call', async () => {
      vi.mocked(config.getUsers).mockReturnValue({ '123': 'HB' });
      const client = createMockClient();

      const result = await resolveUserIds(client, 'HB');

      expect(result).toBe('123');
      expect(client.getUsers).not.toHaveBeenCalled();
    });

    it('resolves abbreviation case-insensitively', async () => {
      vi.mocked(config.getUsers).mockReturnValue({ '123': 'HB' });
      const client = createMockClient();

      const result = await resolveUserIds(client, 'hb');

      expect(result).toBe('123');
      expect(client.getUsers).not.toHaveBeenCalled();
    });

    it('handles mixed abbreviation and numeric ID without API call', async () => {
      vi.mocked(config.getUsers).mockReturnValue({ '123': 'HB' });
      const client = createMockClient();

      const result = await resolveUserIds(client, 'HB,456');

      expect(result).toBe('123,456');
      expect(client.getUsers).not.toHaveBeenCalled();
    });

    it('calls API only for tokens not matching abbreviations', async () => {
      vi.mocked(config.getUsers).mockReturnValue({ '123': 'HB' });
      const client = createMockClient([{ id: 2, name: 'Maria Schmidt' }]);

      const result = await resolveUserIds(client, 'HB,Maria');

      expect(result).toBe('123,2');
      expect(client.getUsers).toHaveBeenCalledTimes(1);
    });

    it('falls back to API when token matches no abbreviation', async () => {
      vi.mocked(config.getUsers).mockReturnValue({ '123': 'HB' });
      const client = createMockClient([{ id: 2, name: 'Maria Schmidt' }]);

      const result = await resolveUserIds(client, 'Maria');

      expect(result).toBe('2');
      expect(client.getUsers).toHaveBeenCalledTimes(1);
    });
  });
});
