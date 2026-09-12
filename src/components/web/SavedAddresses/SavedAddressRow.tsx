'use client';

import React from 'react';
import { MapPin, Star, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useDirection } from '@/hooks/use-direction';
import { Badge } from '@/components/ui/badge';
import { UserAddress } from '@/core/entities/models/users/saved-address.dto';
import {
  SyriaGovernorate_ARABIC_NAMES,
  SyriaCity_ARABIC_NAMES,
} from '@/core/entities/enums/syria.enums';
import { cn } from '@/lib/utils';

interface SavedAddressRowProps {
  address: UserAddress;
  variant?: 'manageable' | 'selectable';
  isSelected?: boolean;
  onEdit?: (address: UserAddress) => void;
  onSelect?: (address: UserAddress) => void;
  onSetDefault?: (address: UserAddress) => Promise<void> | void;
  isSettingDefault?: boolean;
}

export const getLocalizedLocationText = (
  address: UserAddress,
  locale: string
): string => {
  const gov = address.governorate
    ? locale === 'ar'
      ? (SyriaGovernorate_ARABIC_NAMES as Record<string, string>)[address.governorate] || address.governorate
      : address.governorate.replace(/-/g, ' ')
    : '';

  const city = address.city
    ? locale === 'ar'
      ? (SyriaCity_ARABIC_NAMES as Record<string, string>)[address.city] || address.city
      : address.city.replace(/-/g, ' ')
    : '';

  if (city && gov) {
    return `${city}, ${gov}`;
  }
  return city || gov || '';
};

export const SavedAddressRow: React.FC<SavedAddressRowProps> = ({
  address,
  variant = 'manageable',
  isSelected = false,
  onEdit,
  onSelect,
  onSetDefault,
  isSettingDefault = false,
}) => {
  const locale = useLocale();
  const direction = useDirection();
  const t = useTranslations();

  const locationText = getLocalizedLocationText(address, locale);

  const handleBodyClick = () => {
    if (variant === 'manageable') {
      onEdit?.(address);
    } else if (variant === 'selectable') {
      onSelect?.(address);
    }
  };

  const handleSetDefaultClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSettingDefault && onSetDefault) {
      onSetDefault(address);
    }
  };

  const ChevronIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-zinc-900 border rounded-2xl transition-all duration-200 shadow-sm overflow-hidden',
        isSelected
          ? 'border-primary ring-1 ring-primary bg-primary/5 dark:bg-primary/10'
          : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md'
      )}
    >
      {/* Row Body */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleBodyClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBodyClick();
          }
        }}
        aria-label={
          variant === 'manageable'
            ? t('savedAddress.edit_hint')
            : t('savedAddress.select_hint')
        }
        className="flex items-start gap-3.5 p-4 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* Map pin circle icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            address.isDefault
              ? 'bg-primary/15 text-primary'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary'
          )}
        >
          <MapPin className="w-5 h-5" />
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-base text-slate-800 dark:text-white truncate">
              {address.label}
            </span>
            {address.isDefault && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 rounded-full font-medium"
              >
                {t('savedAddress.default_badge')}
              </Badge>
            )}
          </div>

          {locationText && (
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-300 truncate">
              {locationText}
            </p>
          )}

          {address.address && (
            <p className="text-xs text-slate-400 dark:text-zinc-400 line-clamp-2 mt-0.5">
              {address.address}
            </p>
          )}
        </div>

        {/* Right side icon */}
        <div className="flex-shrink-0 self-center ps-2">
          {variant === 'manageable' && (
            <ChevronIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          )}
          {variant === 'selectable' && isSelected && (
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Manageable Footer: Set as Default Action */}
      {variant === 'manageable' && !address.isDefault && (
        <div className="border-t border-slate-100 dark:border-zinc-800/80 px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSetDefaultClick}
            disabled={isSettingDefault}
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingDefault ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Star className="w-3.5 h-3.5 fill-primary/20" />
            )}
            <span>{t('savedAddress.set_default_action')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
