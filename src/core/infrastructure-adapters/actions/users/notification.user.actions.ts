import { UpdateNotificationReadStatusDto } from '../../../entities/models/notifications/notifications.zod.dto';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  Notification,
  NotificationFilterOptions,
} from '@/core/entities/models/notifications/notifications.domain';
import { getInjection } from '@/di/container';

export const getAuthUserMyNotifications = async (
  queries: NotificationFilterOptions,
): Promise<PaginatedResponse<Notification>> => {
  const controller = getInjection('INotificationUserController');
  const res = await controller.getMyNotifications(queries);

  return res;
};

export const getAuthUserMyNotificationById = async (
  id: number,
): Promise<ApiResponse<Notification>> => {
  const controller = getInjection('INotificationUserController');
  const res = await controller.getMyNotificationById(id);

  return res;
};

export const updateNotificationReadStatus = async (
  dto: UpdateNotificationReadStatusDto,
): Promise<ApiResponse<boolean>> => {
  const controller = getInjection('INotificationUserController');
  const res = await controller.updateReadStatus(dto);

  return res;
};
