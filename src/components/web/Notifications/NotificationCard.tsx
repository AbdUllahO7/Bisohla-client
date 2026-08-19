'use client';

import {
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  LucideIcon,
  RefreshCw,
  Settings,
  Tag,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { notificationTypeEnum } from '@/core/entities/enums/notifications.enum';
import { Notification } from '@/core/entities/models/notifications/notifications.domain';
import { useUpdateNotificationReadStatus } from '@/core/infrastructure-adapters/use-actions/users/notification.user.use-actions';
import { formatRelativeTime } from '@/utils/format-relative-time';

// ── Icon map — mirrors the app's TYPE_ICON record (client enum subset) ────────

const TYPE_ICON: Record<string, LucideIcon> = {
  [notificationTypeEnum.system]: Settings,
  [notificationTypeEnum.user]: User,
  [notificationTypeEnum.approval]: CheckCircle,
  [notificationTypeEnum.reminder]: Clock,
  [notificationTypeEnum.update]: RefreshCw,
  [notificationTypeEnum.payment]: CreditCard,
  [notificationTypeEnum.promotion]: Tag,
  [notificationTypeEnum.listing]: FileText,
  // Extra types from the backend not yet in the client enum — handled by fallback
  rejecting: Settings,
  delete: Settings,
  create: Settings,
};

// ── HTML strip helper (same as app's stripHtml) ───────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: Notification;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  // Optimistic read state — matches the app's notificationReadOverridesSlice pattern
  const [optimisticIsRead, setOptimisticIsRead] = useState<boolean | null>(null);
  const effectiveIsRead = optimisticIsRead ?? notification.isRead;

  const { mutate: markRead } = useUpdateNotificationReadStatus();

  const Icon = TYPE_ICON[notification.type] ?? Settings;
  const displayContent = stripHtml(String(notification.content ?? ''));
  const relativeTime = formatRelativeTime(String(notification.createdAt));

  function handlePress() {
    if (!effectiveIsRead) {
      setOptimisticIsRead(true); // instant UI flip
      markRead(
        { notificationId: notification.id, isRead: true },
        {
          onError: () => setOptimisticIsRead(null), // rollback on failure
        },
      );
    }
  }

  return (
    <button
      onClick={handlePress}
      className={[
        'w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200',
        'hover:bg-[#198341]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#198341]',
        !effectiveIsRead
          ? 'bg-[#198341]/[0.04] border-l-4 border-[#198341]'
          : 'bg-white border-l-4 border-transparent',
      ].join(' ')}
    >
      {/* Icon circle */}
      <span
        className={[
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          effectiveIsRead ? 'bg-gray-100' : 'bg-[#198341]/10',
        ].join(' ')}
      >
        <Icon
          size={18}
          className={effectiveIsRead ? 'text-gray-400' : 'text-[#198341]'}
          strokeWidth={2}
        />
      </span>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-sm font-semibold truncate',
            effectiveIsRead ? 'text-[#2C3C39]' : 'text-[#198341]',
          ].join(' ')}
        >
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {displayContent}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] text-gray-400 capitalize">
            {notification.type}
          </span>
          <span className="text-[10px] text-gray-300">·</span>
          <span className="text-[10px] text-gray-400">{relativeTime}</span>
        </div>
      </div>

      {/* Unread dot */}
      <span className="flex-shrink-0 pt-1.5 w-4 flex justify-center">
        {!effectiveIsRead && (
          <span className="w-2 h-2 rounded-full bg-[#198341]" />
        )}
      </span>
    </button>
  );
}
