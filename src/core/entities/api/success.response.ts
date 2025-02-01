export interface SuccessResponseWithNoContent {
  message: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  data?: T;
  success: boolean;
  message: string;
  timestamp?: string;
  path?: string;
  errors?: Record<string, unknown>; // Changed from string[] | Record<string, unknown>
  stack?: string;
  fields?: Record<string, string | number | undefined>;
  status?: number;
}

export const defaultActionState = {
  success: true,
  message: '',
};
