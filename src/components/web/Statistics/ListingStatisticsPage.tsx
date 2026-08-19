'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { RefreshCw, ChevronLeft, Eye, Heart, Phone, Share2, FileText, Clock, Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import {
  TrendGranularity,
  ListingTrendsFilter,
  ListingStatisticsData,
} from '@/core/entities/models/statistics/statistics.dto';
import {
  useGetSingleListingStats,
  useGetListingViewsTrends,
  useGetListingContactsTrends,
  useGetListingSharesTrends,
  useGetListingDetailsViewedTrends,
  useGetListingDurationTrends,
} from '@/core/infrastructure-adapters/use-actions/users/statistics.user.use-actions';
import { useGetListingById } from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
import { StatHeroCard } from './StatHeroCard';
import { StatTile, StatTileData } from './StatTile';
import { TrendsFilterBar } from './TrendsFilterBar';
import { TrendChartCard } from './TrendChartCard';
import { formatRelativeTime } from '@/utils/format-relative-time';

function formatDurationSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remainingMins}m`;
  return `${mins} min`;
}

interface ListingStatisticsPageProps {
  listingId: number;
}

export function ListingStatisticsPage({ listingId }: ListingStatisticsPageProps) {
  const t = useTranslations('statistics.listing');
  const myT = useTranslations('statistics.my');
  const actionT = useTranslations('statistics.action');
  const locale = useLocale();

  const [granularity, setGranularity] = useState<TrendGranularity>('daily');
  const [trendsFilter, setTrendsFilter] = useState<ListingTrendsFilter>({ days: 90 });

  // Queries
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
    isFetching: isStatsFetching,
  } = useGetSingleListingStats(listingId);

  const { data: listingData } = useGetListingById(listingId);

  const { data: viewsTrends, isLoading: isViewsLoading, refetch: refetchViews } =
    useGetListingViewsTrends(listingId, trendsFilter);
  const { data: contactsTrends, isLoading: isContactsLoading, refetch: refetchContacts } =
    useGetListingContactsTrends(listingId, trendsFilter);
  const { data: sharesTrends, isLoading: isSharesLoading, refetch: refetchShares } =
    useGetListingSharesTrends(listingId, trendsFilter);
  const { data: detailsTrends, isLoading: isDetailsLoading, refetch: refetchDetails } =
    useGetListingDetailsViewedTrends(listingId, trendsFilter);
  const { data: durationTrends, isLoading: isDurationLoading, refetch: refetchDuration } =
    useGetListingDurationTrends(listingId, trendsFilter);

  const stats: ListingStatisticsData | undefined = statsData?.data;
  const listing = listingData?.data;

  const handleRefresh = useCallback(() => {
    void refetchStats();
    void refetchViews();
    void refetchContacts();
    void refetchShares();
    void refetchDetails();
    void refetchDuration();
  }, [
    refetchStats,
    refetchViews,
    refetchContacts,
    refetchShares,
    refetchDetails,
    refetchDuration,
  ]);

  // Derived tiles
  const listingTiles: StatTileData[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: 'total_views',
        labelKey: 'statistics.listing.views',
        value: stats.viewsCount.toLocaleString(),
      },
      {
        key: 'total_contacts',
        labelKey: 'statistics.listing.contacts',
        value: stats.contactCount.toLocaleString(),
      },
      {
        key: 'total_favorites',
        labelKey: 'statistics.listing.favorites',
        value: stats.favoritesCount.toLocaleString(),
      },
      {
        key: 'total_shares',
        labelKey: 'statistics.listing.shares',
        value: stats.sharesCount.toLocaleString(),
      },
      {
        key: 'total_details_viewed',
        labelKey: 'statistics.listing.details_viewed',
        value: stats.detailsViewedCount.toLocaleString(),
      },
      {
        key: 'avg_view_duration',
        labelKey: 'statistics.listing.view_duration',
        value: formatDurationSeconds(stats.viewDuration),
      },
    ];
  }, [stats]);

  const heroDelta = useMemo(() => {
    const summary = viewsTrends?.data?.summary;
    if (!summary) return null;
    const v = summary.growthPercent;
    const direction: 'up' | 'down' | 'flat' = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
    return {
      direction,
      label: `${Math.abs(v).toFixed(1)}% vs prev period`,
    };
  }, [viewsTrends?.data?.summary]);

  const breadcrumbItems = [
    { label: myT('title'), href: '/statistics' },
    { label: listing?.title || `${t('title')} #${listingId}` },
  ];

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/statistics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#198341] transition-colors mb-2"
            >
              <ChevronLeft size={14} className="rtl:rotate-180" />
              <span>{actionT('back_to_stats')}</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3C39] dark:text-zinc-100 line-clamp-1">
                {listing?.title || `${t('title')} #${listingId}`}
              </h1>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isStatsFetching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-[#198341] hover:border-[#198341] transition-all shadow-sm self-start disabled:opacity-40"
          >
            <RefreshCw size={14} className={isStatsFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Hero Card */}
        {isStatsLoading ? (
          <div className="h-44 bg-gray-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />
        ) : (
          <StatHeroCard
            title={t('hero_title')}
            value={stats ? stats.viewsCount.toLocaleString() : '0'}
            delta={heroDelta}
            lastViewedText={
              stats?.lastViewedAt
                ? `${t('last_viewed_label')}: ${formatRelativeTime(stats.lastViewedAt)}`
                : t('never_viewed')
            }
          />
        )}

        {/* Listing Metric Tiles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
            <h2 className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
              Overview
            </h2>
          </div>

          {isStatsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-100 dark:bg-zinc-800/60 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {listingTiles.map((tile) => (
                <StatTile key={tile.key} tile={tile} />
              ))}
            </div>
          )}
        </div>

        {/* Trends & Analytics Section */}
        <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
            <h2 className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
              Listing Trends
            </h2>
          </div>

          {/* Filter Bar */}
          <TrendsFilterBar
            granularity={granularity}
            onGranularityChange={setGranularity}
            filter={trendsFilter}
            onFilterChange={setTrendsFilter}
            showTypeFilter={false}
          />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrendChartCard
              metric="views"
              data={viewsTrends?.data}
              granularity={granularity}
              isLoading={isViewsLoading}
            />
            <TrendChartCard
              metric="contacts"
              data={contactsTrends?.data}
              granularity={granularity}
              isLoading={isContactsLoading}
            />
            <TrendChartCard
              metric="shares"
              data={sharesTrends?.data}
              granularity={granularity}
              isLoading={isSharesLoading}
            />
            <TrendChartCard
              metric="detailsViewed"
              data={detailsTrends?.data}
              granularity={granularity}
              isLoading={isDetailsLoading}
            />
            <div className="md:col-span-2">
              <TrendChartCard
                metric="duration"
                data={durationTrends?.data}
                granularity={granularity}
                isLoading={isDurationLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
