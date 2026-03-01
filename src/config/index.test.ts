import { vi, beforeEach } from 'vitest';

// Mock conf before importing config
vi.mock('conf', () => {
  const store: Record<string, unknown> = {};
  return {
    default: class MockConf {
      get(key: string) {
        return store[key];
      }
      set(key: string, value: unknown) {
        store[key] = value;
      }
      get store() {
        return { ...store };
      }
      clear() {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      }
    },
  };
});

// Re-import after mock
const { config } = await import('./index.js');

describe('ConfigManager', () => {
  beforeEach(() => {
    // Reset by setting values to undefined-like state
    // We'll just test the behavior
  });

  it('returns undefined for unset apiKey', () => {
    // Fresh start, apiKey is not set
    expect(config.getApiKey()).toBeUndefined();
  });

  it('sets and gets apiKey', () => {
    config.setApiKey('test-key-123');
    expect(config.getApiKey()).toBe('test-key-123');
  });

  it('sets and gets account', () => {
    config.setAccount('yooapps');
    expect(config.getAccount()).toBe('yooapps');
  });

  it('sets user mapping', () => {
    config.setUser('219528', 'HB');
    expect(config.getUsers()['219528']).toBe('HB');
  });

  it('gets user mappings', () => {
    config.setUser('219528', 'HB');
    config.setUser('219529', 'KL');
    expect(config.getUsers()['219529']).toBe('KL');
  });

  it('removes user mapping', () => {
    config.setUser('99999', 'XX');
    expect(config.removeUser('99999')).toBe(true);
    expect(config.removeUser('99999')).toBe(false);
  });

  it('sets customer mapping', () => {
    config.setCustomer('100', 'ACME');
    expect(config.getCustomers()['100']).toBe('ACME');
  });

  it('removes customer mapping', () => {
    config.setCustomer('100', 'ACME');
    expect(config.removeCustomer('100')).toBe(true);
  });

  it('sets project mapping', () => {
    config.setProject('200', 'SS');
    expect(config.getProjects()['200']).toBe('SS');
  });

  it('removes project mapping', () => {
    config.setProject('200', 'SS');
    expect(config.removeProject('200')).toBe(true);
  });

  it('abbreviates mapped user', () => {
    config.setUser('219528', 'HB');
    expect(config.abbreviateUser(219528)).toBe('HB');
    expect(config.abbreviateUser('219528')).toBe('HB');
  });

  it('falls back to User#ID for unmapped user', () => {
    expect(config.abbreviateUser(999)).toBe('User#999');
  });

  it('abbreviates mapped customer', () => {
    config.setCustomer('100', 'ACME');
    expect(config.abbreviateCustomer(100)).toBe('ACME');
  });

  it('falls back to Customer#ID for unmapped customer', () => {
    expect(config.abbreviateCustomer(888)).toBe('Customer#888');
  });

  it('abbreviates mapped project', () => {
    config.setProject('200', 'SS');
    expect(config.abbreviateProject(200)).toBe('SS');
  });

  it('falls back to Project#ID for unmapped project', () => {
    expect(config.abbreviateProject(777)).toBe('Project#777');
  });

  it('masks API key in output', () => {
    config.setApiKey('abcdefgh12345');
    const masked = config.getMaskedConfig();
    expect(masked.apiKey).toBe('abcd****');
  });
});
