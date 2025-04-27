import { INotificationController } from '@/core/application/controllers/notifications/notifications.controller.interface';
import { INotificationUseCase } from '@/core/application/use-cases/notifications/notifications.use-case.interface';
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
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { catchClientRequest } from '@/core/lib/error';

export class NotificationsController implements INotificationController {
  constructor(protected readonly notificationUseCase: INotificationUseCase) {}
  async createUserNotification(
    dto: CreateUserNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    try {
      return await this.notificationUseCase.createUserNotification(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async createMultiUserNotification(
    dto: CreateMultiUserNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    try {
      return await this.notificationUseCase.createMultiUserNotification(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async createGroupNotification(
    dto: CreateGroupNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    try {
      return await this.notificationUseCase.createGroupNotification(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async createTemplatedNotification(
    dto: CreateTemplatedNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    try {
      return await this.notificationUseCase.createTemplatedNotification(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async createBroadcastNotification(
    dto: CreateBroadcastNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    try {
      return await this.notificationUseCase.createBroadcastNotification(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async updateNotificationStatus(
    dto: UpdateNotificationStatusDto,
  ): Promise<ApiResponse<Notification>> {
    try {
      return await this.notificationUseCase.updateNotificationStatus(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async getUserNotifications(
    userId: number,
    query: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>> {
    try {
      return await this.notificationUseCase.getUserNotifications(userId, query);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async getUsersNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    try {
      return await this.notificationUseCase.getUsersNotifications(query);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async getMyNotficiations(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    try {
      return await this.notificationUseCase.getMyNotficiations(query);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async getAdminNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    try {
      return await this.notificationUseCase.getAdminNotifications(query);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async getNotificationById(id: number): Promise<ApiResponse<Notification>> {
    try {
      return await this.notificationUseCase.getNotificationById(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async deleteNotification(id: number): Promise<ApiResponse<boolean>> {
    try {
      return await this.notificationUseCase.deleteNotification(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async createTemplate(
    dto: CreateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>> {
    try {
      return await this.notificationUseCase.createTemplate(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async updateTemplate(
    id: number,
    dto: UpdateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>> {
    try {
      return await this.notificationUseCase.updateTemplate(id, dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async deleteTemplate(id: number): Promise<ApiResponse<boolean>> {
    try {
      return await this.notificationUseCase.deleteTemplate(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async getAllTemplates(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationTemplate>> {
    try {
      return await this.notificationUseCase.getAllTemplates(params);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async createGroup(
    dto: CreateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>> {
    try {
      return await this.notificationUseCase.createGroup(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async updateGroup(
    id: number,
    dto: UpdateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>> {
    try {
      return await this.notificationUseCase.updateGroup(id, dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async deleteGroup(id: number): Promise<ApiResponse<boolean>> {
    try {
      return await this.notificationUseCase.deleteGroup(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async addUsersToGroup(
    dto: AddUsersToGroupDto,
  ): Promise<ApiResponse<boolean>> {
    try {
      return await this.notificationUseCase.addUsersToGroup(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async removeUsersFromGroup(
    dto: RemoveUsersFromGroupDto,
  ): Promise<ApiResponse<boolean>> {
    try {
      return await this.notificationUseCase.removeUsersFromGroup(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async getAllGroups(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationGroup>> {
    try {
      return await this.notificationUseCase.getAllGroups(params);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async getGroupUsers(
    id: number,
    pageParams: { page: number; pageSize: number },
  ): Promise<PaginatedResponse<SelectUserDto>> {
    try {
      return await this.notificationUseCase.getGroupUsers(id, pageParams);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
}
