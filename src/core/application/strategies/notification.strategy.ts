import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  Notification,
  NotificationFilterOptions,
  NotificationGroup,
  NotificationTemplate,
} from '@/core/entities/models/notifications/notifications.domain';
import {
  AddUsersToGroupDto,
  CreateBroadcastNotificationDto,
  CreateGroupNotificationDto,
  CreateMultiUserNotificationDto,
  CreateNotificationGroupDto,
  CreateNotificationTemplateDto,
  CreateTemplatedNotificationDto,
  CreateUserNotificationDto,
  RemoveUsersFromGroupDto,
  UpdateNotificationGroupDto,
  UpdateNotificationStatusDto,
  UpdateNotificationTemplateDto,
} from '@/core/entities/models/notifications/notifications.zod.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';

export interface NotificationStrategy {
  createUserNotification(
    dto: CreateUserNotificationDto,
  ): Promise<ApiResponse<Notification>>;
  createMultiUserNotification(
    dto: CreateMultiUserNotificationDto,
  ): Promise<ApiResponse<Notification>>;
  createGroupNotification(
    dto: CreateGroupNotificationDto,
  ): Promise<ApiResponse<Notification>>;
  createTemplatedNotification(
    dto: CreateTemplatedNotificationDto,
  ): Promise<ApiResponse<Notification>>;
  createBroadcastNotification(
    dto: CreateBroadcastNotificationDto,
  ): Promise<ApiResponse<Notification>>;
  updateNotificationStatus(
    dto: UpdateNotificationStatusDto,
  ): Promise<ApiResponse<Notification>>;
  getUserNotifications(
    userId: number,
    query: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>>;
  getUsersNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>>;
  getMyNotficiations(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>>;
  getAdminNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>>;
  getNotificationById(id: number): Promise<ApiResponse<Notification>>;
  deleteNotification(id: number): Promise<ApiResponse<boolean>>;
  createTemplate(
    dto: CreateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>>;
  updateTemplate(
    id: number,
    dto: UpdateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>>;
  deleteTemplate(id: number): Promise<ApiResponse<boolean>>;
  getAllTemplates(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationTemplate>>;
  createGroup(
    dto: CreateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>>;
  updateGroup(
    id: number,
    dto: UpdateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>>;
  deleteGroup(id: number): Promise<ApiResponse<boolean>>;
  addUsersToGroup(dto: AddUsersToGroupDto): Promise<ApiResponse<boolean>>;
  removeUsersFromGroup(
    dto: RemoveUsersFromGroupDto,
  ): Promise<ApiResponse<boolean>>;
  getAllGroups(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationGroup>>;
  getGroupUsers(
    id: number,
    pageParams: { page: number; pageSize: number },
  ): Promise<PaginatedResponse<SelectUserDto>>;
}
