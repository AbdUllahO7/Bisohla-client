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
          {direction === 'ltr' ? 'Profile not found' : 'الملف الشخصي غير موجود'}
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
