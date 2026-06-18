'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { BellIcon, BellOffIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import {
  useGetAuthUserMyNotifications,
  useUpdateNotificationReadStatus,
} from '@/core/infrastructure-adapters/use-actions/users/notification.user.use-actions';
import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { notificationTypeEnum } from '@/core/entities/enums/notifications.enum';
import { Link } from '@/i18n/routing';

// Define translations for English and Arabic
const translations = {
  en: {
    notifications: 'Notifications',
    all: 'All',
    unread: 'Unread',
    read: 'Read',
    noNotifications: 'No notifications found',
    markAsRead: 'Mark as read',
    viewAll: 'View all notifications',
    noUnreadNotifications: 'No unread notifications',
    priorities: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
  },
  ar: {
    notifications: 'الإشعارات',
    all: 'الكل',
    unread: 'غير مقروءة',
    read: 'مقروءة',
    noNotifications: 'لا توجد إشعارات',
    markAsRead: 'تعيين كمقروء',
    viewAll: 'عرض كل الإشعارات',
    noUnreadNotifications: 'لا توجد إشعارات غير مقروءة',
    priorities: {
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
    },
  },
};

const NotificationDropdown = () => {
  const locale = useLocale();
  const t = translations[locale === 'ar' ? 'ar' : 'en'];
  const dateLocale = locale === 'ar' ? arSA : enUS;
  const isRTL = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>(
    'right',
  );
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Set up filter options to only show unread notifications in the dropdown
  const [filterOptions, setFilterOptions] = useState({
    isRead: false,
    page: 1,
    pageSize: 5,
  });

  // Fetch notifications
  const {
    data: notificationsResponse,
    isLoading,
    refetch,
  } = useGetAuthUserMyNotifications(filterOptions);

  // Setup mutation for marking notifications as read
  const markAsReadMutation = useUpdateNotificationReadStatus();

  // Calculate dropdown position to avoid overflow
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320; // Approximate dropdown width
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - buttonRect.right;
      const spaceOnLeft = buttonRect.left;

      // If not enough space on the right and more space on left, position left
      if (spaceOnRight < dropdownWidth && spaceOnLeft > spaceOnRight) {
        setDropdownPosition('left');
      } else {
        setDropdownPosition('right');
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Refresh notifications and calculate position when opening the dropdown
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
      refetch();
    }
  }, [isOpen, refetch]);

  // Strip HTML tags and get plain text
  const getPlainText = (html: string, maxLength?: number): string => {
    // Remove HTML tags
    const plainText = html.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    const textArea = document.createElement('textarea');
    textArea.innerHTML = plainText;
    const decoded = textArea.value;

    // Truncate if needed
    if (maxLength && decoded.length > maxLength) {
      return decoded.substring(0, maxLength) + '...';
    }

    return decoded;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: notificationTypeEnum) => {
    switch (type) {
      case notificationTypeEnum.system:
        return '💻';
      case notificationTypeEnum.user:
        return '👤';
      case notificationTypeEnum.approval:
        return '✅';
      case notificationTypeEnum.reminder:
        return '⏰';
      case notificationTypeEnum.update:
        return '🔄';
      case notificationTypeEnum.payment:
        return '💲';
      case notificationTypeEnum.promotion:
        return '🎉';
      case notificationTypeEnum.listing:
        return '📋';
      default:
        return '📝';
    }
  };

  // Handle marking a notification as read
  const handleMarkAsRead = async (
    id: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    try {
      await markAsReadMutation.mutateAsync({
        notificationId: id,
        isRead: true,
      });
      refetch();
    } catch (error) {
      console.error('Failed to update notification read status:', error);
    }
  };

  // Calculate unread count from notification data
  const unreadCount = notificationsResponse?.data?.data?.length || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
        aria-label={`${unreadCount} unread notifications`}
      >
        <BellIcon className="h-4 w-4 text-[#2C3C39] dark:text-zinc-300" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ABDE3B] dark:bg-primary-foreground text-[#2C3C39] dark:text-primary-default text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`absolute mt-2 top-auto z-[999]
            w-72 sm:w-80
            max-w-[min(90vw,320px)]
            max-h-80 sm:max-h-96
            overflow-y-auto
            bg-white dark:bg-zinc-950 rounded-lg shadow-lg border border-gray-100 dark:border-zinc-800
            ${
              dropdownPosition === 'left'
                ? isRTL
                  ? 'right-[-50px]'
                  : 'left-0'
                : isRTL
                ? 'left-0'
                : 'right-[-100px]'
            }
          `}
          style={{
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-950 z-10">
            <h3 className="font-semibold text-[#2C3C39] dark:text-zinc-100 text-sm sm:text-base">
              {t.notifications}
            </h3>
            {unreadCount > 0 ? (
              <span className="bg-[#ABDE3B]/20 dark:bg-emerald-950/40 text-[#198341] dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                {unreadCount} {t.unread.toLowerCase()}
              </span>
            ) : (
              <BellOffIcon className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500" />
            )}
          </div>

          {/* Notifications list */}
          {isLoading ? (
            <div className="p-3 sm:p-4 flex flex-col space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={`loading-${i}`}
                  className="bg-gray-50 dark:bg-zinc-900 p-2 sm:p-3 rounded-lg animate-pulse"
                >
                  <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : notificationsResponse?.data?.data?.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-zinc-400">
              <BellOffIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-400 dark:text-zinc-500" />
              <p className="text-xs sm:text-sm">{t.noUnreadNotifications}</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {notificationsResponse?.data?.data?.map((notification) => (
                  <Link
                    key={notification.id}
                    href="/userProfile/Notification"
                    className="block p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex gap-2 sm:gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-[#2C3C39]/5 dark:bg-zinc-800 rounded-full flex items-center justify-center text-sm">
                        {notification.iconUrl ? (
                          <img
                            src={notification.iconUrl || '/placeholder.svg'}
                            alt=""
                            className="w-5 h-5 sm:w-6 sm:h-6 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-base sm:text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#2C3C39] dark:text-zinc-100 truncate">
                          {notification.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {getPlainText(notification.content, 100)}
                        </p>

                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-zinc-400 flex-shrink-0">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: dateLocale,
                              },
                            )}
                          </span>

                          <button
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            className="text-[10px] sm:text-xs px-2 py-1 rounded-md bg-[#2C3C39] dark:bg-emerald-600 text-[#ABDE3B] dark:text-zinc-100 hover:bg-[#2C3C39]/90 dark:hover:bg-emerald-700 transition-colors whitespace-nowrap flex-shrink-0"
                          >
                            {t.markAsRead}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-zinc-800 text-center sticky bottom-0 bg-white dark:bg-zinc-950">
                <Link
                  href="/userProfile/Notification"
                  className="text-xs sm:text-sm text-[#2C3C39] dark:text-zinc-300 font-medium hover:text-[#ABDE3B] dark:hover:text-emerald-400 transition-colors inline-block py-1"
                  onClick={() => setIsOpen(false)}
                >
                  {t.viewAll}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
