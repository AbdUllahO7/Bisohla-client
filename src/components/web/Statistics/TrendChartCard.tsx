'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
} from 'lucide-react';
import {
  TrendGranularity,
  TrendSummary,
  AnyTrendResponse,
  MetricKey,
} from '@/core/entities/models/statistics/statistics.dto';

interface TrendChartCardProps {
  metric: MetricKey;
  data?: AnyTrendResponse;
  granularity: TrendGranularity;
  isLoading?: boolean;
}

interface ComputedPoint {
  x: number;
  y: number;
  name: string;
  value: number;
}

interface BucketItem {
  name: string;
  value: number;
}

const METRIC_THEMES: Record<
  MetricKey,
  { stroke: string; fillFrom: string; fillTo: string; badgeBg: string; badgeText: string }
> = {
  views: {
    stroke: '#198341',
    fillFrom: 'rgba(25, 131, 65, 0.35)',
    fillTo: 'rgba(25, 131, 65, 0.02)',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  contacts: {
    stroke: '#10B981',
    fillFrom: 'rgba(16, 185, 129, 0.35)',
    fillTo: 'rgba(16, 185, 129, 0.02)',
    badgeBg: 'bg-green-50 dark:bg-green-950/40',
    badgeText: 'text-green-700 dark:text-green-300',
  },
  shares: {
    stroke: '#8B5CF6',
    fillFrom: 'rgba(139, 92, 246, 0.35)',
    fillTo: 'rgba(139, 92, 246, 0.02)',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
  },
  detailsViewed: {
    stroke: '#F59E0B',
    fillFrom: 'rgba(245, 158, 11, 0.35)',
    fillTo: 'rgba(245, 158, 11, 0.02)',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  duration: {
    stroke: '#06B6D4',
    fillFrom: 'rgba(6, 182, 212, 0.35)',
    fillTo: 'rgba(6, 182, 212, 0.02)',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
  },
};

export function TrendChartCard({
  metric,
  data,
  granularity,
  isLoading,
}: TrendChartCardProps) {
  const t = useTranslations('statistics.trends');
  const summaryT = useTranslations('statistics.trends.summary');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const theme = METRIC_THEMES[metric] || METRIC_THEMES.views;

  // Extract buckets based on granularity
  const buckets: BucketItem[] = useMemo(() => {
    if (!data) return [];
    const list = (data[granularity] as any[]) || [];
    return list.map((item: any) => {
      let value = 0;
      if ('viewsCount' in item) value = item.viewsCount;
      else if ('contactCount' in item) value = item.contactCount;
      else if ('sharesCount' in item) value = item.sharesCount;
      else if ('detailsViewedCount' in item) value = item.detailsViewedCount;
      else if ('viewDurationSum' in item) value = Math.round(item.viewDurationSum / 60); // minutes

      return {
        name: item.name,
        value,
      };
    });
  }, [data, granularity]);

  const summary: TrendSummary | undefined = data?.summary;

  // Calculate SVG curve path points
  const { pathData, areaData, points, maxY } = useMemo(() => {
    if (buckets.length === 0) {
      return { pathData: '', areaData: '', points: [] as ComputedPoint[], maxY: 1 };
    }

    const values = buckets.map((b: BucketItem) => b.value);
    const maxVal = Math.max(...values, 1);
    const maxY = Math.ceil(maxVal * 1.15);

    const width = 600;
    const height = 180;
    const paddingX = 20;
    const paddingY = 20;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;

    const computedPoints: ComputedPoint[] = buckets.map((b: BucketItem, i: number) => {
      const x =
        buckets.length === 1
          ? width / 2
          : paddingX + (i / (buckets.length - 1)) * innerWidth;
      const y = paddingY + innerHeight - (b.value / maxY) * innerHeight;
      return { x, y, name: b.name, value: b.value };
    });

    if (computedPoints.length === 1) {
      const p = computedPoints[0];
      return {
        pathData: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
        areaData: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${height} L ${p.x - 20} ${height} Z`,
        points: computedPoints,
        maxY,
      };
    }

    // Build smooth cubic bezier curve
    let d = `M ${computedPoints[0].x} ${computedPoints[0].y}`;
    for (let i = 0; i < computedPoints.length - 1; i++) {
      const p0 = computedPoints[i];
      const p1 = computedPoints[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const last = computedPoints[computedPoints.length - 1];
    const first = computedPoints[0];
    const area = `${d} L ${last.x} ${height} L ${first.x} ${height} Z`;

    return { pathData: d, areaData: area, points: computedPoints, maxY };
  }, [buckets]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded-full w-20" />
        </div>
        <div className="h-44 bg-gray-50 dark:bg-zinc-800/40 rounded-xl" />
      </div>
    );
  }

  const growth = summary?.growthPercent ?? 0;
  const isUp = growth > 0;
  const isDown = growth < 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${theme.badgeBg}`}>
            <Activity size={16} className={theme.badgeText} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2C3C39] dark:text-zinc-100">
              {t(`title.${metric}`)}
            </h3>
            {summary && (
              <p className="text-[11px] text-gray-400">
                {summaryT('current_period')}:{' '}
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {summary.currentTotal.toLocaleString()}
                  {metric === 'duration' ? ' min' : ''}
                </span>
              </p>
            )}
          </div>
        </div>

        {summary && (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isUp
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : isDown
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {isUp && <TrendingUp size={13} />}
            {isDown && <TrendingDown size={13} />}
            {!isUp && !isDown && <Minus size={13} />}
            <span>
              {isUp
                ? summaryT('growth_up', { value: Math.abs(growth).toFixed(1) })
                : isDown
                ? summaryT('growth_down', { value: growth.toFixed(1) })
                : summaryT('growth_flat')}
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      {buckets.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-gray-400">{t('empty')}</p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox="0 0 600 180"
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`grad-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.28" />
                <stop offset="100%" stopColor={theme.stroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid line */}
            <line
              x1="0"
              y1="160"
              x2="600"
              y2="160"
              stroke="#E5E7EB"
              strokeDasharray="4 4"
              className="dark:stroke-zinc-800"
            />

            {/* Area Fill */}
            <path d={areaData} fill={`url(#grad-${metric})`} />

            {/* Stroke Line */}
            <path
              d={pathData}
              fill="none"
              stroke={theme.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points */}
            {points.map((p: ComputedPoint, idx: number) => (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === idx ? 6 : 3.5}
                  fill="#ffffff"
                  stroke={theme.stroke}
                  strokeWidth={hoveredIndex === idx ? 3 : 2}
                  className="transition-all duration-150 shadow-sm"
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="absolute top-2 pointer-events-none transform -translate-x-1/2 bg-gray-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-lg backdrop-blur-sm transition-all"
              style={{
                left: `${(points[hoveredIndex].x / 600) * 100}%`,
              }}
            >
              <span className="font-bold">{points[hoveredIndex].value.toLocaleString()}</span>
              {metric === 'duration' ? ' min' : ''}
              <span className="text-gray-300 ml-1.5">({points[hoveredIndex].name})</span>
            </div>
          )}

          {/* X-axis date labels */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 px-1">
            <span>{buckets[0]?.name}</span>
            {buckets.length > 2 && (
              <span>{buckets[Math.floor(buckets.length / 2)]?.name}</span>
            )}
            <span>{buckets[buckets.length - 1]?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
