'use client';

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';

import {
  Notification,
  NotificationTemplate,
  NotificationGroup,
} from '@/core/entities/models/notifications/notifications.domain';

import {
  CreateUserNotificationDto,
  CreateMultiUserNotificationDto,
  CreateGroupNotificationDto,
  CreateTemplatedNotificationDto,
  CreateBroadcastNotificationDto,
  UpdateNotificationStatusDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  CreateNotificationGroupDto,
  UpdateNotificationGroupDto,
  AddUsersToGroupDto,
  RemoveUsersFromGroupDto,
} from '@/core/entities/models/notifications/notifications.zod.dto';

import { useMutation } from '@tanstack/react-query';

import {
  createUserNotification,
  createMultiUserNotification,
  createGroupNotification,
  createTemplatedNotification,
  createBroadcastNotification,
  updateNotificationStatus,
  getUserNotifications,
  getMyNotifications,
  getNotificationById,
  deleteNotification,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  getAllNotificationTemplates,
  createNotificationGroup,
  updateNotificationGroup,
  deleteNotificationGroup,
  addUsersToNotificationGroup,
  removeUsersFromNotificationGroup,
  getAllNotificationGroups,
  getAdminNotifications,
  getGroupUsers,
  getUsersNotifications,
} from '@/core/infrastructure-adapters/actions/admin/notifications.action';
import { useLocaleQuery } from '@/hooks/use-locale-query';
import { useSession } from '../auth/use-session';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';

// User Notification Hooks
export const useCreateUserNotification = () =>
  useMutation<ApiResponse<Notification>, Error, CreateUserNotificationDto>({
    mutationFn: async (dto) => await createUserNotification(dto),
    onError: (error) => {
      console.error('Failed to create user notification:', error);
    },
  });

export const useCreateMultiUserNotification = () =>
  useMutation<ApiResponse<Notification>, Error, CreateMultiUserNotificationDto>(
    {
      mutationFn: async (dto) => await createMultiUserNotification(dto),
      onError: (error) => {
        console.error('Failed to create multi-user notification:', error);
      },
    },
  );

export const useCreateGroupNotification = () =>
  useMutation<ApiResponse<Notification>, Error, CreateGroupNotificationDto>({
    mutationFn: async (dto) => await createGroupNotification(dto),
    onError: (error) => {
      console.error('Failed to create group notification:', error);
    },
  });

export const useCreateTemplatedNotification = () =>
  useMutation<ApiResponse<Notification>, Error, CreateTemplatedNotificationDto>(
    {
      mutationFn: async (dto) => await createTemplatedNotification(dto),
      onError: (error) => {
        console.error('Failed to create templated notification:', error);
      },
    },
  );

export const useCreateBroadcastNotification = () =>
  useMutation<ApiResponse<Notification>, Error, CreateBroadcastNotificationDto>(
    {
      mutationFn: async (dto) => await createBroadcastNotification(dto),
      onError: (error) => {
        console.error('Failed to create broadcast notification:', error);
      },
    },
  );

export const useUpdateNotificationStatus = () =>
  useMutation<ApiResponse<Notification>, Error, UpdateNotificationStatusDto>({
    mutationFn: async (dto) => await updateNotificationStatus(dto),
    onError: (error) => {
      console.error('Failed to update notification status:', error);
    },
  });

