'use server';

import { SuccessResponseWithNoContent } from '@/core/entities/api/success.response';
import { getInjection } from '@/di/container';
import { ApiResponse } from '@/interfaces/api-response.interface';

export const checkAuth = async (): Promise<
  ApiResponse<SuccessResponseWithNoContent>
> => {
  const controller = getInjection('IAuthController');

  const res = controller.checkAuth();

  return res;
};

export const checkRole = async (role: string): Promise<boolean> => {
  const controller = getInjection('IPermissionController');

  const res = await controller.checkRole(role);

  if (res.success && res.data?.success) return true;

  return false;
};

export const checkPermission = async (permission: string): Promise<boolean> => {
  const controller = getInjection('IPermissionController');

  const res = await controller.checkPermission(permission);

  if (res.success && res.data?.success) return true;

  return false;
};
