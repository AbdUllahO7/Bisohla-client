export interface ApiResponse<T = Record<string, unknown>> {
  data?: T;
  success: boolean;
  message: string;
  timestamp?: string;
  path?: string;
  errors?: string[] | Record<string, unknown>;
  stack?: string;
  fields?: Record<string, undefined | string | number>;
}

export const defaultActionState: ApiResponse = {
  data: undefined,
  success: true,
  message: '',
  timestamp: undefined,
  path: undefined,
  errors: {},
  stack: undefined,
  fields: {},
};
