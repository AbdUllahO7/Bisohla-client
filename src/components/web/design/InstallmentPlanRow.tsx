'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ListingInstallmentPlan,
  InstallmentPlanInputDto,
} from '@/core/entities/models/listings/installments.dto';
import { formatMoney, computeTotalInstallment } from '@/core/lib/installments';
import { cn } from '@/lib/utils';

interface InstallmentPlanRowProps {
  plan: ListingInstallmentPlan | InstallmentPlanInputDto;
  currency?: string;
  variant?: 'compact' | 'full';
  isArabic?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const InstallmentPlanRow: React.FC<InstallmentPlanRowProps> = ({
  plan,
  currency = 'USD',
  variant = 'full',
  isArabic = false,
  onEdit,
  onDelete,
  className,
}) => {
  const t = useTranslations('installments');

  const months = plan.months || 0;
  const downPayment =
    typeof plan.downPayment === 'string'
      ? parseFloat(plan.downPayment) || 0
      : plan.downPayment || 0;
  const monthlyAmount =
    typeof plan.monthlyAmount === 'string'
      ? parseFloat(plan.monthlyAmount) || 0
      : plan.monthlyAmount || 0;

  const total = computeTotalInstallment(downPayment, monthlyAmount, months);

  // Extract note with bilingual fallback
  let noteText: string | null = null;
  if ('note' in plan && plan.note) {
    noteText = plan.note;
  } else if (plan.noteTranslations) {
    noteText = isArabic
      ? plan.noteTranslations.ar || plan.noteTranslations.en || null
      : plan.noteTranslations.en || plan.noteTranslations.ar || null;
  }

  // Duration label formatted with pluralization
  const durationLabel =
    months === 1
      ? t('months_one', { count: months })
      : t('months_other', { count: months });

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-sm transition-all',
          className,
        )}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-zinc-100">
            {durationLabel}
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            {t('down_payment_value', {
              value: `${formatMoney(downPayment)} ${currency}`,
            })}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-bold text-[#198341] dark:text-[#ABDE3B]">
            {formatMoney(monthlyAmount)} {currency}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            {t('per_month')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onEdit}
      className={cn(
        'group relative p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-200',
        onEdit && 'cursor-pointer hover:border-[#198341]/50 dark:hover:border-[#ABDE3B]/50 hover:shadow-md',
        className,
      )}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left / Top info: Duration & Down payment */}
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {durationLabel}
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {t('down_payment_value', {
              value: `${formatMoney(downPayment)} ${currency}`,
            })}
          </span>
        </div>

        {/* Right / Top info: Monthly Amount */}
        <div className="flex flex-col items-end">
          <span className="text-lg font-extrabold text-[#198341] dark:text-[#ABDE3B]">
            {formatMoney(monthlyAmount)}{' '}
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
              {currency}
            </span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            {t('per_month')}
          </span>
        </div>
      </div>

      {/* Derived Total */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-zinc-400">
          {t('total_value', { value: `${formatMoney(total)} ${currency}` })}
        </span>

        {/* Actions (if edit / delete provided) */}
        {(onEdit || onDelete) && (
          <div
            className="flex items-center gap-1 opacity-90 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg"
                title={t('edit_plan')}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                title={t('remove_plan')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Note if present */}
      {noteText && (
        <div className="mt-2 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl leading-relaxed">
          {noteText}
        </div>
      )}
    </div>
  );
};

export default InstallmentPlanRow;
