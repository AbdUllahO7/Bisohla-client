'use server';

import { ApiResponse } from '@/interfaces/api-response.interface';
import {
  RegisterFormSchema,
  RegisterFormValues,
} from '../../zod-schemas/auth/register-form-schema';
import { redirect } from 'next/navigation';
import { deleteSession, updateTokens } from '@/core/lib/web/session';
import { allRoutes } from '@/constants/routes.constant';
import { fetchAuth } from '@/lib/fetch-auth';
import { revalidatePath } from 'next/cache';
import { postReq } from '@/lib/fetch';
import { APP_URL, BACKEND_URL } from '@/core/lib/web/constants';

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

export const validateResetPasswordToken = async (token: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fields = {};
  const res = await postReq<typeof fields, ResetPasswordResponse>({
    url: `/auth/check-reset-password-token?token=${token}`,
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

export const handleRefreshToken = async (oldRefreshToken: string) => {
  try {
    const backendRes = await fetch(BACKEND_URL + '/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: oldRefreshToken }),
    });

    const responseData = await backendRes.json();


    // Check if the request was successful
    if (!backendRes.ok || !responseData.success) {
      throw new Error(responseData.message || 'Failed to refresh token');
    }

    // Extract tokens from the data object
    const { accessToken, refreshToken } = responseData.data;

    // Update the session with new tokens
    await updateTokens({ accessToken, refreshToken });

    return accessToken;
  } catch (error) {
    console.warn('Refresh token error:', error);
    await deleteSession();
    throw error;
  }
};
