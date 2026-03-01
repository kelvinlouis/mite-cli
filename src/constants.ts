export const DEFAULT_PERIOD = 'this_week';
export const DEFAULT_GROUP_BY = 'user,project,service';
export const EMPTY_CELL = '-';
export const MAX_CELL_LENGTH = 80;
export const CLI_VERSION = '1.0.0';
export const USER_AGENT = 'mite-cli/1.0.0';
export const MITE_BASE_URL_TEMPLATE = 'https://{account}.mite.de';
export const API_KEY_VISIBLE_CHARS = 4;
export const API_KEY_MASK = '****';

export const VALID_GROUP_FIELDS = ['user', 'customer', 'project', 'service'] as const;
export type GroupField = (typeof VALID_GROUP_FIELDS)[number];

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
} as const;
