import type { MiteClient } from '../api/client.js';
import { config } from '../config/index.js';
import { ValidationError } from '../utils/errors.js';

function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

function resolveAbbreviation(token: string): string | undefined {
  const lowerToken = token.toLowerCase();
  const users = config.getUsers();
  for (const [id, abbreviation] of Object.entries(users)) {
    if (abbreviation.toLowerCase() === lowerToken) {
      return id;
    }
  }
  return undefined;
}

export async function resolveUserIds(client: MiteClient, input: string): Promise<string> {
  const tokens = input.split(',').map((t) => t.trim());

  // First pass: resolve numeric IDs and config abbreviations
  const resolved: (string | null)[] = tokens.map((token) => {
    if (isNumeric(token)) {
      return token;
    }
    return resolveAbbreviation(token) ?? null;
  });

  const needsApi = resolved.some((r) => r === null);

  if (!needsApi) {
    return (resolved as string[]).join(',');
  }

  const users = await client.getUsers();

  const final = tokens.map((token, i) => {
    if (resolved[i] !== null) {
      return resolved[i] as string;
    }

    const lowerToken = token.toLowerCase();
    const matches = users.filter((u) => u.name.toLowerCase().includes(lowerToken));

    if (matches.length === 0) {
      throw new ValidationError(`No user found matching "${token}"`);
    }

    if (matches.length > 1) {
      const suggestions = matches.map((u) => `${u.name} (${u.id})`).join(', ');
      throw new ValidationError(`Multiple users match "${token}": ${suggestions}`);
    }

    return String(matches[0].id);
  });

  return final.join(',');
}
