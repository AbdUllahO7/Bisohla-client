import { INotificationUserController } from '@/core/application/controllers/users/notifications/notification.user.controller.interface';
import { INotificationUserUseCase } from '@/core/application/use-cases/users/notifications/notification.user.use-case.interface';
import {
  PaginatedResponse,
  ApiResponse,
} from '@/core/entities/api/success.response';
import {
  NotificationFilterOptions,
  Notification,
} from '@/core/entities/models/notifications/notifications.domain';
import { UpdateNotificationReadStatusDto } from '@/core/entities/models/notifications/notifications.zod.dto';
import { catchClientRequest } from '@/core/lib/error';

export class NotificationUserController implements INotificationUserController {
  constructor(private useCase: INotificationUserUseCase) {}
  async getMyNotifications(
    queries: NotificationFilterOptions,
  ): Promise<PaginatedResponse<Notification>> {
    try {
      return await this.useCase.getMyNotifications(queries);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async getMyNotificationById(id: number): Promise<ApiResponse<Notification>> {
    try {
      return await this.useCase.getMyNotificationById(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async updateReadStatus(
    dto: UpdateNotificationReadStatusDto,
  ): Promise<ApiResponse<boolean>> {
    try {
      return await this.useCase.updateReadStatus(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
}
