"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  useGetAuthUserMyNotifications,
  useUpdateNotificationReadStatus,
} from "@/core/infrastructure-adapters/use-actions/users/notification.user.use-actions"
import type { NotificationFilterOptions, Notification } from "@/core/entities/models/notifications/notifications.domain"
import { notificationPriorityEnum, notificationTypeEnum } from "@/core/entities/enums/notifications.enum"
import { useLocale } from "next-intl"

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
      low: "Low",
    },
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
      low: "منخفض",
    },
  },
}

export default function NotificationsPage() {
  const locale = useLocale()
  const isRtl = locale === "ar"

  // Get translations based on current locale (default to English if locale not supported)
  const t = translations[isRtl ? "ar" : "en"]

  // Set up filter options for notifications
  const [filterOptions, setFilterOptions] = useState<NotificationFilterOptions>({
    isRead: undefined, // Show all notifications by default
    page: 1,
    pageSize: 10,
  })

  // Fetch notifications using your hook with dependency on filterOptions
  const { data: notificationsResponse, isLoading, refetch } = useGetAuthUserMyNotifications(filterOptions)

  // Set up mutation for marking notifications as read
  const markAsReadMutation = useUpdateNotificationReadStatus()

  // Re-fetch when filter options change
  useEffect(() => {
    refetch()
  }, [filterOptions, refetch])

  // Handle marking a notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({
        notificationId: id,
        isRead: true,
      })
      refetch()
    } catch (error) {
      console.error("Failed to update notification read status:", error)
    }
  }

  // Filter by read/unread status
  const handleFilterChange = (isRead: boolean | undefined) => {
    setFilterOptions((prev) => ({
      ...prev,
      isRead,
      page: 1, // Reset to first page when changing filters
    }))
  }

  // Simple pagination
  const handlePageChange = (page: number) => {
    setFilterOptions((prev) => ({
      ...prev,
      page,
    }))
  }

  // Get notification priority style
  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case notificationPriorityEnum.high:
        return "bg-gradient-to-r from-red-500 to-red-600 text-white"
      case notificationPriorityEnum.medium:
        return "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
      case notificationPriorityEnum.low:
      default:
        return "bg-gradient-to-r from-[#ABDE3B] to-[#198341] text-white"
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case notificationTypeEnum.system:
        return "💻"
      case notificationTypeEnum.user:
        return "👤"
      case notificationTypeEnum.approval:
        return "✅"
      case notificationTypeEnum.reminder:
        return "⏰"
      case notificationTypeEnum.update:
        return "🔄"
      case notificationTypeEnum.payment:
        return "💲"
      case notificationTypeEnum.promotion:
        return "🎉"
      case notificationTypeEnum.listing:
        return "📋"
      default:
        return "📝"
    }
  }

  // If data is loading, show loading state
  if (isLoading) {
    return (
      <div className={`container py-8 max-w-5xl mx-auto ${isRtl ? "rtl" : "ltr"}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3C39]">{t.notifications}</h1>
          <div className="flex rounded-xl overflow-hidden shadow-md">
            <button className="px-6 py-3 bg-[#2C3C39] text-[#ABDE3B] font-medium">{t.all}</button>
            <button className="px-6 py-3 bg-white text-[#2C3C39] font-medium hover:bg-gray-50">{t.unread}</button>
            <button className="px-6 py-3 bg-white text-[#2C3C39] font-medium hover:bg-gray-50">{t.read}</button>
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden animate-pulse">
              <div className="h-2 bg-gradient-to-r from-[#ABDE3B] to-[#198341] w-full"></div>
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // If data is not yet available or empty
  if (!notificationsResponse?.data?.data || notificationsResponse.data.data.length === 0) {
    return (
      <div className={`container py-8 max-w-5xl mx-auto ${isRtl ? "rtl" : "ltr"}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3C39]">{t.notifications}</h1>
          <div className="flex rounded-xl overflow-hidden shadow-md">
            <button
              onClick={() => handleFilterChange(undefined)}
              className={`px-6 py-3 font-medium transition-all ${
                filterOptions.isRead === undefined
                  ? "bg-[#2C3C39] text-[#ABDE3B]"
                  : "bg-white text-[#2C3C39] hover:bg-gray-50"
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => handleFilterChange(false)}
              className={`px-6 py-3 font-medium transition-all ${
                filterOptions.isRead === false
                  ? "bg-[#2C3C39] text-[#ABDE3B]"
                  : "bg-white text-[#2C3C39] hover:bg-gray-50"
              }`}
            >
              {t.unread}
            </button>
            <button
              onClick={() => handleFilterChange(true)}
              className={`px-6 py-3 font-medium transition-all ${
                filterOptions.isRead === true
                  ? "bg-[#2C3C39] text-[#ABDE3B]"
                  : "bg-white text-[#2C3C39] hover:bg-gray-50"
              }`}
            >
              {t.read}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#ABDE3B] to-[#198341] w-full"></div>
          <div className="p-12 text-center">
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-4">📭</span>
              <h3 className="text-2xl font-bold text-[#2C3C39] mb-2">{t.noNotifications}</h3>
              <p className="text-gray-500 text-lg">Your notifications will appear here</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If we have notifications data
  return (
    <div className={`container py-8 max-w-5xl mx-auto ${isRtl ? "rtl" : "ltr"}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-[#2C3C39]">{t.notifications}</h1>

        {/* Filter tabs */}
        <div className="flex rounded-xl overflow-hidden shadow-md w-full md:w-auto">
          <button
            onClick={() => handleFilterChange(undefined)}
            className={`px-6 py-3 font-medium transition-all flex-1 md:flex-auto ${
              filterOptions.isRead === undefined
                ? "bg-[#2C3C39] text-[#ABDE3B]"
                : "bg-white text-[#2C3C39] hover:bg-gray-50"
            }`}
          >
            {t.all}
          </button>
          <button
            onClick={() => handleFilterChange(false)}
            className={`px-6 py-3 font-medium transition-all flex-1 md:flex-auto ${
              filterOptions.isRead === false
                ? "bg-[#2C3C39] text-[#ABDE3B]"
                : "bg-white text-[#2C3C39] hover:bg-gray-50"
            }`}
          >
            {t.unread}
          </button>
          <button
            onClick={() => handleFilterChange(true)}
            className={`px-6 py-3 font-medium transition-all flex-1 md:flex-auto ${
              filterOptions.isRead === true ? "bg-[#2C3C39] text-[#ABDE3B]" : "bg-white text-[#2C3C39] hover:bg-gray-50"
            }`}
          >
            {t.read}
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-6">
        {notificationsResponse.data.data.map((notification: Notification, index: number) => {
          const isUnread = !notification.isRead

          return (
            <div
              key={`${notification.id}-${index}`}
              className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Colored top bar based on read status */}
              <div
                className={`h-2 ${isUnread ? "bg-gradient-to-r from-[#ABDE3B] to-[#198341]" : "bg-gray-200"} w-full`}
              ></div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left side with icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#2C3C39] text-white flex items-center justify-center text-2xl">
                      {notification.iconUrl ? (
                        <img src={notification.iconUrl || "/placeholder.svg"} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-xl text-[#2C3C39] mb-2">{notification.title}</h3>
                        <p className="text-gray-700">{notification.content}</p>
                        {notification.data?.messageContent && (
                          <p className="text-gray-700 mt-2">{notification.data.messageContent}</p>
                        )}
                      </div>

                      {/* Mark as read button */}
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="px-5 py-2.5 rounded-lg bg-[#2C3C39] text-[#ABDE3B] hover:bg-[#2C3C39]/90 transition-colors shadow-md flex-shrink-0 font-medium"
                        >
                          {t.markAsRead}
                        </button>
                      )}
                    </div>

                    {/* Optional image */}
                    {notification.imageUrl && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
                        <img
                          src={notification.imageUrl || "/placeholder.svg"}
                          alt=""
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <span className="text-sm text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.priority && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityStyle(notification.priority)}`}
                        >
                          {(notification.priority?.toLowerCase() as keyof typeof t.priorities) in t.priorities
                            ? t.priorities[notification.priority.toLowerCase() as keyof typeof t.priorities]
                            : notification.priority?.charAt(0).toUpperCase() + notification.priority?.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {notificationsResponse.data && notificationsResponse.data.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-3">
          <button
            onClick={() => handlePageChange((filterOptions.page ?? 1) - 1)}
            disabled={!notificationsResponse.data.hasPreviousPage}
            className="px-6 py-3 rounded-lg border-2 border-[#2C3C39] text-[#2C3C39] font-medium hover:bg-[#2C3C39]/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            {t.previous}
          </button>

          <span className="px-6 py-3 text-[#2C3C39] font-medium">
            {t.page} {notificationsResponse.data.currentPage} {t.of} {notificationsResponse.data.totalPages || 1}
          </span>

          <button
            onClick={() => handlePageChange((filterOptions.page ?? 1) + 1)}
            disabled={!notificationsResponse.data.hasNextPage}
            className="px-6 py-3 rounded-lg border-2 border-[#2C3C39] text-[#2C3C39] font-medium hover:bg-[#2C3C39]/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  )
}
