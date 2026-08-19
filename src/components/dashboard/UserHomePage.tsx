// components/dashboard/UserHomePageRefactored.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useDirection } from '@/hooks/use-direction';
import { useProfileContext } from '@/providers/profile.provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileOverviewCard } from './ProfileOverviewCard';
import { StatsCards } from './StatsCards';
import { ActivitySummary } from './ActivitySummary';
import { QuickActions } from './QuickActions';

const UserHomePageRefactored = () => {
  // Language state
  const t = useTranslations('UserProfile.home');
  const direction = useDirection();
  const [isClient, setIsClient] = useState(false);
  const { profile, isLoading, error } = useProfileContext();

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading skeleton on server-side and initial client render
  if (isLoading || !isClient) {
    return (
      <div className="space-y-6" dir={direction}>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>

        <Skeleton className="h-40" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>

        <Skeleton className="h-60" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 text-center"
        dir={direction}
      >
        <h2 className="text-2xl font-bold text-destructive">
          {t('errorLoading')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('errorMessage')}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 text-center"
        dir={direction}
      >
        <h2 className="text-xl font-semibold text-muted-foreground">
          {t('profileNotFound')}
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('welcome')}, {profile.name}
          </h1>
          <p className="text-muted-foreground mt-1">{t('overview')}</p>
        </div>
      </div>

      {/* User Profile Overview Card */}
      <ProfileOverviewCard profile={profile} />

      {/* Prominent Link to Full Statistics & Charts Dashboard */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#198341]/10 via-[#ABDE3B]/15 to-emerald-500/10 border border-[#198341]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white flex items-center justify-center shadow-md shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2C3C39] dark:text-zinc-100">
              {direction === 'rtl'
                ? 'مركز الإحصائيات والتحليلات البيانية'
                : 'Advanced Statistics & Trend Analytics'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
              {direction === 'rtl'
                ? 'استعرض الرسوم البيانية التفاعلية للمشاهدات، التواصل، فترات الظهور، ومعدل نمو إعلاناتك'
                : 'Explore interactive trend charts for views, inquiries, viewing duration, and listing growth'}
            </p>
          </div>
        </div>

        <a
          href="/userProfile/Statistics"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all text-center shrink-0"
        >
          {direction === 'rtl' ? 'فتح الإحصائيات الكاملة ←' : 'Open Full Analytics →'}
        </a>
      </div>

      {/* Stats Cards */}
      <StatsCards profile={profile} />

      {/* Activity Summary and Account Overview */}
      <ActivitySummary profile={profile} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default UserHomePageRefactored;
