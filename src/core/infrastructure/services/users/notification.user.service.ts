import { INotificationUserService } from '@/core/application/services/users/notification.user.service.interface';
import {
  PaginatedResponse,
  ApiResponse,
  PaginationInfo,
} from '@/core/entities/api/success.response';
import {
  NotificationFilterOptions,
  Notification,
} from '@/core/entities/models/notifications/notifications.domain';
import { UpdateNotificationReadStatusDto } from '@/core/entities/models/notifications/notifications.zod.dto';
import { getAuthReq, patchAuthReq } from '@/core/lib/api';

export class NotificationUserService implements INotificationUserService {
  private path = '/user-notifications';
  async getMyNotifications(
    queries: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>> {
    const res = await getAuthReq<
      Record<string, unknown>,
      PaginationInfo<Notification>
    >({
      url: this.path,
      params: queries,
    });

    return res;
  }
  async getMyNotificationById(id: number): Promise<ApiResponse<Notification>> {
    const res = await getAuthReq<
      Record<string, unknown>,
      Notification
    >({
      url: `${this.path}/${id}`,
    });
    return res;
  }
  async updateReadStatus(
    dto: UpdateNotificationReadStatusDto,
  ): Promise<ApiResponse<boolean>> {
    const res = await patchAuthReq<
      UpdateNotificationReadStatusDto,
      boolean
    >({
      url: `${this.path}/read-status`,
      body: dto,
    });

    return res;
  }
}
