'use server';

import { handleRefreshToken } from '@/services/auth.service';
import { getSession } from './session';

interface FetchAuthConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export async function fetchAuth({
  method = 'GET',
  url,
  body,
  headers = {},
}: FetchAuthConfig) {
  const session = await getSession();

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      Authorization: `Bearer ${session?.accessToken}`,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    // First attempt with current token
    const response = await fetch(url, fetchOptions);

    if (response.status === 401 && session?.refreshToken) {
      // Token expired, try to refresh
      const newAccessToken = await handleRefreshToken(session.refreshToken);

      // Retry original request with new token
      const retryResponse = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      if (!retryResponse.ok) {
        throw new Error(`HTTP error! status: ${retryResponse.status}`);
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
