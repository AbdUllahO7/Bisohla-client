'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SellerRowCardProps {
  userId: number;
  name: string;
  profileUrl: string | null;
  listingsCount: number;
  onClick?: () => void;
  selected?: boolean;
  showChevron?: boolean;
  className?: string;
}

export const SellerRowCard: React.FC<SellerRowCardProps> = ({
  userId,
  name,
  profileUrl,
  listingsCount,
  onClick,
  selected = false,
  showChevron = true,
  className,
}) => {
  const t = useTranslations('publicProfile');

  const initials = useMemo(() => {
    if (!name) return 'U';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [name]);

  const listingsLabel =
    listingsCount === 1
      ? t('listings_count_one', { count: 1 })
      : t('listings_count_other', { count: listingsCount });

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'group flex items-center justify-between w-full h-16 px-4 transition-colors cursor-pointer select-none rounded-xl',
        'hover:bg-slate-100/70 dark:hover:bg-zinc-800/60 active:bg-slate-200/60 dark:active:bg-zinc-800',
        selected && 'bg-[#198341]/10 dark:bg-[#198341]/20 hover:bg-[#198341]/15',
        className,
      )}
    >
      {/* Left: Avatar + Name + Count */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          {profileUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileUrl}
              alt={name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white font-bold text-sm">
              {initials}
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={cn(
              'text-sm font-semibold truncate transition-colors',
              selected
                ? 'text-[#198341] dark:text-[#ABDE3B]'
                : 'text-slate-900 dark:text-zinc-100 group-hover:text-[#198341] dark:group-hover:text-[#ABDE3B]',
            )}
          >
            {name}
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">
            {listingsLabel}
          </span>
        </div>
      </div>

      {/* Right: Selected Check or Chevron */}
      <div className="flex items-center ps-2 flex-shrink-0">
        {selected ? (
          <div className="w-6 h-6 rounded-full bg-[#198341] dark:bg-[#ABDE3B] flex items-center justify-center text-white dark:text-zinc-950">
            <Check className="w-3.5 h-3.5" />
          </div>
        ) : showChevron ? (
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 rtl:rotate-180 transition-transform" />
        ) : null}
      </div>
    </div>
  );
};

export default SellerRowCard;
