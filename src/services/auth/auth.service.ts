'use server';

import { ApiResponse } from '@/interfaces/api-response.interface';
import {
  RegisterFormSchema,
  RegisterFormValues,
} from '../../zod-schemas/auth/register-form-schema';
import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/session';
import { allRoutes } from '@/constants/routes.constant';
import { APP_URL } from '@/constants/constants';
import { fetchAuth } from '@/lib/fetch-auth';
import { revalidatePath } from 'next/cache';
import { postReq } from '@/lib/fetch';

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
