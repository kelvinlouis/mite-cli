export interface ConfigSchema {
  apiKey?: string;
  account?: string;
  users?: Record<string, string>;
  customers?: Record<string, string>;
  projects?: Record<string, string>;
  teams?: Record<string, string[]>;
}
