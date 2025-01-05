'use server';

import { handleRefreshToken } from '@/services/auth/auth.service';
import { getSession } from './session';
import { BACKEND_URL } from '@/constants/constants';
import { allRoutes } from '@/constants/routes.constant';
import { redirect } from 'next/navigation';
import { ApiResponse } from '@/interfaces/api-response.interface';

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
}: FetchAuthConfig): Promise<ApiResponse> {
  const session = await getSession();

  if (!session) {
    redirect(allRoutes.auth.children.signIn.path);
  }

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
    const fullUrl = BACKEND_URL + url;
    let response = await fetch(fullUrl, fetchOptions);

    if (response.status === 401 && session?.refreshToken) {
      const newAccessToken = await handleRefreshToken(session.refreshToken);
      response = await fetch(fullUrl, {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: responseData.message, // Using the exact message from backend
        errors: responseData.errors, // Using the exact errors from backend
        status: response.status,
      };
    }

    return responseData;
  } catch (error) {
    if (error instanceof Response) {
      // If it's a Response object, try to parse it
      try {
        const errorData = await error.json();
        return {
          success: false,
          message: errorData.message,
          errors: errorData.errors,
          status: error.status,
        };
      } catch {
        // If parsing fails, return the status text
        return {
          success: false,
          message: error.statusText,
          status: error.status,
        };
      }
    }

    // For network errors or other unexpected errors
    return {
      success: false,
      message: 'An unexpected error occurred',
      status: 500,
    };
  }
}
