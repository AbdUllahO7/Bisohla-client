export interface FetchError extends Error {
  status?: number;
  errors?: Record<string, unknown>;
  path?: string;
  timestamp?: string;
  fields?: Record<string, undefined | string | number>;
}
