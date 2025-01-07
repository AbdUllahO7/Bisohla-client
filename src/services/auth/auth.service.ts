'use server';

import { ApiResponse } from '@/interfaces/api-response.interface';
import { loginFormSchema } from '@/zod-schemas/auth/login-form-schema';
import {
  RegisterFormSchema,
  RegisterFormValues,
} from '../../zod-schemas/auth/register-form-schema';
import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';
import { allRoutes } from '@/constants/routes.constant';
import { APP_URL } from '@/constants/constants';
import { fetchAuth } from '@/lib/fetch-auth';
import { revalidatePath } from 'next/cache';
import { postReq } from '@/lib/fetch';
import { sendVerificationEmailSchema } from '@/zod-schemas/auth/send-verification-email.schema';
import { ResetPasswordSchema } from '@/zod-schemas/auth/reset-password.schem';

export const handleRegister = async (
  state: ApiResponse<RegisterFormValues>,
  data: FormData,
) => {
  const fields = {
    email: data.get('email'),
    password: data.get('password'),
    passwordConfirmation: data.get('passwordConfirmation'),
    name: data.get('name'),
  };

  const res = await postReq<typeof fields, RegisterFormValues>({
    url: '/auth/register',
    body: fields,
    validationSchema: RegisterFormSchema,
    errorDefaultMessage: 'Failed to register.',
  });

  if (res.success) {
    //TODO: send verification email
  }

  return res;
};

// services/auth/auth.service.ts
export const handleLogin = async (
  state: ApiResponse<LoginResponse>,
  formData: FormData,
): Promise<ApiResponse<LoginResponse>> => {
  const fields = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const res = await postReq<typeof fields, LoginResponse>({
    url: '/auth/login',
    body: fields,
    validationSchema: loginFormSchema,
    errorDefaultMessage: 'Failed to login.',
  });

  if (res.success && res.data) {
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
    redirect(allRoutes.user.children.dashboard.path);
  }
  return res;
};

export const handleSendVerificationEmail = async (
  state: ApiResponse<SendEmailVerificationResponse>,
  data: FormData,
) => {
  const fields = {
    email: data.get('email'),
  };

  const res = await postReq<typeof fields, SendEmailVerificationResponse>({
    url: '/auth/send-verification-email',
    body: fields,
    validationSchema: sendVerificationEmailSchema,
    errorDefaultMessage: 'Failed to send verification email.',
  });

  return res;
};

export const handleSendResetPasswordEmail = async (
  state: ApiResponse<SendEmailResponse>,
  data: FormData,
) => {
  const fields = {
    email: data.get('email'),
  };

  const res = await postReq<typeof fields, SendEmailResponse>({
    url: '/auth/send-reset-password-email',
    body: fields,
    validationSchema: sendVerificationEmailSchema,
    errorDefaultMessage: 'Failed to send verification email.',
  });

  return res;
};

export const validateResetPasswordToken = async (token: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fields = {};
  const res = await postReq<typeof fields, ResetPasswordResponse>({
    url: `/auth/check-reset-password-token?token=${token}`,
    errorDefaultMessage: 'Failed to send verification email.',
  });

  return res;
};

export const handleResetPassword = async (
  state: ApiResponse<ResetPasswordResponse>,
  data: FormData,
) => {
  const fields = {
    password: data.get('password') as string,
    passwordConfirmation: data.get('passwordConfirmation') as string,
  };

  const res = await postReq<typeof fields, ResetPasswordResponse>({
    url: `/auth/reset-password-from-client?token=${data.get('token')}`,
    body: fields,
    validationSchema: ResetPasswordSchema,
    errorDefaultMessage: 'Failed to send verification email.',
  });

  return res;
};

export const handleSignout = async () => {
  const res = await fetchAuth({
    url: '/auth/signout',
    method: 'POST',
  });

  if (res.success) {
    await deleteSession();
  }

  revalidatePath('/', 'layout');
  revalidatePath('/', 'page');
  redirect(allRoutes.home.path);
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
    console.warn('Refresh token error:', error);
    await deleteSession();

    throw error;
  }
};
