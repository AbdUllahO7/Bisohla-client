'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useWatch } from 'react-hook-form';
import { CreditCard, Plus, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  InstallmentPlanInputDto,
  InstallmentsMode,
  ListingInstallmentOption,
  SUMMARY_VISIBLE_PLANS,
} from '@/core/entities/models/listings/installments.dto';
import InstallmentPlanRow from '@/components/web/design/InstallmentPlanRow';
import InstallmentPlansDialog from './InstallmentPlansDialog';
import { cn } from '@/lib/utils';

interface InstallmentsCardProps {
  form?: any;
  listingTypePolicy?: {
    rentEnabled?: boolean;
    installmentsEnabled?: boolean;
    installmentsMode?: InstallmentsMode;
    installmentOptions?: ListingInstallmentOption[];
  } | null;
  installmentsEnabled?: boolean;
  listingOfferType?: string;
  available?: boolean;
  plans?: InstallmentPlanInputDto[];
  onChange?: (plans: InstallmentPlanInputDto[], available: boolean) => void;
  price?: number | null;
  currency?: string;
  installmentsMode?: InstallmentsMode;
  installmentOptions?: ListingInstallmentOption[];
  maxPlans?: number;
  maxMonths?: number;
  error?: string;
  className?: string;
  direction?: 'ltr' | 'rtl';
}

