// components/dashboard/StatsCards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Car, Heart, TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GetUserProfile } from '@/core/entities/models/profile/user.profile.dto';

interface StatsCardsProps {
  profile: GetUserProfile;
}

export function StatsCards({ profile }: StatsCardsProps) {
  const t = useTranslations('UserProfile.home');

  const getTotalListings = () => {
    return (
      (profile?.totalForSellCarListings || 0) +
      (profile?.totalForRentCarListings || 0)
    );
  };

  const statsData = [
    {
      title: t('carsForSale'),
      value: profile?.totalForSellCarListings || 0,
      icon: Car,
      color: 'text-primary',
      subtitle: t('activeListings'),
    },
    {
      title: t('carsForRent'),
      value: profile?.totalForRentCarListings || 0,
      icon: Car,
      color: 'text-primary-light',
      subtitle: t('activeListings'),
    },
    {
      title: t('favorites'),
      value: profile?.totalFavoriteCarListings || 0,
      icon: Heart,
      color: 'text-rose-500',
      subtitle: t('savedListings'),
    },
    {
      title: t('totalListings'),
      value: getTotalListings(),
      icon: TrendingUp,
      color: 'text-primary',
      subtitle: t('combinedSaleRental'),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              {stat.icon === Heart ? (
                <Heart
                  className={`mr-1 rtl:mr-0 rtl:ml-1 h-3 w-3 ${stat.color}`}
                />
              ) : stat.icon === TrendingUp ? (
                <BarChart3
                  className={`mr-1 rtl:mr-0 rtl:ml-1 h-3 w-3 ${stat.color}`}
                />
              ) : (
                <ArrowUpRight
                  className={`mr-1 rtl:mr-0 rtl:ml-1 h-3 w-3 ${stat.color}`}
                />
              )}
              <span>{stat.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
