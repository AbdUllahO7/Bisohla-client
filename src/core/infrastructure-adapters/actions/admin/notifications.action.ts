'use server';

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
import { SelectUserDto } from '@/core/entities/models/users/users.dto';

import { getInjection } from '@/di/container';

// User Notification Actions
export const createUserNotification = async (
  dto: CreateUserNotificationDto,
): Promise<ApiResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.createUserNotification(dto);
  return res;
};

export const createMultiUserNotification = async (
  dto: CreateMultiUserNotificationDto,
): Promise<ApiResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.createMultiUserNotification(dto);
  return res;
};

export const createGroupNotification = async (
  dto: CreateGroupNotificationDto,
): Promise<ApiResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.createGroupNotification(dto);
  return res;
};

export const createTemplatedNotification = async (
  dto: CreateTemplatedNotificationDto,
): Promise<ApiResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.createTemplatedNotification(dto);
  return res;
};

export const createBroadcastNotification = async (
  dto: CreateBroadcastNotificationDto,
): Promise<ApiResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.createBroadcastNotification(dto);
  return res;
};

export const updateNotificationStatus = async (
  dto: UpdateNotificationStatusDto,
): Promise<ApiResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.updateNotificationStatus(dto);
  return res;
};

export const getUsersNotifications = async (
  query: QueryParams,
): Promise<PaginatedResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getUsersNotifications(query);
  return res;
};

export const getUserNotifications = async (
  userId: number,
  query: QueryParams,
): Promise<PaginatedResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getUserNotifications(userId, query);
  return res;
};

export const getMyNotifications = async (
  query: QueryParams,
): Promise<PaginatedResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getMyNotficiations(query);
  return res;
};

export const getAdminNotifications = async (
  query: QueryParams,
): Promise<PaginatedResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getAdminNotifications(query);
  return res;
};

export const getNotificationById = async (
  id: number,
): Promise<ApiResponse<Notification>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getNotificationById(id);
  return res;
};

export const deleteNotification = async (
  id: number,
): Promise<ApiResponse<boolean>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.deleteNotification(id);
  return res;
};

// Template Actions
export const createNotificationTemplate = async (
  dto: CreateNotificationTemplateDto,
): Promise<ApiResponse<NotificationTemplate>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.createTemplate(dto);
  return res;
};

export const updateNotificationTemplate = async (
  id: number,
  dto: UpdateNotificationTemplateDto,
): Promise<ApiResponse<NotificationTemplate>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.updateTemplate(id, dto);
  return res;
};

export const deleteNotificationTemplate = async (
  id: number,
): Promise<ApiResponse<boolean>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.deleteTemplate(id);
  return res;
};

export const getAllNotificationTemplates = async (
  params: QueryParams,
): Promise<PaginatedResponse<NotificationTemplate>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getAllTemplates(params);
  return res;
};

// Group Actions
export const createNotificationGroup = async (
  dto: CreateNotificationGroupDto,
): Promise<ApiResponse<NotificationGroup>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.createGroup(dto);
  return res;
};

export const updateNotificationGroup = async (
  id: number,
  dto: UpdateNotificationGroupDto,
): Promise<ApiResponse<NotificationGroup>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.updateGroup(id, dto);
  return res;
};

export const deleteNotificationGroup = async (
  id: number,
): Promise<ApiResponse<boolean>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.deleteGroup(id);
  return res;
};

export const addUsersToNotificationGroup = async (
  dto: AddUsersToGroupDto,
): Promise<ApiResponse<boolean>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.addUsersToGroup(dto);
  return res;
};

export const removeUsersFromNotificationGroup = async (
  dto: RemoveUsersFromGroupDto,
): Promise<ApiResponse<boolean>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.removeUsersFromGroup(dto);
  return res;
};

export const getAllNotificationGroups = async (
  params: QueryParams,
): Promise<PaginatedResponse<NotificationGroup>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getAllGroups(params);
  return res;
};

export const getGroupUsers = async (
  id: number,
  pageParams: { page: number; pageSize: number },
): Promise<PaginatedResponse<SelectUserDto>> => {
  const notificationController = getInjection('INotificationController');
  const res = await notificationController.getGroupUsers(id, pageParams);
  return res;
};
