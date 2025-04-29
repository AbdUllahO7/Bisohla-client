// Notification Types Enum
export enum notificationTypeEnum {
  system = 'system',
  user = 'user',
  approval = 'approval',
  reminder = 'reminder',
  update = 'update',
  payment = 'payment',
  promotion = 'promotion',
  listing = 'listing',
}

// Notification Status Enum
export enum notificationStatusEnum {
  pending = 'pending',
  sent = 'sent',
  failed = 'failed',
  scheduled = 'scheduled',
}

// Notification Priority Enum
export enum notificationPriorityEnum {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

// Notification Channel Enum
export enum notificationChannelEnum {
  app = 'app',
  email = 'email',
  both = 'both',
}
