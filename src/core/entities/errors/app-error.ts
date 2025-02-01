export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly errors?: Record<string, unknown>,
    public readonly path?: string,
    public readonly timestamp?: string,
    public readonly fields?: Record<string, string | number | undefined>,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
