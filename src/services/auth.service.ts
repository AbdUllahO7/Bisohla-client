'use server';

import { ApiResponse } from '@/interfaces/api-response.interface';
import { postReq } from '@/lib/api.utils';
import { api } from '@/lib/axios';
import { loginFormSchema } from '@/zod-schemas/auth/login-form-schema';
import { RegisterFormSchema } from './../zod-schemas/auth/register-form-schema';
import { redirect } from 'next/navigation';
import { createSession } from '@/lib/session';
import { allRoutes } from '@/constants/routes.constant';
import { APP_URL } from '@/constants/constants';

export const handleRegister = async (state: ApiResponse, data: FormData) =>
  postReq({
    axiosInstance: api,
    path: '/auth/register',
    data: {
      email: data.get('email'),
      password: data.get('password'),
      name: data.get('name'),
    },
    validationSchema: RegisterFormSchema,
    errorDefaultMessage: 'Failed to register.',
  });

export const handleLogin = async (state: ApiResponse, formData: FormData) => {
  const fields = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const res = await postReq({
    axiosInstance: api,
    path: '/auth/login',
    data: fields,
    validationSchema: loginFormSchema,
    errorDefaultMessage: 'Failed to login.',
  });

  if (res.success) {
    console.log(res.data);
    await createSession({
      user: {
        id: res.data.id,
        name: res.data.name,
        roles: res.data.roles,
        permissions: res.data.permissions,
      },
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    });
    redirect(allRoutes.profile.path);
  }
  return res;
};

export const handleAdminLogin = async (
  state: ApiResponse,
  formData: FormData,
) => {
  const fields = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const res = await postReq({
    axiosInstance: api,
    path: '/admin/auth/login',
    data: fields,
    validationSchema: loginFormSchema,
    errorDefaultMessage: 'Failed to login.',
  });

  if (res.success) {
    console.log(res.data);
    await createSession({
      user: {
        id: res.data.id,
        name: res.data.name,
        roles: res.data.roles,
        permissions: res.data.permissions,
      },
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    });
    redirect(allRoutes.admin.dashboard.path);
  }
  return res;
};

// export const handleRefreshToken = async (oldRefreshToken: string) => {
//   try {
//     const res = await fetch(BACKEND_URL + '/auth/refresh', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ refresh: oldRefreshToken }),
//     });

//     if (!res.ok) {
//       throw new Error('Failed to refresh token from server');
//     }

//     const { accessToken, refreshToken } = (await res.json()).data;

//     if (accessToken && refreshToken) {
//       const updateRes = await api.post(APP_URL + '/api/auth/update-jwt', {
//         accessToken: accessToken,
//         refreshToken: refreshToken,
//       });
//       if (updateRes.status !== 200) {
//         throw new Error('Failed to update tokens');
//       }
//       console.log('Success Refresh Token from handleRefreshToken');
//       return accessToken;
//     }

//     throw new Error('Failed to refresh token');
//   } catch (error) {
//     console.error('Failed to refresh token from handleRefreshToken:', error);
//     throw error;
//   }
// };

export const handleRefreshToken = async (oldRefreshToken: string) => {
  try {
    // Create a single request to handle both token refresh and session update
    const res = await fetch(APP_URL + '/api/auth/update-jwt', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: oldRefreshToken }),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await res.json();
    return data.accessToken; // Return the new access token
  } catch (error) {
    console.error('Refresh token error:', error);

    throw error;
  }
};
