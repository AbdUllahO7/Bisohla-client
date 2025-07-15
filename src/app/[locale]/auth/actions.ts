'use server';

import { allRoutes } from '@/constants/routes.constant';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { LoginDto } from '@/core/entities/models/auth/login.dto';
import {
  RegisterDto,
  RegisterResponse,
} from '@/core/entities/models/auth/register.dto';
import { ResetPasswordDto } from '@/core/entities/models/auth/reset-password.dto';
import { SendVerificationEmailDto } from '@/core/entities/models/auth/send-verification-email.dto';

import { getInjection } from '@/di/container';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export const signInAction = async (
  state: ApiResponse<LoginResponse>,
  formData: FormData,
): Promise<ApiResponse<LoginResponse>> => {
  const fields = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const authController = getInjection('IAuthController');

  const res = await authController.login(fields as LoginDto);

  if (res.success) {
    // Revalidate all paths and auth-related cache tags
    revalidatePath('/', 'layout');
    revalidateTag('auth');
    revalidateTag('session');
    revalidateTag('user');
    
    // Add a small delay to ensure cache invalidation completes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    redirect(allRoutes.user.children.homePage.path);
  }

  return res;
};

export const RegisterAction = async (
  state: ApiResponse<RegisterResponse>,
  formData: FormData,
): Promise<ApiResponse<RegisterResponse>> => {
  const fields = {
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
    name: formData.get('name'),
  };

  const authController = getInjection('IAuthController');

  const res = await authController.register(fields as RegisterDto);

  if (res.success) {
    // Revalidate all paths and auth-related cache tags
    revalidatePath('/', 'layout');
    revalidateTag('auth');
    revalidateTag('session');
    revalidateTag('user');
    
    // Add a small delay to ensure cache invalidation completes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    redirect(allRoutes.user.children.homePage.path);
  }

  return res;
};

export const logoutAction = async (): Promise<void> => {
  const authController = getInjection('IAuthController');
  
  try {
    // Call your logout API if you have one
    await authController.signOut?.();
  } catch (error) {
    console.error('Logout API error:', error);
  }
  
  // Revalidate all paths and clear auth cache
  revalidatePath('/', 'layout');
  revalidateTag('auth');
  revalidateTag('session');
  revalidateTag('user');
  
  // Add a small delay to ensure cache invalidation completes
  await new Promise(resolve => setTimeout(resolve, 100));
  
  redirect('/');
};

export const sendVerificationEmailAction = async (
  state: ApiResponse<SuccessResponseWithNoContent>,
  data: FormData,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
  const fields = {
    email: data.get('email'),
  };

  const authController = getInjection('IAuthController');

  const res = await authController.sendVerificationEmail(
    fields as SendVerificationEmailDto,
  );

  if (res.success) {
    // Revalidate email verification related paths
    revalidatePath('/auth/verify-email');
  }

  return res;
};

export const sendResetpasswordEmailAction = async (
  state: ApiResponse<SuccessResponseWithNoContent>,
  data: FormData,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
  const fields = {
    email: data.get('email'),
  };

  const authController = getInjection('IAuthController');

  const res = await authController.sendResetPasswordEmail(
    fields as SendVerificationEmailDto,
  );

  if (res.success) {
    // Revalidate password reset related paths
    revalidatePath('/auth/sign-in');
  }

  return res;
};

export const resetPasswordAction = async (
  state: ApiResponse<SuccessResponseWithNoContent>,
  data: FormData,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
  const fields = {
    password: data.get('password') as string,
    passwordConfirmation: data.get('passwordConfirmation') as string,
    token: data.get('token') as string,
  };

  const authController = getInjection('IAuthController');

  const res = await authController.resetPassword(fields as ResetPasswordDto);

  if (res.success) {
    // Revalidate auth paths after successful password reset
    redirect('/auth/sign-in')
  }

  return res;
};

export const validateResetPasswordTokenAction = async (
  token: string,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
  const authController = getInjection('IAuthController');

  const res = await authController.validateResetPasswordToken(token);

  if (res.success) {
    // No revalidation needed for token validation
  }

  return res;
};