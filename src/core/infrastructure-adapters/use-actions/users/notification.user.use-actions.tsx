'use client';

import {
  Notification,
  NotificationFilterOptions,
} from '@/core/entities/models/notifications/notifications.domain';
import { useSession } from '../auth/use-session';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  getAuthUserMyNotifications,
  getAuthUserMyNotificationById,
  updateNotificationReadStatus,
} from '../../actions/users/notification.user.actions';
import { UpdateNotificationReadStatusDto } from '@/core/entities/models/notifications/notifications.zod.dto';
import { useMutation } from '@tanstack/react-query';
import { useLocaleQuery } from '../common/use-locale-query';

export const useGetAuthUserMyNotifications = (
  params: NotificationFilterOptions,
) => {
  const session = useSession();
  const { user } = session;

  return useLocaleQuery<PaginatedResponse<Notification>>({
    queryKey: ['auth-user-my-notifications', user.id],
    queryFn: async () => await getAuthUserMyNotifications(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetAuthUserMyNotificationById = (id: number) => {
  return useLocaleQuery<ApiResponse<Notification>>({
    queryKey: ['auth-user-my-notifications', id],
    queryFn: async () => await getAuthUserMyNotificationById(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useAddCarToFavorites = () =>
  useMutation<ApiResponse<boolean>, Error, UpdateNotificationReadStatusDto>({
    mutationFn: async (dto) => await updateNotificationReadStatus(dto),
    onError: (error) => {
      console.error('Failed to update notification read status:', error);
    },
  });
