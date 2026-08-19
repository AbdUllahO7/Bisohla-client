'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { TrendGranularity, TrendsFilter } from '@/core/entities/models/statistics/statistics.dto';
import { Filter, Calendar } from 'lucide-react';

interface ListingTypeOption {
  id: number;
  name: string;
}

interface TrendsFilterBarProps {
  granularity: TrendGranularity;
  onGranularityChange: (g: TrendGranularity) => void;
  filter: TrendsFilter;
  onFilterChange: (f: TrendsFilter) => void;
  listingTypes?: ListingTypeOption[];
  showTypeFilter?: boolean;
}

const PRESET_DAYS = [
  { days: 7, labelKey: 'preset_7d' },
  { days: 30, labelKey: 'preset_30d' },
  { days: 90, labelKey: 'preset_90d' },
  { days: 365, labelKey: 'preset_1y' },
];

export function TrendsFilterBar({
  granularity,
  onGranularityChange,
  filter,
  onFilterChange,
  listingTypes = [],
  showTypeFilter = true,
}: TrendsFilterBarProps) {
  const t = useTranslations('statistics.trends.filter');
  const granT = useTranslations('statistics.trends.granularity');
  const locale = useLocale();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Granularity Switcher (Daily / Weekly / Monthly) */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl self-start">
          {(['daily', 'weekly', 'monthly'] as TrendGranularity[]).map((g) => (
            <button
              key={g}
              onClick={() => onGranularityChange(g)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                granularity === g
                  ? 'bg-white dark:bg-zinc-900 text-[#198341] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {granT(g)}
            </button>
          ))}
        </div>

        {/* Date Range Preset Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-400 mr-2 rtl:mr-0 rtl:ml-2">
            <Calendar size={13} />
            <span>{t('date_range')}:</span>
          </div>

          {PRESET_DAYS.map((preset) => {
            const isSelected = (filter.days ?? 90) === preset.days;
            return (
              <button
                key={preset.days}
                onClick={() => onFilterChange({ ...filter, days: preset.days })}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#198341] text-white border-[#198341] shadow-sm'
                    : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-[#198341]'
                }`}
              >
                {t(preset.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Listing Type Filter */}
      {showTypeFilter && listingTypes.length > 0 && (
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
            <Filter size={12} />
            <span>{t('listing_type')}:</span>
          </span>

          <button
            onClick={() => onFilterChange({ ...filter, listingTypeId: undefined })}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              filter.listingTypeId === undefined
                ? 'bg-[#198341] text-white border-[#198341]'
                : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:border-[#198341]'
            }`}
          >
            {t('all_types')}
          </button>

          {listingTypes.map((type) => {
            const isSelected = filter.listingTypeId === type.id;
            return (
              <button
                key={type.id}
                onClick={() =>
                  onFilterChange({
                    ...filter,
                    listingTypeId: isSelected ? undefined : type.id,
                  })
                }
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  isSelected
                    ? 'bg-[#198341] text-white border-[#198341]'
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:border-[#198341]'
                }`}
              >
                {type.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
