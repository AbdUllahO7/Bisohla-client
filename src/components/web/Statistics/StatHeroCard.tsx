'use client';

import React from 'react';
import { Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatHeroCardProps {
  title?: string;
  value: string | number;
  delta?: {
    direction: 'up' | 'down' | 'flat';
    label: string;
  } | null;
  lastViewedText?: string | null;
}

export function StatHeroCard({
  title,
  value,
  delta,
  lastViewedText,
}: StatHeroCardProps) {
  const t = useTranslations('statistics.my');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#198341] via-[#157137] to-[#0D4B24] p-6 sm:p-8 text-white shadow-xl shadow-[#198341]/15">
      {/* Decorative background glows */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#ABDE3B]/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <Eye size={18} className="text-white" />
            </div>
            <span>{title || t('hero_title')}</span>
          </div>

          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {value}
            </span>

            {delta && (
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
                  delta.direction === 'up'
                    ? 'bg-[#ABDE3B]/25 text-[#ABDE3B] border border-[#ABDE3B]/40'
                    : delta.direction === 'down'
                    ? 'bg-red-400/25 text-red-200 border border-red-400/40'
                    : 'bg-white/15 text-white/80 border border-white/20'
                }`}
              >
                {delta.direction === 'up' && <TrendingUp size={14} />}
                {delta.direction === 'down' && <TrendingDown size={14} />}
                {delta.direction === 'flat' && <Minus size={14} />}
                <span>{delta.label}</span>
              </div>
            )}
          </div>

          {lastViewedText && (
            <p className="text-xs text-white/70 mt-3">{lastViewedText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
