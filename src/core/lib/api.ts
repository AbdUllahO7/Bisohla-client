/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { verifyZodFields } from './validation';
import { ZodError, ZodTypeAny } from 'zod';
import { ApiResponse } from '../entities/api/success.response';
import { ValidationError } from '../entities/errors/validation-error';
import { AppError } from '../entities/errors/app-error';
import { SessionExpiredError } from '../entities/errors/session-expired-error';
import { QueryParams } from '../entities/api/api';
import { getLocale } from 'next-intl/server';
import { BACKEND_URL } from './web/constants';
import { getForwardedFor } from './web/client-ip';
import { canPersistSession, getSession } from './web/session';
import { handleRefreshToken } from '@/services/auth/auth.service';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig<
  T = Record<string, FormDataEntryValue | null> | FormData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  R = any,
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
  skipAuth?: boolean;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  cache?: RequestCache;
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

const JSON_PARAM_KEYS: ReadonlySet<string> = new Set(['where', 'filterGroups']);

const buildUrl = (baseUrl: string, params?: QueryParams): string => {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (JSON_PARAM_KEYS.has(key)) {
      if (Array.isArray(value) && value.length === 0) continue;
      searchParams.set(key, JSON.stringify(value));
      continue;
    }

    if (Array.isArray(value)) {
      searchParams.set(key, value.map((v) => String(v)).join(','));
      continue;
    }

    if (typeof value === 'object') {
      searchParams.set(key, JSON.stringify(value));
      continue;
    }

    searchParams.set(key, String(value));
  }

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

/**
 * Turns a thrown `FetchError`/`ZodError`/unknown into the resolved failure
 * shape callers expect. Shared by the initial response handling and the outer
 * catch so a 401 is a VALUE at the point the refresh decision is made — when
 * `handleResponse` was allowed to throw past that point, the refresh block below
 * was unreachable and the site never refreshed a token at all.
 */
const toFailureResponse = <R>(
  error: unknown,
  errorDefaultMessage: string,
): ApiResponse<R> => {
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
};

