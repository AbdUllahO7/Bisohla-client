'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ListingInstallmentPlan } from '@/core/entities/models/listings/installments.dto';
import { computeMinMonthlyInstallment, formatMoney } from '@/core/lib/installments';
import InstallmentPlanRow from '@/components/web/design/InstallmentPlanRow';
import { cn } from '@/lib/utils';

interface InstallmentsSummaryRowProps {
  installmentsAvailable?: boolean;
  installmentPlans?: ListingInstallmentPlan[];
  plans?: ListingInstallmentPlan[];
  currency?: string;
  className?: string;
}

export const InstallmentsSummaryRow: React.FC<InstallmentsSummaryRowProps> = ({
  installmentsAvailable,
  installmentPlans,
  plans,
  currency = 'USD',
  className,
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations('listing.detail');
  const tCard = useTranslations('listing.card');

  const [dialogOpen, setDialogOpen] = useState(false);

  const activePlans = plans || installmentPlans || [];
  const isAvailable = installmentsAvailable !== undefined ? installmentsAvailable : activePlans.length > 0;

  if (!isAvailable || activePlans.length === 0) {
    return null;
  }

  const minMonthly = computeMinMonthlyInstallment(activePlans);
  const planCount = activePlans.length;

  const plansCountText =
    planCount === 1
      ? t('installments_summary_plans_one')
      : t('installments_summary_plans_other', { count: planCount });

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={cn(
          'w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-[#198341]/50 dark:hover:border-[#ABDE3B]/50 transition-all duration-200 text-start group',
          className,
        )}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#198341]/10 flex items-center justify-center text-[#198341] dark:text-[#ABDE3B] group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#198341] dark:group-hover:text-[#ABDE3B] transition-colors">
              {t('installments_summary_title')}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {minMonthly !== null
                ? `${tCard('installments_from', { amount: `${formatMoney(minMonthly)} ${currency}` })} · ${plansCountText}`
                : plansCountText}
            </span>
          </div>
        </div>

        <div className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200 transition-colors">
          {isArabic ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto p-0 rounded-3xl border dark:border-zinc-800"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <DialogHeader className="p-6 pb-4 border-b dark:border-zinc-800 flex flex-row items-center gap-3.5 space-y-0">
            <div className="w-10 h-10 rounded-2xl bg-[#198341]/10 flex items-center justify-center text-[#198341] dark:text-[#ABDE3B] flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                {t('installments_title')}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
                {t('installments_subtitle')}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-3">
            {activePlans.map((plan, idx) => (
              <InstallmentPlanRow
                key={`${plan.months}-${idx}`}
                plan={plan}
                currency={currency}
                variant="full"
                isArabic={isArabic}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallmentsSummaryRow;
