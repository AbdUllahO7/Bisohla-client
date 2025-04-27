import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  Notification,
  NotificationFilterOptions,
} from '@/core/entities/models/notifications/notifications.domain';
import { UpdateNotificationReadStatusDto } from '@/core/entities/models/notifications/notifications.zod.dto';

export interface NotificationUserStrategy {
  getMyNotifications(
    queries: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>>;
  getMyNotificationById(id: number): Promise<ApiResponse<Notification>>;
  updateReadStatus(
    dto: UpdateNotificationReadStatusDto,
  ): Promise<ApiResponse<boolean>>;
}