// A timeout or a 503 is AMBIGUOUS, not a failure — the server may well have
// applied the write. Only replay methods that are safe to apply twice.
const IDEMPOTENT_METHODS: ReadonlySet<HttpMethod> = new Set(['GET']);

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryConfig = DEFAULT_RETRY,
): Promise<Response> {
  let lastError: Error | null = null;
  const method = (options.method as HttpMethod) ?? 'GET';
  const attempts = IDEMPOTENT_METHODS.has(method) ? retryConfig.attempts : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 503 && response.status !== 429) {
        return response;
      }
      throw createFetchError(
        `Service unavailable (attempt ${attempt + 1}/${attempts})`,
        response.status,
      );
    } catch (error) {
      lastError = error as Error;
      if (attempt < attempts - 1) {
        await sleep(retryConfig.delay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

export async function makeRequest<
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = any,
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
  skipAuth = false,
  next,
  cache,
}: RequestConfig<T, R>): Promise<ApiResponse<R>> {
  try {
    let validatedBody = body;
    if (validationSchema && body) {
      const validationResult = await verifyZodFields(validationSchema, body);
      validatedBody = validationResult.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const locale = await getLocale();
    const forwardedFor = await getForwardedFor();

    // Check if the endpoint is a pre-auth or public auth endpoint
    const isPreAuthEndpoint =
      url.startsWith('/auth/login') ||
      url.startsWith('/auth/register') ||
      url.startsWith('/auth/refresh') ||
      url.includes('password') ||
      url.includes('verify');
    const shouldSkipAuth = skipAuth || isPreAuthEndpoint;

    // Opportunistically attach Bearer token if session exists and skipAuth is false
    let authHeader = headers.Authorization;
    let authHeaderAttached = !!authHeader;
    let currentSession = null;

    if (!authHeader && !shouldSkipAuth) {
      currentSession = await getSession();
      if (currentSession?.accessToken) {
        authHeader = `Bearer ${currentSession.accessToken}`;
        authHeaderAttached = true;
      }
    }

    /**
     * CAUTION: Next.js Fetch Caching & Cross-User Data Leaks
     * Requests in this helper automatically attach per-user Authorization Bearer tokens
     * when a session is active. Responses are user-specific (e.g. isFavorite, user profile data).
     * Never add static `revalidate` or `cache: 'force-cache'` to requests carrying per-user
     * Authorization headers, as this will cache personalized responses and leak user data across visitors.
     */
    const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
      method,
      headers: {
        ...(!(validatedBody instanceof FormData) && {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
          'x-app-source': 'web-app',
        }),
        // Pass the visitor's forwarding chain through, as any proxy does, so the
        // backend counts each user individually instead of seeing this server.
        // OUTSIDE the FormData guard above on purpose: uploads need it too, and
        // that guard is why FormData sends no Accept-Language / x-app-source.
        ...(forwardedFor && { 'x-forwarded-for': forwardedFor }),
        ...headers,
        ...(authHeader && { Authorization: authHeader }),
      },
      signal: controller.signal,
      body:
        validatedBody instanceof FormData
          ? validatedBody
          : validatedBody
          ? JSON.stringify(validatedBody)
          : undefined,
      ...(!authHeaderAttached && next && { next }),
      ...(!authHeaderAttached && cache && { cache }),
    };

    const fullUrl = buildUrl(BACKEND_URL + url, params);
    const response = await fetchWithRetry(fullUrl, fetchOptions, retry);
    clearTimeout(timeoutId);

    // `handleResponse` THROWS on any non-2xx, so this must be converted to a
    // value here — otherwise a 401 skips straight past the refresh block below
    // to the outer catch, which is exactly why refresh never ran.
    let apiResponse: ApiResponse<R>;
    try {
      apiResponse = await handleResponse<R>(response);
    } catch (error) {
      apiResponse = toFailureResponse<R>(error, errorDefaultMessage);
    }

    // Gate 401/403 refresh reaction ONLY on requests where an Auth token was actually sent
    if (
      !apiResponse.success &&
      authHeaderAttached &&
      !shouldSkipAuth &&
      (apiResponse.status === 401 ||
        apiResponse.status === 403 ||
        (apiResponse.status === 500 && apiResponse.message === 'Unauthorized'))
    ) {
      const sessionForRefresh = currentSession || (await getSession());
      // Refreshing where the rotated token cannot be written back would burn
      // it. Leave the 401 to the caller; a Server Action will refresh properly.
      if (sessionForRefresh?.refreshToken && (await canPersistSession())) {
        try {
          const newAccessToken = await handleRefreshToken(
            sessionForRefresh.refreshToken,
          );
          const retryFetchOptions: RequestInit = {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          };
          const retryResponse = await fetchWithRetry(
            fullUrl,
            retryFetchOptions,
            retry,
          );
          try {
            return await handleResponse<R>(retryResponse);
          } catch (error) {
            return toFailureResponse<R>(error, errorDefaultMessage);
          }
        } catch (refreshError) {
          // Only a rejected refresh TOKEN ends the session; a network drop or a
          // 5xx leaves it alone so the next request can try again.
          if (refreshError instanceof SessionExpiredError) {
            return { ...apiResponse, sessionExpired: true };
          }
          console.warn('Token refresh failed:', refreshError);
        }
      }
    }

    return apiResponse;
  } catch (error) {
    return toFailureResponse<R>(error, errorDefaultMessage);
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
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest<T, R>({ ...config, method: 'POST' });

export const getReq = async <
  T extends Record<string, unknown> = Record<string, unknown>,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method' | 'body'>,
) => makeRequest<T, R>({ ...config, method: 'GET' });

export const putReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest<T, R>({ ...config, method: 'PUT' });

export const deleteReq = async <
  T extends Record<string, unknown> = Record<string, unknown>,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeRequest<T, R>({ ...config, method: 'DELETE' });

const makeAuthRequest = async <T, R>(
  config: Omit<RequestConfig<T, R>, 'method'>,
  method: HttpMethod,
): Promise<ApiResponse<R>> => {
  const session = await getSession();

  if (!session?.accessToken) {
    return {
      success: false,
      message: 'No authentication token available',
      status: 401,
    };
  }

  return makeRequest<T, R>({
    ...config,
    method,
  });
};

export const postAuthReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeAuthRequest<T, R>(config, 'POST');

export const getAuthReq = async <
  T extends Record<string, unknown> = Record<string, unknown>,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method' | 'body'>,
) => makeAuthRequest<T, R>(config, 'GET');

export const putAuthReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeAuthRequest<T, R>(config, 'PUT');

export const patchAuthReq = async <
  T = Record<string, FormDataEntryValue | null> | FormData,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeAuthRequest<T, R>(config, 'PATCH');

export const deleteAuthReq = async <
  T extends Record<string, unknown> = Record<string, unknown>,
  R = any,
>(
  config: Omit<RequestConfig<T, R>, 'method'>,
) => makeAuthRequest<T, R>(config, 'DELETE');
