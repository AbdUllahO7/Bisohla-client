'use client';

import React from 'react';
import {
  LayoutGrid,
  Eye,
  Phone,
  Heart,
  Share2,
  FileText,
  Clock,
  LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface StatTileData {
  key: string;
  labelKey: string;
  value: string | number;
}

interface StatTileConfig {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

const TILE_CONFIG: Record<string, StatTileConfig> = {
  total_listings: {
    icon: LayoutGrid,
    bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  total_views: {
    icon: Eye,
    bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  total_contacts: {
    icon: Phone,
    bgColor: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  total_favorites: {
    icon: Heart,
    bgColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  total_shares: {
    icon: Share2,
    bgColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  total_details_viewed: {
    icon: FileText,
    bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  avg_view_duration: {
    icon: Clock,
    bgColor: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
};

export function StatTile({ tile }: { tile: StatTileData }) {
  const t = useTranslations();
  const config = TILE_CONFIG[tile.key] || {
    icon: LayoutGrid,
    bgColor: 'bg-gray-50 text-gray-600',
    iconColor: 'text-gray-600',
  };
  const Icon = config.icon;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-1">
          {t(tile.labelKey)}
        </span>
        <div className={`p-2 rounded-xl ${config.bgColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-[#2C3C39] dark:text-zinc-100 tracking-tight">
        {tile.value}
      </div>
    </div>
  );
}
