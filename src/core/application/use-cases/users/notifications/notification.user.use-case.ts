import {
  Notification,
  NotificationFilterOptions,
} from '@/core/entities/models/notifications/notifications.domain';
import { INotificationUserUseCase } from './notification.user.use-case.interface';
import {
  PaginatedResponse,
  ApiResponse,
} from '@/core/entities/api/success.response';
import { UpdateNotificationReadStatusDto } from '@/core/entities/models/notifications/notifications.zod.dto';
import { INotificationUserService } from '@/core/application/services/users/notification.user.service.interface';

export class NotificationUserUseCase implements INotificationUserUseCase {
  constructor(private notificationUserService: INotificationUserService) {}
  async getMyNotifications(
    queries: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>> {
    return this.notificationUserService.getMyNotifications(queries);
  }
  async getMyNotificationById(id: number): Promise<ApiResponse<Notification>> {
    return this.notificationUserService.getMyNotificationById(id);
  }
  async updateReadStatus(
    dto: UpdateNotificationReadStatusDto,
  ): Promise<ApiResponse<boolean>> {
    return this.notificationUserService.updateReadStatus(dto);
  }
}
