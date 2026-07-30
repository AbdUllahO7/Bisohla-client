'use server';

import { ApiResponse } from '@/core/entities/interfaces/api-response.interface';
import {
  RegisterFormSchema,
  RegisterFormValues,
} from '@/core/entities/models/auth/register-form-schema';
import { redirect } from 'next/navigation';
import { deleteSession, updateTokens } from '@/core/lib/web/session';
import { allRoutes } from '@/constants/routes.constant';
import { revalidatePath } from 'next/cache';
import { postReq, postAuthReq } from '@/core/lib/api';
import { BACKEND_URL } from '@/core/lib/web/constants';

export const handleRegister = async (
  state: ApiResponse<RegisterFormValues>,
  data: FormData,
) => {
  const fields = {
    email: data.get('email') as string,
    password: data.get('password') as string,
    passwordConfirmation: data.get('passwordConfirmation') as string,
    name: data.get('name') as string,
  };

  const res = await postReq<typeof fields, RegisterFormValues>({
    url: '/auth/register',
    body: fields,
    validationSchema: RegisterFormSchema,
    errorDefaultMessage: 'Failed to register.',
  });

  // If there's an error (validation or API), preserve the form data
  // BUT don't preserve passwords for security
  if (!res.success) {
    return {
      ...res,
      data: {
        email: fields.email,
        name: fields.name,
        password: '', // Don't preserve password
        passwordConfirmation: '', // Don't preserve password confirmation
      } as RegisterFormValues,
    };
  }

  // If successful, include the email and name for the success screen
  if (res.success) {
    //TODO: send verification email
    return {
      ...res,
      data: {
        email: fields.email,
        name: fields.name,
        password: '',
        passwordConfirmation: '',
      } as RegisterFormValues,
    };
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
