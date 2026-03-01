import { MiteClient } from '../../api/client.js';
import { config } from '../../config/index.js';
import { ConfigError } from '../../utils/errors.js';

export function createAuthenticatedClient(): MiteClient {
  const apiKey = config.getApiKey();
  if (!apiKey) {
    throw new ConfigError('API key not configured. Run `mite init` first.');
  }
  const account = config.getAccount();
  if (!account) {
    throw new ConfigError('Account not configured. Run `mite init` first.');
  }
  return new MiteClient(account, apiKey);
}
