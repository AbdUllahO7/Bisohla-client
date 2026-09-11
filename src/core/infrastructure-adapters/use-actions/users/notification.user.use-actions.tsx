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
  markAllNotificationsAsRead,
} from '../../actions/users/notification.user.actions';
import { UpdateNotificationReadStatusDto } from '@/core/entities/models/notifications/notifications.zod.dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocaleQuery } from '../common/use-locale-query';

export const useGetAuthUserMyNotifications = (
  params: NotificationFilterOptions,
  options?: { enabled?: boolean },
) => {
  const session = useSession();
  const { user } = session;
  const isAuth = Boolean(user?.id && user.id > 0);

  return useLocaleQuery<PaginatedResponse<Notification>>({
    queryKey: ['auth-user-my-notifications', user.id, params],
    queryFn: async () => await getAuthUserMyNotifications(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: isAuth && (options?.enabled ?? true),
  });
};

export const useGetAuthUserMyNotificationById = (
  id: number,
  options?: { enabled?: boolean },
) => {
  const session = useSession();
  const { user } = session;
  const isAuth = Boolean(user?.id && user.id > 0);

  return useLocaleQuery<ApiResponse<Notification>>({
    queryKey: ['auth-user-my-notifications', id],
    queryFn: async () => await getAuthUserMyNotificationById(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: isAuth && Boolean(id) && (options?.enabled ?? true),
  });
};

export const useUpdateNotificationReadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<boolean>, Error, UpdateNotificationReadStatusDto>({
    mutationFn: async (dto) => await updateNotificationReadStatus(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user-my-notifications'] });
    },
    onError: (error) => {
      console.error('Failed to update notification read status:', error);
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ updatedCount: number }>, Error, void>({
    mutationFn: async () => await markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user-my-notifications'] });
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
    },
  });
};
