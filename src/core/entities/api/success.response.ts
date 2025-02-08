export interface SuccessResponseWithNoContent {
  message: string;
}

export interface SuccessCheckResponse {
  message: string;
  success: boolean;
}

// Base types
export interface BaseApiResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  path?: string;
  errors?: Record<string, unknown>;
  stack?: string;
  fields?: Record<string, string | number | undefined>;
  status?: number;
}

export interface ApiResponse<T = Record<string, unknown>>
  extends BaseApiResponse {
  data?: T;
}

export interface PaginationInfo<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> extends BaseApiResponse {
  data?: PaginationInfo<T>;
}

export const defaultActionState = {
  success: true,
  message: '',
};
