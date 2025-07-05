'use server';

import { verifyZodFields } from './validation';
import { ZodError, ZodTypeAny } from 'zod';
import { ApiResponse, BaseApiResponse } from '../entities/api/success.response';
import { ValidationError } from '../entities/errors/validation-error';
import { AppError } from '../entities/errors/app-error';
import { Filter, FilterGroup, QueryParams } from '../entities/api/api';
import { getLocale } from 'next-intl/server';
import { BACKEND_URL } from './web/constants';
import { getSession } from './web/session';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig<
  T = Record<string, FormDataEntryValue | null> | FormData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  R = Record<string, unknown>,
> {
  url: string;
  method?: HttpMethod;
  body?: T;
  params?: QueryParams;
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
  message: string;
}

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRY = { attempts: 3, delay: 1000 };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (baseUrl: string, params?: QueryParams): string => {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  // Handle basic params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle search object format
      if (key === 'searchKey' && params.searchTerm !== undefined) {
        searchParams.append('search[key]', value.toString());
        searchParams.append(
          'search[term]',
          params.searchTerm?.toString() || '',
        );
        return;
      }

      // Handle simple arrays (like id array)
      if (Array.isArray(value) && key !== 'where' && key !== 'filterGroups') {
        value.forEach((item) => {
          searchParams.append(`${key}[]`, item.toString());
        });
        return;
      }

      // Handle where conditions array
      if (key === 'where' && Array.isArray(value)) {
        value.forEach((filter: Filter, index) => {
          searchParams.append(`where[${index}][field]`, filter.field);
          searchParams.append(`where[${index}][operator]`, filter.operator);

          if (Array.isArray(filter.value)) {
            filter.value.forEach((item, valueIndex) => {
              searchParams.append(
                `where[${index}][value][${valueIndex}]`,
                item?.toString() || '',
              );
            });
          } else {
            searchParams.append(
              `where[${index}][value]`,
              filter.value?.toString() || '',
            );
          }
        });
        return;
      }

      // Handle filter groups
      if (key === 'filterGroups' && Array.isArray(value)) {
        value.forEach((group: FilterGroup, groupIndex) => {
          // Add the group operator if it exists
          if (group.operator) {
            searchParams.append(
              `filterGroups[${groupIndex}][operator]`,
              group.operator,
            );
          }

          // Add each filter in the group
          group.filters.forEach((filter, filterIndex) => {
            const baseKey = `filterGroups[${groupIndex}][filters][${filterIndex}]`;

            searchParams.append(`${baseKey}[field]`, filter.field);
            searchParams.append(`${baseKey}[operator]`, filter.operator);

            if (Array.isArray(filter.value)) {
              filter.value.forEach((item, valueIndex) => {
                searchParams.append(
                  `${baseKey}[value][${valueIndex}]`,
                  item?.toString() || '',
                );
              });
            } else {
              searchParams.append(
                `${baseKey}[value]`,
                filter.value?.toString() || '',
              );
            }
          });
        });
        return;
      }

      // Handle standard key-value
      if (key !== 'searchTerm') {
        // Skip searchTerm as it's handled with searchKey
        searchParams.append(key, value.toString());
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

const createFetchError = (
  message: string,
  status?: number,
  errors?: Record<string, unknown>,
  path?: string,
  timestamp?: string,
  fields?: Record<string, undefined | string | number>,
): Error => {
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
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = Record<string, unknown>,
>({
  url,
  method = 'POST',
  body,
  params,
  validationSchema,
  headers = {},
  errorDefaultMessage = 'An unexpected error occurred',
  timeout = DEFAULT_TIMEOUT,
  retry = DEFAULT_RETRY,
}: RequestConfig<T, R>): Promise<BaseApiResponse> {
  try {
    let validatedBody = body;
    if (validationSchema && body) {
      const validationResult = await verifyZodFields(validationSchema, body);
      validatedBody = validationResult.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const locale = await getLocale();

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...(!(validatedBody instanceof FormData) && {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
        }),
        ...headers,
      },
      signal: controller.signal,
      body:
        validatedBody instanceof FormData
          ? validatedBody
          : validatedBody
          ? JSON.stringify(validatedBody)
          : undefined,
    };

    const fullUrl = buildUrl(BACKEND_URL + url, params);
    console.log('URL from api.ts: ', fullUrl);
    const response = await fetchWithRetry(fullUrl, fetchOptions, retry);
    clearTimeout(timeoutId);

    return await handleResponse<R>(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.reduce((acc, curr) => {
        const field = curr.path[0].toString();
        acc[field] = curr.message;
        return acc;
      }, {} as Record<string, string>);

      return {
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
        status: 400,
      };
    }

    if (error instanceof Error) {
      const fetchError = error as FetchError;
      return {
        success: false,
        message: fetchError.message || errorDefaultMessage,
        errors: fetchError.errors,
        status: fetchError.status || 500,
        path: fetchError.path,
        timestamp: fetchError.timestamp,
        fields: fetchError.fields,
      };
    }

    return {
      success: false,
      message: errorDefaultMessage,
      status: 500,
    };
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
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: errorMessage || error.message || 'An unexpected error occurred',
      status: 500,
    };
  }

  return {
    success: false,
    message: errorMessage || 'An unexpected error occurred',
    status: 500,
  };
};

// Type-safe convenience methods
export const postReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
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
  T = Record<string, FormDataEntryValue | null> | FormData,
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

// Helper function to create authenticated request config
const withAuth = async <T, R>(
  config: Omit<RequestConfig<T, R>, 'method'>,
  method: HttpMethod,
): Promise<RequestConfig<T, R>> => {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('No authentication token available');
  }

  return {
    ...config,
    method,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${session.accessToken}`,
    },
  };
};

export const postAuthReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest(await withAuth<T, R>(config, 'POST'));

export const getAuthReq = async <
  T extends Record<string, unknown>,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method' | 'body'>,
) => makeRequest(await withAuth<T, R>(config, 'GET'));

export const putAuthReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest(await withAuth<T, R>(config, 'PUT'));

export const patchAuthReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest(await withAuth<T, R>(config, 'PATCH'));

export const deleteAuthReq = async <
  T extends Record<string, unknown>,
  R = Record<string, unknown>,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest(await withAuth<T, R>(config, 'DELETE'));
