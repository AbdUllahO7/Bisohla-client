export class AppError extends Error {
  constructor(
    public readonly details: {
      message: string;
      status?: number;
      errors?: Record<string, unknown>;
      path?: string;
      timestamp?: string;
      fields?: Record<string, unknown>;
    },
  ) {
    super(details.message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.name = 'AppError';
    this.status = details.status || 400;
    this.errors = details.errors;
    this.path = details.path;
    this.timestamp = details.timestamp;
    this.fields = details.fields;
  }

  readonly status: number;
  readonly errors?: Record<string, unknown>;
  readonly path?: string;
  readonly timestamp?: string;
  readonly fields?: Record<string, unknown>;
}
