import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  Notification,
  NotificationTemplate,
  NotificationGroup,
  NotificationFilterOptions,
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
import { INotificationUseCase } from './notifications.use-case.interface';
import { INotificationService } from '../../services/notification.service.interface';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';

export class NotificationsUseCase implements INotificationUseCase {
  constructor(protected readonly notificationsService: INotificationService) {}

  async createUserNotification(
    dto: CreateUserNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return await this.notificationsService.createUserNotification(dto);
  }

  async createMultiUserNotification(
    dto: CreateMultiUserNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return await this.notificationsService.createMultiUserNotification(dto);
  }
  async createGroupNotification(
    dto: CreateGroupNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return await this.notificationsService.createGroupNotification(dto);
  }
  async createTemplatedNotification(
    dto: CreateTemplatedNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return await this.notificationsService.createTemplatedNotification(dto);
  }
  async createBroadcastNotification(
    dto: CreateBroadcastNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return await this.notificationsService.createBroadcastNotification(dto);
  }
  async updateNotificationStatus(
    dto: UpdateNotificationStatusDto,
  ): Promise<ApiResponse<Notification>> {
    return await this.notificationsService.updateNotificationStatus(dto);
  }
  async getUserNotifications(
    userId: number,
    query: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>> {
    return await this.notificationsService.getUserNotifications(userId, query);
  }
  async getUsersNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    return await this.notificationsService.getUsersNotifications(query);
  }
  async getMyNotficiations(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    return await this.notificationsService.getMyNotficiations(query);
  }

  async getAdminNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    return await this.notificationsService.getAdminNotifications(query);
  }

  async getNotificationById(id: number): Promise<ApiResponse<Notification>> {
    return await this.notificationsService.getNotificationById(id);
  }
  async deleteNotification(id: number): Promise<ApiResponse<boolean>> {
    return await this.notificationsService.deleteNotification(id);
  }
  async createTemplate(
    dto: CreateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>> {
    return await this.notificationsService.createTemplate(dto);
  }
  async updateTemplate(
    id: number,
    dto: UpdateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>> {
    return await this.notificationsService.updateTemplate(id, dto);
  }
  async deleteTemplate(id: number): Promise<ApiResponse<boolean>> {
    return await this.notificationsService.deleteTemplate(id);
  }
  async getAllTemplates(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationTemplate>> {
    return await this.notificationsService.getAllTemplates(params);
  }
  async createGroup(
    dto: CreateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>> {
    return await this.notificationsService.createGroup(dto);
  }
  async updateGroup(
    id: number,
    dto: UpdateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>> {
    return await this.notificationsService.updateGroup(id, dto);
  }
  async deleteGroup(id: number): Promise<ApiResponse<boolean>> {
    return await this.notificationsService.deleteGroup(id);
  }
  async addUsersToGroup(
    dto: AddUsersToGroupDto,
  ): Promise<ApiResponse<boolean>> {
    return await this.notificationsService.addUsersToGroup(dto);
  }
  async removeUsersFromGroup(
    dto: RemoveUsersFromGroupDto,
  ): Promise<ApiResponse<boolean>> {
    return await this.notificationsService.removeUsersFromGroup(dto);
  }
  async getAllGroups(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationGroup>> {
    return await this.notificationsService.getAllGroups(params);
  }

  async getGroupUsers(
    id: number,
    pageParams: { page: number; pageSize: number },
  ): Promise<PaginatedResponse<SelectUserDto>> {
    return await this.notificationsService.getGroupUsers(id, pageParams);
  }
}
