import { INotificationService } from '@/core/application/services/notification.service.interface';
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
import {
  deleteAuthReq,
  getAuthReq,
  patchAuthReq,
  postAuthReq,
  putAuthReq,
} from '@/core/lib/api';

export class NotificationService implements INotificationService {
  path = '/admin/notifications';

  async createUserNotification(
    dto: CreateUserNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    const res = await postAuthReq<
      CreateUserNotificationDto,
      ApiResponse<Notification>
    >({
      url: this.path + '/user',
      body: dto,
    });

    return res;
  }

  async createMultiUserNotification(
    dto: CreateMultiUserNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    const res = await postAuthReq<
      CreateMultiUserNotificationDto,
      ApiResponse<Notification>
    >({
      url: this.path + '/multi-user',
      body: dto,
    });

    return res;
  }
  async createGroupNotification(
    dto: CreateGroupNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    const res = await postAuthReq<
      CreateGroupNotificationDto,
      ApiResponse<Notification>
    >({
      url: this.path + '/group',
      body: dto,
    });

    return res;
  }
  async createTemplatedNotification(
    dto: CreateTemplatedNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    const res = await postAuthReq<
      CreateTemplatedNotificationDto,
      ApiResponse<Notification>
    >({
      url: this.path + '/template',
      body: dto,
    });

    return res;
  }

  async createBroadcastNotification(
    dto: CreateBroadcastNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    const res = await postAuthReq<
      CreateBroadcastNotificationDto,
      ApiResponse<Notification>
    >({
      url: this.path + '/broadcast',
      body: dto,
    });

    return res;
  }
  async updateNotificationStatus(
    dto: UpdateNotificationStatusDto,
  ): Promise<ApiResponse<Notification>> {
    const res = await patchAuthReq<
      UpdateNotificationStatusDto,
      ApiResponse<Notification>
    >({
      url: this.path + '/status',
      body: dto,
    });

    return res;
  }
  async getUserNotifications(
    userId: number,
    query: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>> {
    const res = await getAuthReq<
      Record<string, unknown>,
      PaginatedResponse<Notification>
    >({
      url: this.path + '/user-notifications/' + userId,
      params: query,
    });

    return res;
  }

  async getUsersNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    const res = await postAuthReq<QueryParams, PaginatedResponse<Notification>>(
      {
        url: this.path + '/users-notifications',
        body: query,
      },
    );

    return res;
  }

  async getMyNotficiations(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    const res = await postAuthReq<QueryParams, PaginatedResponse<Notification>>(
      {
        url: this.path + '/my-notifications',
        body: query,
      },
    );

    return res;
  }

  async getAdminNotifications(
    query: QueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    const res = await postAuthReq<QueryParams, PaginatedResponse<Notification>>(
      {
        url: this.path + '/admin-notifications',
        body: query,
      },
    );

    return res;
  }

  async getNotificationById(id: number): Promise<ApiResponse<Notification>> {
    const res = await getAuthReq<
      Record<string, unknown>,
      ApiResponse<Notification>
    >({
      url: this.path + '/' + id,
    });

    return res;
  }
  async deleteNotification(id: number): Promise<ApiResponse<boolean>> {
    const res = await deleteAuthReq<
      Record<string, unknown>,
      ApiResponse<boolean>
    >({
      url: this.path + '/' + id,
    });

    return res;
  }

  async createTemplate(
    dto: CreateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>> {
    const res = await postAuthReq<
      CreateNotificationTemplateDto,
      ApiResponse<NotificationTemplate>
    >({
      url: this.path + '/templates/create',
      body: dto,
    });

    return res;
  }
  async updateTemplate(
    id: number,
    dto: UpdateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>> {
    const res = await putAuthReq<
      UpdateNotificationTemplateDto,
      ApiResponse<NotificationTemplate>
    >({
      url: this.path + '/templates/' + id,
      body: dto,
    });

    return res;
  }
  async deleteTemplate(id: number): Promise<ApiResponse<boolean>> {
    const res = await deleteAuthReq<
      Record<string, unknown>,
      ApiResponse<boolean>
    >({
      url: this.path + '/templates/' + id,
    });

    return res;
  }
  async getAllTemplates(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationTemplate>> {
    const res = await postAuthReq<
      QueryParams,
      PaginatedResponse<NotificationTemplate>
    >({
      url: this.path + '/templates',
      body: params,
    });

    return res;
  }

  async createGroup(
    dto: CreateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>> {
    const res = await postAuthReq<
      CreateNotificationGroupDto,
      ApiResponse<NotificationGroup>
    >({
      url: this.path + '/groups',
      body: dto,
    });

    return res;
  }
  async updateGroup(
    id: number,
    dto: UpdateNotificationGroupDto,
  ): Promise<ApiResponse<NotificationGroup>> {
    const res = await putAuthReq<
      UpdateNotificationGroupDto,
      ApiResponse<NotificationGroup>
    >({
      url: this.path + '/groups/' + id,
      body: dto,
    });

    return res;
  }
  async deleteGroup(id: number): Promise<ApiResponse<boolean>> {
    const res = await deleteAuthReq<
      Record<string, unknown>,
      ApiResponse<boolean>
    >({
      url: this.path + '/groups/' + id,
    });

    return res;
  }
  async addUsersToGroup(
    dto: AddUsersToGroupDto,
  ): Promise<ApiResponse<boolean>> {
    const res = await postAuthReq<AddUsersToGroupDto, ApiResponse<boolean>>({
      url: this.path + '/groups/add-users',
      body: dto,
    });

    return res;
  }
  async removeUsersFromGroup(
    dto: RemoveUsersFromGroupDto,
  ): Promise<ApiResponse<boolean>> {
    const res = await postAuthReq<
      RemoveUsersFromGroupDto,
      ApiResponse<boolean>
    >({
      url: this.path + '/groups/remove-users',
      body: dto,
    });

    return res;
  }
  async getAllGroups(
    params: QueryParams,
  ): Promise<PaginatedResponse<NotificationGroup>> {
    const res = await postAuthReq<
      QueryParams,
      PaginatedResponse<NotificationGroup>
    >({
      url: this.path + '/groups/search',
      body: params,
    });
    return res;
  }

  async getGroupUsers(
    id: number,
    pageParams: { page: number; pageSize: number },
  ): Promise<PaginatedResponse<SelectUserDto>> {
    const res = await getAuthReq<
      Record<string, unknown>,
      PaginatedResponse<SelectUserDto>
    >({
      url: this.path + `/groups/${id}/users`,
      params: {
        page: pageParams.page,
        pageSize: pageParams.pageSize,
      },
    });
    return res;
  }
}
