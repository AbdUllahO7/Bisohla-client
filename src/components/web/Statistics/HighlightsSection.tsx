'use client';

import React from 'react';
import { Crown, Flame, ChevronRight, Eye, BarChart2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { MostViewedListing, TrendingListing } from '@/core/entities/models/statistics/statistics.dto';
import { formatRelativeTime } from '@/utils/format-relative-time';

interface HighlightsSectionProps {
  mostViewed: MostViewedListing | null;
  trending: TrendingListing | null;
}

export function HighlightsSection({
  mostViewed,
  trending,
}: HighlightsSectionProps) {
  const t = useTranslations('statistics.my');
  const commonT = useTranslations('statistics.action');

  if (!mostViewed && !trending) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
        <h2 className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
          {t('highlights_section')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Viewed Listing */}
        {mostViewed && (
          <div className="relative bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
                  <Crown size={16} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {t('most_viewed_label')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                <Eye size={13} />
                <span>
                  {mostViewed.viewsCount.toLocaleString()} {t('views_suffix')}
                </span>
              </div>
            </div>

            <h3 className="text-base font-bold text-[#2C3C39] dark:text-zinc-100 line-clamp-1 mb-4 group-hover:text-[#198341] transition-colors">
              {mostViewed.title}
            </h3>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Link
                href={`/products/product/${mostViewed.slug || mostViewed.id}`}
                className="text-xs font-medium text-gray-500 hover:text-[#198341] transition-colors"
              >
                View Listing
              </Link>
              <Link
                href={`/statistics/listing/${mostViewed.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#198341] hover:underline"
              >
                <BarChart2 size={13} />
                <span>{commonT('view_stats')}</span>
                <ChevronRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* Trending Listing */}
        {trending && (
          <div className="relative bg-gradient-to-br from-orange-500/10 via-white to-white dark:from-orange-950/20 dark:via-zinc-900 dark:to-zinc-900 border border-orange-200/60 dark:border-orange-900/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-500/20">
                  <Flame size={16} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  {t('trending_label')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100/80 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-xs font-semibold">
                <Eye size={13} />
                <span>
                  {trending.viewsCount.toLocaleString()} {t('views_suffix')}
                </span>
              </div>
            </div>

            <h3 className="text-base font-bold text-[#2C3C39] dark:text-zinc-100 line-clamp-1 mb-1 group-hover:text-[#198341] transition-colors">
              {trending.title}
            </h3>

            {trending.lastViewedAt && (
              <p className="text-[11px] text-gray-400 mb-3">
                Last viewed {formatRelativeTime(trending.lastViewedAt)}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Link
                href={`/products/product/${trending.slug || trending.id}`}
                className="text-xs font-medium text-gray-500 hover:text-[#198341] transition-colors"
              >
                View Listing
              </Link>
              <Link
                href={`/statistics/listing/${trending.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#198341] hover:underline"
              >
                <BarChart2 size={13} />
                <span>{commonT('view_stats')}</span>
                <ChevronRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
