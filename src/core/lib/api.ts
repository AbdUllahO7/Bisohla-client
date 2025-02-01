'use server';

import { BACKEND_URL } from '@/constants/constants';
import { ApiResponse } from '@/interfaces/api-response.interface';
import { verifyZodFields } from './validation';
import { ZodTypeAny } from 'zod';
import { ValidationError } from '@/interfaces/errors/validation.error';
import { AppError } from '@/interfaces/errors/app-error';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig<
  T = Record<string, FormDataEntryValue | null>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _R = Record<string, unknown>,
> {
  url: string;
  method?: HttpMethod;
  body?: T;
  validationSchema?: ZodTypeAny;
  headers?: Record<string, string>;
  errorDefaultMessage?: string;
  timeout?: number;
  retry?: {
    attempts: number;
    delay: number;
  };
}

interface FetchError extends Error {
  status?: number;
  errors?: Record<string, unknown>;
  path?: string;
  timestamp?: string;
  fields?: Record<string, undefined | string | number>;
}

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRY = { attempts: 3, delay: 1000 };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createFetchError = (
  message: string,
  status?: number,
  errors?: Record<string, unknown>,
  path?: string,
  timestamp?: string,
  fields?: Record<string, undefined | string | number>,
): FetchError => {
  const error = new Error(message) as FetchError;
  error.status = status;
  error.errors = errors;
  error.path = path;
  error.timestamp = timestamp;
  error.fields = fields;
  return error;
};

const handleResponse = async <T>(
  response: Response,
): Promise<ApiResponse<T>> => {
  const responseData = await response.json();

  if (!response.ok) {
    throw createFetchError(
      responseData.message || response.statusText,
      response.status,
      responseData.errors,
      responseData.path,
      responseData.timestamp,
      responseData.fields,
    );
  }

  return {
    success: true,
    data: responseData.data,
    message: responseData.message,
    status: response.status,
    timestamp: responseData.timestamp,
    path: responseData.path,
    fields: responseData.fields,
  };
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryConfig = DEFAULT_RETRY,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryConfig.attempts; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 503 && response.status !== 429) {
        return response;
      }
      throw createFetchError(
        `Service unavailable (attempt ${attempt + 1}/${retryConfig.attempts})`,
        response.status,
      );
    } catch (error) {
      lastError = error as Error;
      if (attempt < retryConfig.attempts - 1) {
        await sleep(retryConfig.delay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

export async function makeRequest<
  T = Record<string, FormDataEntryValue | null>,
  R = Record<string, unknown>,
>({
  url,
  method = 'POST',
  body,
  validationSchema,
  headers = {},
  errorDefaultMessage = 'An unexpected error occurred',
  timeout = DEFAULT_TIMEOUT,
  retry = DEFAULT_RETRY,
}: RequestConfig<T, R>): Promise<ApiResponse<R>> {
  try {
    let validatedBody = body;
    if (validationSchema && body) {
      const validationResult = await verifyZodFields(validationSchema, body);
      validatedBody = validationResult.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
      ...(validatedBody && { body: JSON.stringify(validatedBody) }),
    };

    const fullUrl = BACKEND_URL + url;
    const response = await fetchWithRetry(fullUrl, fetchOptions, retry);
    clearTimeout(timeoutId);

    return await handleResponse<R>(response);
  } catch (error) {
    return await catchActionRequest(error, errorDefaultMessage);
  }
}

export const catchActionRequest = async <T>(
  error: unknown,
  errorMessage?: string,
): Promise<ApiResponse<T>> => {
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
      fields: error.fields,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: errorMessage || error.message || 'An unexpected error occurred',
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
// Type-safe convenience methods
export const postReq = async <
  T extends Record<string, unknown>,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest<T, R>({ ...config, method: 'POST' });

export const getReq = async <
  T extends Record<string, unknown>,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method' | 'body'>,
) => makeRequest<T, R>({ ...config, method: 'GET' });

export const putReq = async <
  T extends Record<string, unknown>,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest<T, R>({ ...config, method: 'PUT' });

export const deleteReq = async <
  T extends Record<string, unknown>,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest<T, R>({ ...config, method: 'DELETE' });
