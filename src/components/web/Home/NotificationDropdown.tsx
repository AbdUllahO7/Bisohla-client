'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, BellOffIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useGetAuthUserMyNotifications, useUpdateNotificationReadStatus } from '@/core/infrastructure-adapters/use-actions/users/notification.user.use-actions';
import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { notificationPriorityEnum, notificationTypeEnum } from '@/core/entities/enums/notifications.enum';
import Link from 'next/link';

// Define translations for English and Arabic
const translations = {
  en: {
    notifications: "Notifications",
    all: "All",
    unread: "Unread",
    read: "Read",
    noNotifications: "No notifications found",
    markAsRead: "Mark as read",
    viewAll: "View all notifications",
    noUnreadNotifications: "No unread notifications",
    priorities: {
      high: "High",
      medium: "Medium",
      low: "Low"
    }
  },
  ar: {
    notifications: "الإشعارات",
    all: "الكل",
    unread: "غير مقروءة",
    read: "مقروءة",
    noNotifications: "لا توجد إشعارات",
    markAsRead: "تعيين كمقروء",
    viewAll: "عرض كل الإشعارات",
    noUnreadNotifications: "لا توجد إشعارات غير مقروءة",
    priorities: {
      high: "عالي",
      medium: "متوسط",
      low: "منخفض"
    }
  }
};

const NotificationDropdown = () => {
  const locale = useLocale();
  const t = translations[locale === 'ar' ? 'ar' : 'en'];
  const dateLocale = locale === 'ar' ? arSA : enUS;
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Set up filter options to only show unread notifications in the dropdown
  const [filterOptions, setFilterOptions] = useState({
    isRead: false,
    page: 1,
    pageSize: 5
  });
  
  // Fetch notifications
  const { data: notificationsResponse, isLoading, refetch } = useGetAuthUserMyNotifications(filterOptions);
  
  // Setup mutation for marking notifications as read
  const markAsReadMutation = useUpdateNotificationReadStatus();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Refresh notifications when opening the dropdown
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case notificationTypeEnum.system: return '💻';
      case notificationTypeEnum.user: return '👤';
      case notificationTypeEnum.approval: return '✅';
      case notificationTypeEnum.reminder: return '⏰';
      case notificationTypeEnum.update: return '🔄';
      case notificationTypeEnum.payment: return '💲';
      case notificationTypeEnum.promotion: return '🎉';
      case notificationTypeEnum.listing: return '📋';
      default: return '📝';
    }
  };
  
  // Get notification priority style
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case notificationPriorityEnum.high: 
        return 'border-red-500 bg-red-50 text-red-700';
      case notificationPriorityEnum.medium: 
        return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case notificationPriorityEnum.low: 
      default: 
        return 'border-[#ABDE3B] bg-[#ABDE3B]/10 text-[#198341]';
    }
  };
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation();
    try {
      await markAsReadMutation.mutateAsync({
        notificationId: id,
        isRead: true
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
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center justify-center"
        aria-label={`${unreadCount} unread notifications`}
      >
        <BellIcon className="h-5 w-5 text-[#2C3C39]" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ABDE3B] text-[#2C3C39] text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className={`absolute mt-2 z-50 ${locale === 'ar' ? 'right-0 rtl' : 'left-0 ltr'} w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-100`}
        >
          {/* Header */}
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#2C3C39]">{t.notifications}</h3>
            {unreadCount > 0 ? (
              <span className="bg-[#ABDE3B]/20 text-[#198341] text-xs px-2 py-1 rounded-full">
                {unreadCount} {t.unread.toLowerCase()}
              </span>
            ) : (
              <BellOffIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {/* Notifications list */}
          {isLoading ? (
            <div className="p-4 flex flex-col space-y-3">
              {[1, 2, 3].map(i => (
                <div key={`loading-${i}`} className="bg-gray-50 p-3 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : notificationsResponse?.data?.data?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BellOffIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>{t.noUnreadNotifications}</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {notificationsResponse?.data?.data?.map((notification) => (
                  <Link 
                    key={notification.id}
                    href="/userProfile/Notification"
                    className="block p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 h-10 w-10 bg-[#2C3C39]/5 rounded-full flex items-center justify-center text-lg">
                        {notification.iconUrl ? (
                          <img src={notification.iconUrl} alt="" className="w-6 h-6" />
                        ) : getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2C3C39] truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { 
                              addSuffix: true,
                              locale: dateLocale
                            })}
                          </span>
                          
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="text-xs px-2 py-1 rounded-md bg-[#2C3C39] text-[#ABDE3B] hover:bg-[#2C3C39]/90"
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
              <div className="p-3 border-t border-gray-100 text-center">
                <Link 
                  href="/notifications"
                  className="text-sm text-[#2C3C39] font-medium hover:text-[#ABDE3B] transition-colors"
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