export const useGetUserNotifications = (
  userId: number,
  params: QueryParams,
) => {
  return useLocaleQuery<PaginatedResponse<Notification>>({
    queryKey: ['user-notifications', userId, params],
    queryFn: async () => await getUserNotifications(userId, params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetUsersNotifications = (params: QueryParams) => {
  return useLocaleQuery<PaginatedResponse<Notification>>({
    queryKey: ['user-notifications', params],
    queryFn: async () => await getUsersNotifications(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetMyNotifications = (params: QueryParams) => {
  const session = useSession();
  const { user } = session;

  return useLocaleQuery<PaginatedResponse<Notification>>({
    queryKey: ['my-notifications', user.id, params],
    queryFn: async () => await getMyNotifications(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user.id,
  });
};

export const useGetAdminNotifications = (params: QueryParams) => {
  return useLocaleQuery<PaginatedResponse<Notification>>({
    queryKey: ['admin-notifications', params],
    queryFn: async () => await getAdminNotifications(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetNotificationById = (id: number) => {
  return useLocaleQuery<ApiResponse<Notification>>({
    queryKey: ['notification', id],
    queryFn: async () => await getNotificationById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useDeleteNotification = () =>
  useMutation<ApiResponse<boolean>, Error, { id: number }>({
    mutationFn: async ({ id }) => await deleteNotification(id),
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    },
  });

// Notification Template Hooks
export const useCreateNotificationTemplate = () =>
  useMutation<
    ApiResponse<NotificationTemplate>,
    Error,
    CreateNotificationTemplateDto
  >({
    mutationFn: async (dto) => await createNotificationTemplate(dto),
    onError: (error) => {
      console.error('Failed to create notification template:', error);
    },
  });

export const useUpdateNotificationTemplate = () =>
  useMutation<
    ApiResponse<NotificationTemplate>,
    Error,
    { id: number; data: UpdateNotificationTemplateDto }
  >({
    mutationFn: async ({ id, data }) =>
      await updateNotificationTemplate(id, data),
    onError: (error) => {
      console.error('Failed to update notification template:', error);
    },
  });

export const useDeleteNotificationTemplate = () =>
  useMutation<ApiResponse<boolean>, Error, { id: number }>({
    mutationFn: async ({ id }) => await deleteNotificationTemplate(id),
    onError: (error) => {
      console.error('Failed to delete notification template:', error);
    },
  });

export const useGetAllNotificationTemplates = (params: QueryParams) => {
  return useLocaleQuery<PaginatedResponse<NotificationTemplate>>({
    queryKey: ['notification-templates', params],
    queryFn: async () => await getAllNotificationTemplates(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Notification Group Hooks
export const useCreateNotificationGroup = () =>
  useMutation<
    ApiResponse<NotificationGroup>,
    Error,
    CreateNotificationGroupDto
  >({
    mutationFn: async (dto) => await createNotificationGroup(dto),
    onError: (error) => {
      console.error('Failed to create notification group:', error);
    },
  });

export const useUpdateNotificationGroup = () =>
  useMutation<
    ApiResponse<NotificationGroup>,
    Error,
    { id: number; data: UpdateNotificationGroupDto }
  >({
    mutationFn: async ({ id, data }) => await updateNotificationGroup(id, data),
    onError: (error) => {
      console.error('Failed to update notification group:', error);
    },
  });

export const useDeleteNotificationGroup = () =>
  useMutation<ApiResponse<boolean>, Error, { id: number }>({
    mutationFn: async ({ id }) => await deleteNotificationGroup(id),
    onError: (error) => {
      console.error('Failed to delete notification group:', error);
    },
  });

export const useAddUsersToNotificationGroup = () =>
  useMutation<ApiResponse<boolean>, Error, AddUsersToGroupDto>({
    mutationFn: async (dto) => await addUsersToNotificationGroup(dto),
    onError: (error) => {
      console.error('Failed to add users to notification group:', error);
    },
  });

export const useRemoveUsersFromNotificationGroup = () =>
  useMutation<ApiResponse<boolean>, Error, RemoveUsersFromGroupDto>({
    mutationFn: async (dto) => await removeUsersFromNotificationGroup(dto),
    onError: (error) => {
      console.error('Failed to remove users from notification group:', error);
    },
  });

export const useGetAllNotificationGroups = (params: QueryParams) => {
  return useLocaleQuery<PaginatedResponse<NotificationGroup>>({
    queryKey: ['notification-groups', params],
    queryFn: async () => await getAllNotificationGroups(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetGroupUsers = (
  id: number,
  pageParams: { page: number; pageSize: number },
) => {
  return useLocaleQuery<PaginatedResponse<SelectUserDto>>({
    queryKey: ['users-groups', pageParams],
    queryFn: async () => await getGroupUsers(id, pageParams),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
