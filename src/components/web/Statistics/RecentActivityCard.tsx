'use client';

import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RecentActivity } from '@/core/entities/models/statistics/statistics.dto';

export function RecentActivityCard({ activity }: { activity: RecentActivity }) {
  const t = useTranslations('statistics.my');

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-[#198341]/10 text-[#198341]">
          <Calendar size={18} />
        </div>
        <h3 className="text-sm font-bold text-[#2C3C39] dark:text-zinc-100">
          {t('recent_activity_label')}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
            {t('last_7_days')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
              {activity.last7Days.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">{t('views_suffix')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
            {t('last_30_days')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
              {activity.last30Days.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">{t('views_suffix')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
