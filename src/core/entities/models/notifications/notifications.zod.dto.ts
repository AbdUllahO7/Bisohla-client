import { z } from 'zod';
import {
  notificationChannelEnum,
  notificationPriorityEnum,
  notificationStatusEnum,
  notificationTypeEnum,
} from '../../enums/notifications.enum';

// ============= Base schemas =============

// Base notification schema
export const BaseNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.nativeEnum(notificationTypeEnum),
  priority: z
    .nativeEnum(notificationPriorityEnum)
    .default(notificationPriorityEnum.medium)
    .optional()
    .nullable(),
  channel: z
    .nativeEnum(notificationChannelEnum)
    .default(notificationChannelEnum.app)
    .optional()
    .nullable(),
  iconUrl: z.string().url('Invalid icon URL').nullable().optional().nullable(),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .nullable()
    .optional()
    .nullable(),
  isForAdmins: z.boolean().default(false).optional().nullable(),
  data: z.record(z.any()).optional().nullable(), // Additional data for rendering or actions
});

// ============= Create DTOs =============

// Schema for creating a notification for a single user
export const CreateUserNotificationSchema = BaseNotificationSchema.extend({
  userId: z.number().int().positive('User ID is required'),
  scheduledFor: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
  expiresAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
});

export type CreateUserNotificationDto = z.infer<
  typeof CreateUserNotificationSchema
>;

// Schema for creating a notification for multiple users
export const CreateMultiUserNotificationSchema = BaseNotificationSchema.extend({
  userIds: z
    .array(z.number().int().positive())
    .min(1, 'At least one user ID is required'),
  scheduledFor: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(), // Optional scheduling
  expiresAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(), // Optional expiration
});

export type CreateMultiUserNotificationDto = z.infer<
  typeof CreateMultiUserNotificationSchema
>;

// Schema for creating a notification for a group
export const CreateGroupNotificationSchema = BaseNotificationSchema.extend({
  groupId: z.number().int().positive('Group ID is required'),
  scheduledFor: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(), // Optional scheduling
  expiresAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(), // Optional expiration
});

export type CreateGroupNotificationDto = z.infer<
  typeof CreateGroupNotificationSchema
>;

// Schema for creating a notification from a template
export const CreateTemplatedNotificationSchema = z
  .object({
    templateName: z.string().min(1, 'Template name is required'),
    templateData: z.record(z.any()), // Data to inject into template
    userIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one user ID is required')
      .optional()
      .nullable(),
    groupId: z
      .number()
      .int()
      .positive('Group ID is required')
      .optional()
      .nullable(),
    userId: z
      .number()
      .int()
      .positive('User ID is required')
      .optional()
      .nullable(),
    scheduledFor: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .optional()
      .nullable(),
    expiresAt: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .optional()
      .nullable(),
    // You must provide exactly one of: userId, userIds, or groupId
  })
  .refine(
    (data) => {
      const hasUserId = !!data.userId;
      const hasUserIds = !!(data.userIds && data.userIds.length > 0);
      const hasGroupId = !!data.groupId;

      // Ensure exactly one targeting option is provided
      return (
        (hasUserId ? 1 : 0) + (hasUserIds ? 1 : 0) + (hasGroupId ? 1 : 0) === 1
      );
    },
    {
      message: 'You must provide exactly one of: userId, userIds, or groupId',
      path: ['targeting'],
    },
  );

export type CreateTemplatedNotificationDto = z.infer<
  typeof CreateTemplatedNotificationSchema
>;

// Schema for creating a broadcast notification (to all users or all admins)
export const CreateBroadcastNotificationSchema = BaseNotificationSchema.extend({
  targetAdmins: z.boolean().default(false).optional().nullable(),
  scheduledFor: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
  expiresAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
});

export type CreateBroadcastNotificationDto = z.infer<
  typeof CreateBroadcastNotificationSchema
>;

// ============= Update DTOs =============

// Schema for marking notifications as read/unread
export const UpdateNotificationReadStatusSchema = z.object({
  notificationId: z.number().int().positive('Notification ID is required'),
  isRead: z.boolean().default(true),
});

export type UpdateNotificationReadStatusDto = z.infer<
  typeof UpdateNotificationReadStatusSchema
>;

// Schema for updating notification status (admin operation)
export const UpdateNotificationStatusSchema = z.object({
  id: z.number().int().positive('Notification ID is required'),
  status: z.nativeEnum(notificationStatusEnum),
});

export type UpdateNotificationStatusDto = z.infer<
  typeof UpdateNotificationStatusSchema
>;

// ============= Template DTOs =============

// Schema for creating a notification template
export const CreateNotificationTemplateSchema = BaseNotificationSchema.extend({
  name: z.string().min(1, 'Template name is required'),
  translations: z
    .array(
      z.object({
        title: z.string().min(1, 'Title is required'),
        content: z.string().min(1, 'Content is required'),
        locale: z.string().min(2, 'Locale is required'),
      }),
    )
    .optional()
    .nullable(),
});

export type CreateNotificationTemplateDto = z.infer<
  typeof CreateNotificationTemplateSchema
>;

// Schema for updating a notification template
export const UpdateNotificationTemplateSchema =
  CreateNotificationTemplateSchema.partial();

export type UpdateNotificationTemplateDto = z.infer<
  typeof UpdateNotificationTemplateSchema
>;

// ============= Group DTOs =============

// Schema for creating a notification group
export const CreateNotificationGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional().nullable(),
  criteria: z.record(z.any()).optional().nullable(), // JSON criteria for dynamic groups
  userIds: z.array(z.number().int().positive()).optional().nullable(), // Initial users to add
});

export type CreateNotificationGroupDto = z.infer<
  typeof CreateNotificationGroupSchema
>;

// Schema for updating a notification group
export const UpdateNotificationGroupSchema =
  CreateNotificationGroupSchema.partial();

export type UpdateNotificationGroupDto = z.infer<
  typeof UpdateNotificationGroupSchema
>;

// Schema for adding users to a group
export const AddUsersToGroupSchema = z.object({
  groupId: z.number().int().positive('Group ID is required'),
  userIds: z
    .array(z.number().int().positive())
    .min(1, 'At least one user ID is required'),
});

export type AddUsersToGroupDto = z.infer<typeof AddUsersToGroupSchema>;

// Schema for removing users from a group
export const RemoveUsersFromGroupSchema = z.object({
  groupId: z.number().int().positive('Group ID is required'),
  userIds: z
    .array(z.number().int().positive())
    .min(1, 'At least one user ID is required'),
});

export type RemoveUsersFromGroupDto = z.infer<
  typeof RemoveUsersFromGroupSchema
>;

// ============= Query DTOs =============

// Schema for querying user notifications
export const GetUserNotificationsQuerySchema = z.object({
  isRead: z.boolean().optional().nullable(),
  types: z.array(z.nativeEnum(notificationTypeEnum)).optional().nullable(),
  startDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
  endDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
  page: z.number().int().positive().default(1).optional().nullable(),
  pageSize: z.number().int().positive().default(10).optional().nullable(),
});

export type GetUserNotificationsQueryDto = z.infer<
  typeof GetUserNotificationsQuerySchema
>;
