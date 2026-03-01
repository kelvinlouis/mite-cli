import {
  DEFAULT_PERIOD,
  DEFAULT_GROUP_BY,
  EMPTY_CELL,
  MAX_CELL_LENGTH,
  CLI_VERSION,
  USER_AGENT,
  MITE_BASE_URL_TEMPLATE,
  API_KEY_VISIBLE_CHARS,
  API_KEY_MASK,
  HTTP_STATUS,
  VALID_GROUP_FIELDS,
} from './constants.js';

describe('constants', () => {
  it('DEFAULT_PERIOD is this_week', () => {
    expect(DEFAULT_PERIOD).toBe('this_week');
  });

  it('DEFAULT_GROUP_BY includes user, project, service', () => {
    expect(DEFAULT_GROUP_BY).toBe('user,project,service');
  });

  it('EMPTY_CELL is a dash', () => {
    expect(EMPTY_CELL).toBe('-');
  });

  it('MAX_CELL_LENGTH is 80', () => {
    expect(MAX_CELL_LENGTH).toBe(80);
  });

  it('CLI_VERSION is defined', () => {
    expect(CLI_VERSION).toBeDefined();
  });

  it('USER_AGENT contains mite-cli', () => {
    expect(USER_AGENT).toContain('mite-cli');
  });

  it('MITE_BASE_URL_TEMPLATE contains account placeholder', () => {
    expect(MITE_BASE_URL_TEMPLATE).toContain('{account}');
  });

  it('API_KEY_VISIBLE_CHARS is 4', () => {
    expect(API_KEY_VISIBLE_CHARS).toBe(4);
  });

  it('API_KEY_MASK is ****', () => {
    expect(API_KEY_MASK).toBe('****');
  });

  it('HTTP_STATUS.UNAUTHORIZED is 401', () => {
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
  });

  it('HTTP_STATUS.NOT_FOUND is 404', () => {
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
  });

  it('VALID_GROUP_FIELDS contains user, customer, project, service', () => {
    expect(VALID_GROUP_FIELDS).toEqual(['user', 'customer', 'project', 'service']);
  });
});
