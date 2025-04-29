import {
  notificationChannelEnum,
  notificationPriorityEnum,
  notificationStatusEnum,
  notificationTypeEnum,
} from '../../enums/notifications.enum';
import { SelectUserDto } from '../users/users.dto';

export interface NotificationRecipient {
  id: number;
  notificationId: number;
  userId: number;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: SelectUserDto;
}

export interface NotificationFilterOptions {
  isRead?: boolean;
  types?: notificationStatusEnum[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: notificationTypeEnum;
  priority: notificationPriorityEnum;
  channel: notificationChannelEnum;
  status: notificationStatusEnum;
  isForAdmins: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  iconUrl: string | null;
  imageUrl: string | null;
  readAt: Date | null;
  scheduledFor: Date | null;
  sentAt: Date | null;
  expiresAt: Date | null;
  createdById: number | null;
  createdAt: Date;
  updatedAt: Date;
  recipients: Array<NotificationRecipient>;
}

export interface NotificationGroup {
  id: number;
  name: string;
  description: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  criteria: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationUserGroup {
  id: number;
  groupId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  title: string;
  content: string;
  type: notificationTypeEnum;
  isForAdmins: boolean;
  priority: notificationPriorityEnum;
  channel: notificationChannelEnum;
  iconUrl: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  variables?: Array<string> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplateTranslation {
  id: number;
  templateId: number;
  locale: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
