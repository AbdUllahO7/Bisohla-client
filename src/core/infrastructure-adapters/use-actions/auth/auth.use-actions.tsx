'use client';

import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { useLocaleQuery } from '../common/use-locale-query';
import {
  checkAuth,
  checkPermission,
  checkRole,
} from '../../actions/auth/auth.actions';

export const useCheckAuth = () =>
  useLocaleQuery<ApiResponse<SuccessResponseWithNoContent>>({
    queryKey: ['check-auth-user'],
    queryFn: async () => await checkAuth(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useCheckRole = (role: string) =>
  useLocaleQuery<boolean>({
    queryKey: ['check-user-role', role],
    queryFn: async () => await checkRole(role),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useCheckPermission = (permission: string) =>
  useLocaleQuery<boolean>({
    queryKey: ['check-user-permission', permission],
    queryFn: async () => await checkPermission(permission),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
