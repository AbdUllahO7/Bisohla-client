import { ApiResponse } from '../entities/api/success.response';
import { AppError } from '../entities/errors/app-error';
import { ValidationError } from '../entities/errors/validation-error';

export const catchClientRequest = <T>(
  error: unknown,
  errorMessage?: string,
): ApiResponse<T> => {
  if (error instanceof ValidationError) {
    return {
      success: false,
      message: errorMessage || error.message,
      errors: error.errors,
      status: 400,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      message: errorMessage || error.message,
      errors: error.errors,
      status: error.status,
      path: error.path,
      timestamp: error.timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || errorMessage || 'An unexpected error occurred',
      status: 500,
    };
  }

  // Handle unknown errors
  return {
    success: false,
    message: errorMessage || 'An unexpected error occurred',
    status: 500,
  };
};
