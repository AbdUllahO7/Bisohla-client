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
) => {
  const session = useSession();
  const { user } = session;

  return useLocaleQuery<PaginatedResponse<Notification>>({
    queryKey: ['auth-user-my-notifications', user.id, params],
    queryFn: async () => await getAuthUserMyNotifications(params),
    staleTime: 0,
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
