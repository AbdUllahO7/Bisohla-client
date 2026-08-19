'use client';

import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Notification } from '@/core/entities/models/notifications/notifications.domain';
import {
  useGetAuthUserMyNotifications,
  useMarkAllNotificationsAsRead,
} from '@/core/infrastructure-adapters/use-actions/users/notification.user.use-actions';
import { NotificationCard } from './NotificationCard';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;
const SKELETON_COUNT = 6;

// ── Skeleton card ─────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      </div>
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Notification[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ── Data fetching — mirrors useNotificationsScreenLogic pagination ──────────
  const { data, isFetching, isError, refetch } = useGetAuthUserMyNotifications({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  // Accumulate pages (dedupe by id, same as app logic)
  useEffect(() => {
    const incoming = data?.data?.data;
    if (!incoming || incoming.length === 0) return;
    setAccumulated((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const novel = incoming.filter((n) => !existingIds.has(n.id));
      return novel.length > 0 ? [...prev, ...novel] : prev;
    });
  }, [data]);

  // ── Derived state — mirrors the app's displayResults logic ──────────────────
  const rawResults =
    currentPage === 1 && accumulated.length === 0
      ? data?.data?.data ?? []
      : accumulated;

  // Strip admin-targeted notifications defensively (same as app)
  const displayResults = rawResults.filter((n) => n.isForAdmins !== true);
  const hasNextPage = data?.data?.hasNextPage ?? false;
  const isInitialLoad = data === undefined && !isError;
  const unreadCount = displayResults.filter((n) => !n.isRead).length;

  // ── Load next page ──────────────────────────────────────────────────────────
  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetching) {
      setCurrentPage((p) => p + 1);
    }
  }, [hasNextPage, isFetching]);

  // ── Pull-to-refresh (web: manual refresh button) ───────────────────────────
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setAccumulated([]);
    void refetch();
  }, [refetch]);

  // ── Mark all as read ────────────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(() => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        setAccumulated((prev) => prev.map((n) => ({ ...n, isRead: true })));
      },
    });
  }, [markAllAsRead]);

  // ── Infinite scroll via IntersectionObserver ────────────────────────────────
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNextPage();
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // ── Breadcrumbs ─────────────────────────────────────────────────────────────
  const breadcrumbItems = [{ label: 'Notifications' }];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* ── Header row ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
            <h1 className="text-2xl font-bold text-[#2C3C39]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#198341] text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="p-2 rounded-lg text-gray-400 hover:text-[#198341] hover:bg-[#198341]/5 transition-all duration-200 disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>

            {/* Mark all read button — mirrors the app's "mark_all_read" button */}
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                unreadCount > 0 && !isMarkingAll
                  ? 'text-[#198341] hover:bg-[#198341]/5 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed',
              ].join(' ')}
            >
              <CheckCheck size={15} />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* ── Content card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Branch: skeleton → error → empty → list */}
          {isInitialLoad ? (
            <SkeletonList count={SKELETON_COUNT} />
          ) : isError && displayResults.length === 0 ? (
            /* Error state */
            <div className="flex flex-col items-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Bell size={28} className="text-red-300" />
              </div>
              <p className="text-base font-semibold text-[#2C3C39] mb-1">
                Something went wrong
              </p>
              <p className="text-sm text-gray-400 mb-6">
                We couldn&apos;t load your notifications.
              </p>
              <button
                onClick={handleRefresh}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white text-sm font-semibold shadow hover:shadow-md transition-all"
              >
                Try again
              </button>
            </div>
          ) : displayResults.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center py-16 px-6 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Bell size={36} className="text-gray-200" />
              </div>
              <p className="text-lg font-bold text-[#2C3C39] mb-2">
                No notifications yet
              </p>
              <p className="text-sm text-gray-400 max-w-xs">
                We&apos;ll notify you here when something important happens.
              </p>
            </div>
          ) : (
            /* List */
            <div className="divide-y divide-gray-50">
              {displayResults.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={loadMoreRef} className="py-1">
                {isFetching && currentPage > 1 && (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-[#198341] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!hasNextPage && displayResults.length > 0 && (
                  <p className="text-center text-xs text-gray-300 py-4">
                    You&apos;re all caught up
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
