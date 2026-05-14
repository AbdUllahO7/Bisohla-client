// components/dashboard/StatsCards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowUpRight,
  Car,
  Heart,
  TrendingUp,
  BarChart3,
  Eye,
  Phone,
  Share2,
  Clock,
  Users,
  Target,
  Activity,
  Calendar,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GetUserProfile } from '@/core/entities/models/profile/user.profile.dto';

interface StatsCardsProps {
  profile: GetUserProfile;
}

export function StatsCards({ profile }: StatsCardsProps) {
  const t = useTranslations('UserProfile.home');

  const getTotalListings = () => {
    return profile?.totalListings || 0;
  };

  // Format duration in hours and minutes
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const views = Number(profile?.totalViewsReceived || 0);
  const contacts = Number(profile?.totalContactsReceived || 0);
  const shares = Number(profile?.totalSharesReceived || 0);
  const totalListingsCount = getTotalListings();

  const averageViews = totalListingsCount > 0 ? Math.round(views / totalListingsCount) : 0;
  const contactRate = views > 0 ? (contacts / views) * 100 : 0;

  const statsData = [
    // Listing Statistics
    {
      title: t('carsForSale'),
      value: profile?.totalForSaleListings || 0,
      icon: Car,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtitle: t('activeListings'),
      category: 'listings',
    },
    {
      title: t('carsForRent'),
      value: profile?.totalForRentListings || 0,
      icon: Car,
      color: 'text-primary-light',
      bgColor: 'bg-primary-light/10',
      subtitle: t('activeListings'),
      category: 'listings',
    },
    {
      title: t('favorites'),
      value: profile?.totalFavoritesGiven || 0,
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      subtitle: t('savedListings'),
      category: 'listings',
    },
    {
      title: t('totalListings'),
      value: totalListingsCount,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtitle: t('combinedSaleRental'),
      category: 'listings',
    },

    // Engagement Statistics
    {
      title: t('totalViews'),
      value: views,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      subtitle: t('allTimeViews'),
      category: 'engagement',
    },
    {
      title: t('averageViews'),
      value: averageViews,
      icon: BarChart3,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-600/10',
      subtitle: t('perListing'),
      category: 'engagement',
    },
    {
      title: t('totalContacts'),
      value: contacts,
      icon: Phone,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      subtitle: t('contactRequests'),
      category: 'engagement',
    },
    {
      title: t('totalShares'),
      value: shares,
      icon: Share2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
      subtitle: t('socialShares'),
      category: 'engagement',
    },

    // Performance Metrics
    {
      title: t('contactRate'),
      value: formatPercentage(contactRate),
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/10',
      subtitle: t('viewToContact'),
      category: 'performance',
    },
    {
      title: t('engagementScore'),
      value: 0, // Score calculation omitted as not present in new profile v2 API
      icon: Activity,
      color: 'text-pink-600',
      bgColor: 'bg-pink-600/10',
      subtitle: t('overallScore'),
      category: 'performance',
    },
    {
      title: t('viewDuration'),
      value: formatDuration(Number(profile?.avgViewDurationReceived || 0)),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-600/10',
      subtitle: t('totalTime'),
      category: 'performance',
    },

    // Recent Activity
    {
      title: t('last7Days'),
      value: Number(profile?.recentActivity?.last7Days || 0),
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-600/10',
      subtitle: t('recentViews'),
      category: 'recent',
    },
    {
      title: t('last30Days'),
      value: Number(profile?.recentActivity?.last30Days || 0),
      icon: Calendar,
      color: 'text-violet-600',
      bgColor: 'bg-violet-600/10',
      subtitle: t('monthlyViews'),
      category: 'recent',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Listing Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary">
          {t('listingStats')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData
            .filter((stat) => stat.category === 'listings')
            .map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <ArrowUpRight
                      className={`mr-1 rtl:mr-0 rtl:ml-1 h-3 w-3 ${stat.color}`}
                    />
                    <span>{stat.subtitle}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Engagement Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary">
          {t('engagementStats')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData
            .filter((stat) => stat.category === 'engagement')
            .map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <stat.icon
                      className={`mr-1 rtl:mr-0 rtl:ml-1 h-3 w-3 ${stat.color}`}
                    />
                    <span>{stat.subtitle}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary">
          {t('performanceMetrics')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statsData
            .filter((stat) => stat.category === 'performance')
            .map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <stat.icon
                      className={`mr-1 rtl:mr-0 rtl:ml-1 h-3 w-3 ${stat.color}`}
                    />
                    <span>{stat.subtitle}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary">
          {t('recentActivity')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {statsData
            .filter((stat) => stat.category === 'recent')
            .map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <stat.icon
                      className={`mr-1 rtl:mr-0 rtl:ml-1 h-3 w-3 ${stat.color}`}
                    />
                    <span>{stat.subtitle}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}