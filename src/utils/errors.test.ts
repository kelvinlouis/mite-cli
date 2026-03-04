import { vi } from 'vitest';
import {
  CLIError,
  ConfigError,
  ConnectionError,
  NotFoundError,
  ValidationError,
  EXIT_CODES,
  handleError,
} from './errors.js';

describe('error classes', () => {
  it('CLIError sets message', () => {
    const err = new CLIError('test', EXIT_CODES.GENERAL_ERROR);
    expect(err.message).toBe('test');
  });

  it('CLIError sets exit code', () => {
    const err = new CLIError('test', EXIT_CODES.GENERAL_ERROR);
    expect(err.exitCode).toBe(1);
  });

  it('CLIError sets name', () => {
    const err = new CLIError('test', EXIT_CODES.GENERAL_ERROR);
    expect(err.name).toBe('CLIError');
  });

  it('CLIError preserves cause', () => {
    const cause = new Error('root cause');
    const err = new CLIError('wrapper', EXIT_CODES.GENERAL_ERROR, cause);
    expect(err.cause).toBe(cause);
  });

  it('ConfigError has correct exit code', () => {
    const err = new ConfigError('not configured');
    expect(err.exitCode).toBe(EXIT_CODES.CONFIG_ERROR);
  });

  it('ConfigError sets name', () => {
    const err = new ConfigError('not configured');
    expect(err.name).toBe('ConfigError');
  });

  it('ConfigError extends CLIError', () => {
    const err = new ConfigError('not configured');
    expect(err).toBeInstanceOf(CLIError);
  });

  it('ConnectionError has exit code 3', () => {
    const err = new ConnectionError('network failure');
    expect(err.exitCode).toBe(EXIT_CODES.CONNECTION_ERROR);
    expect(err.name).toBe('ConnectionError');
  });

  it('NotFoundError has exit code 4', () => {
    const err = new NotFoundError('not found');
    expect(err.exitCode).toBe(EXIT_CODES.NOT_FOUND);
    expect(err.name).toBe('NotFoundError');
  });

  it('ValidationError has exit code 5', () => {
    const err = new ValidationError('invalid input');
    expect(err.exitCode).toBe(EXIT_CODES.VALIDATION_ERROR);
    expect(err.name).toBe('ValidationError');
  });
});

describe('handleError', () => {
  it('sets exitCode for CLIError', () => {
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleError(new ConfigError('not configured'));

    expect(mockError).toHaveBeenCalledWith('Error: not configured');
    expect(process.exitCode).toBe(EXIT_CODES.CONFIG_ERROR);

    process.exitCode = undefined;
    mockError.mockRestore();
  });

  it('sets exitCode to 1 for generic errors', () => {
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleError(new Error('generic'));

    expect(mockError).toHaveBeenCalledWith('Error: generic');
    expect(process.exitCode).toBe(EXIT_CODES.GENERAL_ERROR);

    process.exitCode = undefined;
    mockError.mockRestore();
  });

  it('sets exitCode to 1 for non-Error values', () => {
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleError('string error');

    expect(mockError).toHaveBeenCalledWith('Error:', 'string error');
    expect(process.exitCode).toBe(EXIT_CODES.GENERAL_ERROR);

    process.exitCode = undefined;
    mockError.mockRestore();
  });

  it('shows stack trace in verbose mode for CLIError with cause', () => {
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const cause = new Error('root');
    handleError(new ConfigError('wrapped', cause), true);

    expect(mockError).toHaveBeenCalledWith('\nStack trace:');
    expect(mockError).toHaveBeenCalledWith(cause.stack);

    process.exitCode = undefined;
    mockError.mockRestore();
  });
});
