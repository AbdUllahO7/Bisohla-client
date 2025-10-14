// components/dashboard/ActivitySummary.tsx
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  User,
  Car,
  Heart,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GetUserProfile } from '@/core/entities/models/profile/user.profile.dto';
import { useEffect, useState } from 'react';
import { useDirection } from '@/hooks/use-direction';

interface ActivitySummaryProps {
  profile: GetUserProfile;
}

export function ActivitySummary({ profile }: ActivitySummaryProps) {
  const t = useTranslations('UserProfile.home');
  const direction = useDirection();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format date with proper timezone handling
  const formatDate = (dateString: string) => {
    if (!dateString || !isClient) return '';

    try {
      return new Date(dateString).toLocaleDateString(
        direction === 'ltr' ? 'en-US' : 'ar-SA',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        },
      );
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // Calculate account age in months
  const getAccountAge = () => {
    if (!profile?.createdAt || !isClient) return 0;

    try {
      return Math.floor(
        (new Date().getTime() - new Date(profile.createdAt).getTime()) /
          (1000 * 60 * 60 * 24 * 30),
      );
    } catch (error) {
      console.error('Account age calculation error:', error);
      return 0;
    }
  };

  // Calculate engagement percentage
  const getEngagementPercentage = () => {
    if (!profile || !isClient) return 0;

    const totalListings =
      (profile.totalForSellCarListings || 0) +
      (profile.totalForRentCarListings || 0);
    const favorites = profile.totalFavoriteCarListings || 0;

    if (totalListings === 0) return 0;

    return Math.round((favorites / totalListings) * 100);
  };

  // Calculate total listings
  const getTotalListings = () => {
    return (
      (profile?.totalForSellCarListings || 0) +
      (profile?.totalForRentCarListings || 0)
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t('activitySummary')}
          </CardTitle>
          <CardDescription>{t('recentActivity')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                {t('carsForSale')}
              </span>
              <span className="font-medium">
                {profile?.totalForSellCarListings || 0}
              </span>
            </div>
            <Progress
              value={
                getTotalListings() > 0
                  ? ((profile?.totalForSellCarListings || 0) /
                      getTotalListings()) *
                    100
                  : 0
              }
              className="h-2"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Car className="h-4 w-4 text-primary-light" />
                {t('carsForRent')}
              </span>
              <span className="font-medium">
                {profile?.totalForRentCarListings || 0}
              </span>
            </div>
            <Progress
              value={
                getTotalListings() > 0
                  ? ((profile?.totalForRentCarListings || 0) /
                      getTotalListings()) *
                    100
                  : 0
              }
              className="h-2"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                {t('favorites')}
              </span>
              <span className="font-medium">
                {profile?.totalFavoriteCarListings || 0}
              </span>
            </div>
            <Progress
              value={
                getTotalListings() > 0
                  ? ((profile?.totalFavoriteCarListings || 0) /
                      getTotalListings()) *
                    100
                  : 0
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {direction === 'ltr' ? 'Account Overview' : 'نظرة عامة على الحساب'}
          </CardTitle>
          <CardDescription>
            {direction === 'ltr' ? 'Your account statistics' : 'إحصائيات حسابك'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-center p-6 border rounded-lg bg-primary/5">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-2xl font-bold">{getTotalListings()}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('totalListings')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-semibold">
                  {getEngagementPercentage()}%
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('engagement')}
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{getAccountAge()}</h3>
                <p className="text-xs text-muted-foreground">{t('months')}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t('lastUpdated')} {formatDate(profile?.updatedAt || '')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
