export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  CONFIG_ERROR: 2,
  CONNECTION_ERROR: 3,
  NOT_FOUND: 4,
  VALIDATION_ERROR: 5,
} as const;

export class CLIError extends Error {
  public exitCode: number;
  public override cause?: Error;

  constructor(message: string, exitCode: number, cause?: Error) {
    super(message);
    this.name = 'CLIError';
    this.exitCode = exitCode;
    this.cause = cause;
  }
}

export class ConfigError extends CLIError {
  constructor(message: string, cause?: Error) {
    super(message, EXIT_CODES.CONFIG_ERROR, cause);
    this.name = 'ConfigError';
  }
}

export class ConnectionError extends CLIError {
  constructor(message: string, cause?: Error) {
    super(message, EXIT_CODES.CONNECTION_ERROR, cause);
    this.name = 'ConnectionError';
  }
}

export class NotFoundError extends CLIError {
  constructor(message: string, cause?: Error) {
    super(message, EXIT_CODES.NOT_FOUND, cause);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends CLIError {
  constructor(message: string, cause?: Error) {
    super(message, EXIT_CODES.VALIDATION_ERROR, cause);
    this.name = 'ValidationError';
  }
}

export function handleError(error: unknown, verbose: boolean = false): never {
  if (error instanceof CLIError) {
    console.error(`Error: ${error.message}`);
    if (verbose && error.cause) {
      console.error('\nStack trace:');
      console.error(error.cause.stack);
    }
    process.exit(error.exitCode);
  }

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    if (verbose) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }

  console.error('Error:', error);
  process.exit(EXIT_CODES.GENERAL_ERROR);
}
