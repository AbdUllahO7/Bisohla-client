'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, BarChart3, AlertCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import { getInjection } from '@/di/container';
import {
  TrendGranularity,
  TrendsFilter,
  UserStatisticsOverview,
} from '@/core/entities/models/statistics/statistics.dto';
import {
  useGetMyListingStats,
  useGetMyListingHighlights,
  useGetMyViewsTrends,
  useGetMyContactsTrends,
  useGetMySharesTrends,
  useGetMyDetailsViewedTrends,
  useGetMyDurationTrends,
} from '@/core/infrastructure-adapters/use-actions/users/statistics.user.use-actions';
import { StatHeroCard } from './StatHeroCard';
import { StatTile, StatTileData } from './StatTile';
import { HighlightsSection } from './HighlightsSection';
import { RecentActivityCard } from './RecentActivityCard';
import { TrendsFilterBar } from './TrendsFilterBar';
import { TrendChartCard } from './TrendChartCard';

function formatDurationSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remainingMins}m`;
  return `${mins} min`;
}

export function MyStatisticsPage() {
  const t = useTranslations('statistics.my');
  const locale = useLocale();

  // Controlled trend filter state
  const [granularity, setGranularity] = useState<TrendGranularity>('daily');
  const [trendsFilter, setTrendsFilter] = useState<TrendsFilter>({ days: 90 });
  const [listingTypes, setListingTypes] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch listing types for filter bar
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const controller = getInjection('IListingTypesRepoController');
        const res = await controller.getListingTypes(1, 100);
        if (res.success && res.data) {
          const items = res.data.data.filter((type: any) => type.isActive);
          setListingTypes(
            items.map((type: any) => ({
              id: type.id,
              name:
                type.translations?.find((tr: any) => tr.locale === locale)?.name ||
                type.name,
            })),
          );
        }
      } catch {
        // silently ignore optional filter
      }
    };
    fetchTypes();
  }, [locale]);

  // Aggregate stats & highlights
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
    isFetching: isStatsFetching,
  } = useGetMyListingStats();

  const {
    data: highlightsData,
    isLoading: isHighlightsLoading,
    refetch: refetchHighlights,
  } = useGetMyListingHighlights();

  // Trend queries (Surface A)
  const { data: viewsTrends, isLoading: isViewsLoading, refetch: refetchViews } =
    useGetMyViewsTrends(trendsFilter);
  const { data: contactsTrends, isLoading: isContactsLoading, refetch: refetchContacts } =
    useGetMyContactsTrends(trendsFilter);
  const { data: sharesTrends, isLoading: isSharesLoading, refetch: refetchShares } =
    useGetMySharesTrends(trendsFilter);
  const { data: detailsTrends, isLoading: isDetailsLoading, refetch: refetchDetails } =
    useGetMyDetailsViewedTrends(trendsFilter);
  const { data: durationTrends, isLoading: isDurationLoading, refetch: refetchDuration } =
    useGetMyDurationTrends(trendsFilter);

  const overview: UserStatisticsOverview | undefined = statsData?.data;
  const highlights = highlightsData?.data;

  // Refresh handler
  const handleRefresh = useCallback(() => {
    void refetchStats();
    void refetchHighlights();
    void refetchViews();
    void refetchContacts();
    void refetchShares();
    void refetchDetails();
    void refetchDuration();
  }, [
    refetchStats,
    refetchHighlights,
    refetchViews,
    refetchContacts,
    refetchShares,
    refetchDetails,
    refetchDuration,
  ]);

  // Derived tiles
  const overviewTiles: StatTileData[] = useMemo(() => {
    if (!overview) return [];
    return [
      {
        key: 'total_listings',
        labelKey: 'statistics.my.total_listings',
        value: overview.totalListings.toLocaleString(),
      },
      {
        key: 'total_views',
        labelKey: 'statistics.my.total_views',
        value: overview.totalViews.toLocaleString(),
      },
      {
        key: 'total_contacts',
        labelKey: 'statistics.my.total_contacts',
        value: overview.totalContacts.toLocaleString(),
      },
      {
        key: 'total_favorites',
        labelKey: 'statistics.my.total_favorites',
        value: overview.totalFavorites.toLocaleString(),
      },
      {
        key: 'total_shares',
        labelKey: 'statistics.my.total_shares',
        value: overview.totalShares.toLocaleString(),
      },
      {
        key: 'total_details_viewed',
        labelKey: 'statistics.my.total_details_viewed',
        value: overview.totalDetailsViewed.toLocaleString(),
      },
      {
        key: 'avg_view_duration',
        labelKey: 'statistics.my.avg_view_duration',
        value: formatDurationSeconds(overview.avgViewDuration),
      },
    ];
  }, [overview]);

  // Delta calculation for hero card
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

  const breadcrumbItems = [{ label: t('title') }];

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
              {t('title')}
            </h1>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isStatsFetching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-[#198341] hover:border-[#198341] transition-all shadow-sm disabled:opacity-40"
          >
            <RefreshCw size={14} className={isStatsFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error State */}
        {isStatsError && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 text-center space-y-3">
            <AlertCircle size={28} className="text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-rose-800 dark:text-rose-200">
              Failed to load statistics
            </h3>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition-all"
            >
              Try again
            </button>
          </div>
        )}

        {/* Hero Card */}
        {isStatsLoading ? (
          <div className="h-44 bg-gray-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />
        ) : (
          <StatHeroCard
            title={t('hero_title')}
            value={overview ? overview.totalViews.toLocaleString() : '0'}
            delta={heroDelta}
          />
        )}

        {/* Overview Tiles Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
            <h2 className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
              {t('overview_section')}
            </h2>
          </div>

          {isStatsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-100 dark:bg-zinc-800/60 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {overviewTiles.map((tile) => (
                <StatTile key={tile.key} tile={tile} />
              ))}
            </div>
          )}
        </div>

        {/* Highlights & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {highlights && (
              <HighlightsSection
                mostViewed={highlights.mostViewed}
                trending={highlights.trending}
              />
            )}
          </div>
          <div>
            {highlights?.recentActivity && (
              <RecentActivityCard activity={highlights.recentActivity} />
            )}
          </div>
        </div>

        {/* Trends & Analytics Section */}
        <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
            <h2 className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
              Trends & Analytics
            </h2>
          </div>

          {/* Filter Bar */}
          <TrendsFilterBar
            granularity={granularity}
            onGranularityChange={setGranularity}
            filter={trendsFilter}
            onFilterChange={setTrendsFilter}
            listingTypes={listingTypes}
            showTypeFilter={true}
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
