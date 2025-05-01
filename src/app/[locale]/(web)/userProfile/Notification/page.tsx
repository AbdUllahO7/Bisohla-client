'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useGetAuthUserMyNotifications, useUpdateNotificationReadStatus } from '@/core/infrastructure-adapters/use-actions/users/notification.user.use-actions';
import { NotificationFilterOptions, Notification } from '@/core/entities/models/notifications/notifications.domain';
import { notificationPriorityEnum, notificationTypeEnum } from '@/core/entities/enums/notifications.enum';
import { useLocale } from 'next-intl';

// Define translations for English and Arabic
const translations = {
  en: {
    notifications: "Notifications",
    all: "All",
    unread: "Unread",
    read: "Read",
    noNotifications: "No notifications found",
    markAsRead: "Mark as read",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
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
    previous: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",
    priorities: {
      high: "عالي",
      medium: "متوسط",
      low: "منخفض"
    }
  }
};

export default function NotificationsPage() {
  const locale = useLocale();
  console.log('Locale:', locale);
  
  // Get translations based on current locale (default to English if locale not supported)
  const t = translations[locale === 'ar' ? 'ar' : 'en'];
  
  // Set up filter options for notifications
  const [filterOptions, setFilterOptions] = useState<NotificationFilterOptions>({
    isRead: undefined, // Show unread notifications by default
    page: 1,
    pageSize: 10
  });

  console.log('Filter Options:', filterOptions);

  // Fetch notifications using your hook with dependency on filterOptions
  const { data: notificationsResponse, isLoading, refetch } = 
    useGetAuthUserMyNotifications(filterOptions);

  console.log('Notifications Response:', notificationsResponse);
  
  // Set up mutation for marking notifications as read
  const markAsReadMutation = useUpdateNotificationReadStatus();

  // Re-fetch when filter options change
  useEffect(() => {
    refetch();
  }, [filterOptions, refetch]);

  // Handle marking a notification as read
  const handleMarkAsRead = async (id: number) => {
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

  // Filter by read/unread status
  const handleFilterChange = (isRead: boolean | undefined) => {
    setFilterOptions(prev => ({
      ...prev,
      isRead,
      page: 1 // Reset to first page when changing filters
    }));
  };

  // Simple pagination
  const handlePageChange = (page: number) => {
    setFilterOptions(prev => ({
      ...prev,
      page
    }));
  };

  // Get notification priority style
  const getPriorityStyle = (priority: string) => {
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

  // If data is loading, show loading state
  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3C39]">{t.notifications}</h1>
          <div className="flex space-x-3">
            <button className="px-5 py-2 rounded-lg bg-gray-100 text-[#2C3C39] font-medium transition-all">{t.all}</button>
            <button className="px-5 py-2 rounded-lg bg-gray-100 text-[#2C3C39] font-medium transition-all">{t.unread}</button>
            <button className="px-5 py-2 rounded-lg bg-gray-100 text-[#2C3C39] font-medium transition-all">{t.read}</button>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If data is not yet available or empty
  if (!notificationsResponse?.data?.data || notificationsResponse.data.data.length === 0) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3C39]">{t.notifications}</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => handleFilterChange(undefined)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                filterOptions.isRead === undefined 
                ? 'bg-[#2C3C39] text-[#ABDE3B]' 
                : 'bg-gray-100 text-[#2C3C39] hover:bg-gray-200'
              }`}
            >
              {t.all}
            </button>
            <button 
              onClick={() => handleFilterChange(false)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                filterOptions.isRead === false 
                ? 'bg-[#2C3C39] text-[#ABDE3B]' 
                : 'bg-gray-100 text-[#2C3C39] hover:bg-gray-200'
              }`}
            >
              {t.unread}
            </button>
            <button 
              onClick={() => handleFilterChange(true)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                filterOptions.isRead === true 
                ? 'bg-[#2C3C39] text-[#ABDE3B]' 
                : 'bg-gray-100 text-[#2C3C39] hover:bg-gray-200'
              }`}
            >
              {t.read}
            </button>
          </div>
        </div>
        <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center">
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-gray-500 text-lg">{t.noNotifications}</p>
          </div>
        </div>
      </div>
    );
  }

  // If we have notifications data
  return (
    <div className={`container py-8 max-w-4xl mx-auto ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2C3C39]">{t.notifications}</h1>
        
        {/* Filter tabs */}
        <div className="flex space-x-3">
          <button 
            onClick={() => handleFilterChange(undefined)}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              filterOptions.isRead === undefined 
              ? 'bg-[#2C3C39] text-[#ABDE3B]' 
              : 'bg-gray-100 text-[#2C3C39] hover:bg-gray-200'
            }`}
          >
            {t.all}
          </button>
          <button 
            onClick={() => handleFilterChange(false)}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              filterOptions.isRead === false 
              ? 'bg-[#2C3C39] text-[#ABDE3B]' 
              : 'bg-gray-100 text-[#2C3C39] hover:bg-gray-200'
            }`}
          >
            {t.unread}
          </button>
          <button 
            onClick={() => handleFilterChange(true)}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              filterOptions.isRead === true 
              ? 'bg-[#2C3C39] text-[#ABDE3B]' 
              : 'bg-gray-100 text-[#2C3C39] hover:bg-gray-200'
            }`}
          >
            {t.read}
          </button>
        </div>
      </div>
      
      {/* Notifications list */}
      <div className="space-y-4">
        {notificationsResponse.data.data.map((notification: Notification, index: number) => {
          const isUnread = !notification.isRead;
          
          return (
            <div 
              key={`${notification.id}-${index}`} 
              className={`bg-white p-6 rounded-xl border shadow-sm transition-all ${
                isUnread 
                ? 'border-l-4 border-l-[#ABDE3B]' 
                : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="text-2xl bg-[#2C3C39]/5 p-3 rounded-full">
                    {notification.iconUrl ? (
                      <img src={notification.iconUrl} alt="" className="w-6 h-6" />
                    ) : (
                      notification.type === notificationTypeEnum.system ? '💻' :
                      notification.type === notificationTypeEnum.user ? '👤' :
                      notification.type === notificationTypeEnum.approval ? '✅' :
                      notification.type === notificationTypeEnum.reminder ? '⏰' :
                      notification.type === notificationTypeEnum.update ? '🔄' :
                      notification.type === notificationTypeEnum.payment ? '💲' :
                      notification.type === notificationTypeEnum.promotion ? '🎉' :
                      notification.type === notificationTypeEnum.listing ? '📋' : '📝'
                    )}
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-[#2C3C39]">{notification.title}</h3>
                    <p className="text-gray-700 mt-2">{notification.content}</p>
                    <p className="text-gray-700 mt-2">{notification.data.messageContent}</p>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.priority && (
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityStyle(notification.priority)}`}>
                          {(notification.priority?.toLowerCase() as keyof typeof t.priorities) in t.priorities 
                            ? t.priorities[notification.priority.toLowerCase() as keyof typeof t.priorities]
                            : notification.priority?.charAt(0).toUpperCase() + notification.priority?.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mark as read button */}
                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={markAsReadMutation.isPending}
                    className="px-4 py-2 text-sm rounded-lg bg-[#2C3C39] text-[#ABDE3B] hover:bg-[#2C3C39]/90 transition-colors"
                  >
                    {t.markAsRead}
                  </button>
                )}
              </div>
              
              {/* Optional image */}
              {notification.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={notification.imageUrl} 
                    alt="" 
                    className="max-w-full h-auto rounded-lg border border-gray-100" 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Pagination */}
      {notificationsResponse.data && notificationsResponse.data.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-3">
          <button
            onClick={() => handlePageChange((filterOptions.page ?? 1) - 1)}
            disabled={!notificationsResponse.data.hasPreviousPage}
            className="px-5 py-2 rounded-lg border border-[#2C3C39] text-[#2C3C39] hover:bg-[#2C3C39]/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            {t.previous}
          </button>
          
          <span className="px-5 py-2 text-[#2C3C39] font-medium">
            {t.page} {notificationsResponse.data.currentPage} {t.of} {notificationsResponse.data.totalPages || 1}
          </span>
          
          <button
            onClick={() => handlePageChange((filterOptions.page ?? 1) + 1)}
            disabled={!notificationsResponse.data.hasNextPage}
            className="px-5 py-2 rounded-lg border border-[#2C3C39] text-[#2C3C39] hover:bg-[#2C3C39]/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  );
}