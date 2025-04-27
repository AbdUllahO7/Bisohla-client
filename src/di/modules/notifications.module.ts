import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../types';
import { NotificationService } from '@/core/infrastructure/services/notifications/notifications.service';
import { NotificationsUseCase } from '@/core/application/use-cases/notifications/notifications.use-case';
import { NotificationsController } from '@/core/infrastructure-adapters/controllers/notifications/notifications.controller';

export function createNotificationsModule(): Module {
  const notificationsModule = createModule();

  //service
  notificationsModule
    .bind(DI_SYMBOLS.INotificationService)
    .toClass(NotificationService, []);

  // use cases
  notificationsModule
    .bind(DI_SYMBOLS.INotificationUseCase)
    .toClass(NotificationsUseCase, [DI_SYMBOLS.INotificationService]);

  // controllers
  notificationsModule
    .bind(DI_SYMBOLS.INotificationController)
    .toClass(NotificationsController, [DI_SYMBOLS.INotificationUseCase]);

  return notificationsModule;
}