export const InstallmentsCard: React.FC<InstallmentsCardProps> = ({
  form,
  listingTypePolicy,
  installmentsEnabled,
  listingOfferType = 'for_sale',
  available,
  plans,
  onChange,
  price,
  currency = 'USD',
  installmentsMode,
  installmentOptions,
  maxPlans,
  maxMonths,
  error,
  className,
  direction,
}) => {
  const locale = useLocale();
  const isArabic = direction ? direction === 'rtl' : locale === 'ar';
  const t = useTranslations('installments');

  // Policy resolution
  const policyInstallmentsEnabled =
    installmentsEnabled !== undefined
      ? installmentsEnabled
      : (listingTypePolicy?.installmentsEnabled ?? true);
  const effectiveMode = installmentsMode || listingTypePolicy?.installmentsMode || 'free';
  const effectiveOptions = installmentOptions || listingTypePolicy?.installmentOptions || [];

  const currentAvailable = form ? Boolean(form.watch('installmentsAvailable')) : (available ?? false);
  const currentPlans: InstallmentPlanInputDto[] = form ? (form.watch('installmentPlans') || []) : (plans ?? []);
  // Subscribe to form price reactively
  const watchedFormPrice = useWatch({
    control: form?.control,
    name: 'price',
  });

  const currentPrice: number | null = (() => {
    // 1. Try getValues (immediate/fresh value from form)
    if (form && typeof form.getValues === 'function') {
      const gv = form.getValues('price');
      if (gv !== undefined && gv !== null && gv !== '') {
        const parsed = parseFloat(String(gv).replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    // 2. Try watchedFormPrice (reactive via useWatch)
    if (watchedFormPrice !== undefined && watchedFormPrice !== null && watchedFormPrice !== '') {
      const parsed = parseFloat(String(watchedFormPrice).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    // 3. Fallback: use price prop
    if (price !== undefined && price !== null) {
      if (typeof price === 'number') return isNaN(price) || price <= 0 ? null : price;
      const parsed = parseFloat(String(price).replace(/[^0-9.]/g, ''));
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    }
    return null;
  })();
  const currentCurrency = currency || (form ? form.watch('currency') : 'USD');
  const formError = error || (form?.formState?.errors?.installmentPlans?.message as string | undefined);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInitialView, setDialogInitialView] = useState<'list' | 'add'>('list');

  // Don't render for rent offers or when installments are disabled in policy
  if (listingOfferType === 'for_rent' || !policyInstallmentsEnabled) {
    return null;
  }

  const handlePlansChange = (newPlans: InstallmentPlanInputDto[], newAvailable: boolean) => {
    if (form) {
      form.setValue('installmentsAvailable', newAvailable, { shouldValidate: true, shouldDirty: true });
      form.setValue('installmentPlans', newPlans, { shouldValidate: true, shouldDirty: true });
      form.trigger(['installmentsAvailable', 'installmentPlans']);
    }
    if (onChange) {
      onChange(newPlans, newAvailable);
    }
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Turning ON: if no plans exist yet, auto-open Add dialog
      if (currentPlans.length === 0) {
        setDialogInitialView('add');
        setDialogOpen(true);
      } else {
        handlePlansChange(currentPlans, true);
      }
    } else {
      // Turning OFF: keep plans in state, set available to false
      handlePlansChange(currentPlans, false);
    }
  };

  const handleOpenManager = () => {
    setDialogInitialView('list');
    setDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setDialogInitialView('add');
    setDialogOpen(true);
  };

  const visiblePlans = currentPlans.slice(0, SUMMARY_VISIBLE_PLANS);
  const remainingCount = currentPlans.length - SUMMARY_VISIBLE_PLANS;

  return (
    <>
      <Card
        className={cn(
          'w-full border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-200',
          formError && 'border-red-500 dark:border-red-500',
          className
        )}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <CardContent className="p-5 space-y-4">
          {/* Header with Icon, Title, Description, and Switch */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#198341]/10 flex items-center justify-center text-[#198341] dark:text-[#ABDE3B] flex-shrink-0 mt-0.5">
                <CreditCard className="w-5 h-5" />
              </div>

              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('title')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-md">
                  {t('description')}
                </p>
              </div>
            </div>

            <Switch
              checked={currentAvailable}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-[#198341]"
            />
          </div>

          {/* Body based on 4 states */}
          {/* State 1: Off, no plans -> Nothing rendered below */}

          {/* State 2: Off, plans exist -> Notice */}
          {!currentAvailable && currentPlans.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <p className="text-xs font-semibold text-[#198341] dark:text-[#ABDE3B]">
                {currentPlans.length === 1
                  ? t('kept_one')
                  : t('kept_other', { count: currentPlans.length })}
              </p>
            </div>
          )}

          {/* State 3: On, 0 plans */}
          {currentAvailable && currentPlans.length === 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {t('empty_hint')}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleOpenAdd}
                className="bg-[#198341] hover:bg-[#156d35] text-white rounded-xl gap-1.5 font-bold text-xs h-9"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('add_first')}
              </Button>
            </div>
          )}

          {/* State 4: On, >= 1 plan */}
          {currentAvailable && currentPlans.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
              <div className="space-y-2">
                {visiblePlans.map((p, idx) => (
                  <InstallmentPlanRow
                    key={`${p.months}-${idx}`}
                    plan={p}
                    currency={currentCurrency}
                    variant="compact"
                    isArabic={isArabic}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                {remainingCount > 0 ? (
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                    {t('more_plans', { more: remainingCount })}
                  </span>
                ) : (
                  <span />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenManager}
                  className="text-xs font-bold text-[#198341] dark:text-[#ABDE3B] hover:bg-[#198341]/10 rounded-xl gap-1.5 h-8"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  {t('manage')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form-level error message */}
      {formError && (
        <p
          className="text-xs text-red-500 font-medium px-1 mt-1"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {formError.startsWith('installments.')
            ? t(formError.replace('installments.', '') as any, { defaultValue: formError })
            : formError.startsWith('errors.')
            ? t(formError as any, { defaultValue: formError })
            : formError}
        </p>
      )}

      {/* Plan management modal dialog */}
      <InstallmentPlansDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plans={currentPlans}
        onChange={(newPlans, newAvail) => handlePlansChange(newPlans, newAvail)}
        price={currentPrice}
        form={form}
        currency={currentCurrency}
        installmentsMode={effectiveMode}
        installmentOptions={effectiveOptions}
        maxPlans={maxPlans}
        maxMonths={maxMonths}
        initialView={dialogInitialView}
      />
    </>
  );
};

export default InstallmentsCard;
