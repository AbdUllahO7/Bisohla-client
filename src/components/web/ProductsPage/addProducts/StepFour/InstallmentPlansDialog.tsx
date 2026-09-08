'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useWatch } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CreditCard,
  Plus,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  InstallmentPlanInputDto,
  InstallmentsMode,
  ListingInstallmentOption,
  INSTALLMENTS_DEFAULT_MAX_PLANS_PER_LISTING,
  INSTALLMENTS_DEFAULT_MAX_MONTHS,
  INSTALLMENT_DURATION_PRESETS,
  DOWN_PAYMENT_PERCENT_PRESETS,
  INSTALLMENT_NOTE_MAX_LENGTH,
} from '@/core/entities/models/listings/installments.dto';
import {
  computeMonthlyAmount,
  computeTotalInstallment,
  formatMoney,
  roundToCents,
  validatePlanMonths,
  validatePlanDownPayment,
  validatePlanMonthlyAmount,
} from '@/core/lib/installments';
import InstallmentPlanRow from '@/components/web/design/InstallmentPlanRow';
import { cn } from '@/lib/utils';

interface InstallmentPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: InstallmentPlanInputDto[];
  onChange: (plans: InstallmentPlanInputDto[], available: boolean) => void;
  price: number | null;
  form?: any; // pass the react-hook-form instance for live price reading
  currency?: string;
  installmentsMode?: InstallmentsMode;
  installmentOptions?: ListingInstallmentOption[];
  maxPlans?: number;
  maxMonths?: number;
  initialView?: 'list' | 'add';
}

export const InstallmentPlansDialog: React.FC<InstallmentPlansDialogProps> = ({
  open,
  onOpenChange,
  plans,
  onChange,
  price,
  form,
  currency = 'USD',
  installmentsMode = 'free',
  installmentOptions = [],
  maxPlans = INSTALLMENTS_DEFAULT_MAX_PLANS_PER_LISTING,
  maxMonths = INSTALLMENTS_DEFAULT_MAX_MONTHS,
  initialView = 'list',
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations('installments');

  // Active view: 'list' or 'form'
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [months, setMonths] = useState<number | ''>('');
  const [customMonths, setCustomMonths] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [monthlyAmount, setMonthlyAmount] = useState<string>('');
  const [isMonthlyOverridden, setIsMonthlyOverridden] = useState<boolean>(false);
  const [noteExpanded, setNoteExpanded] = useState<boolean>(false);
  const [noteEn, setNoteEn] = useState<string>('');
  const [noteAr, setNoteAr] = useState<string>('');

  // Safe numeric price — read live from form if available, fallback to prop
  const watchedFormPrice = useWatch({
    control: form?.control,
    name: 'price',
  });

  const getFreshPrice = (): number => {
    // 1. Prefer live getValues (immediate, current form state)
    if (form && typeof form.getValues === 'function') {
      const gv = form.getValues('price');
      if (gv !== undefined && gv !== null && gv !== '') {
        const parsed = parseFloat(String(gv).replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    // 2. Prefer watched form price (reactive via useWatch)
    if (watchedFormPrice !== undefined && watchedFormPrice !== null && watchedFormPrice !== '') {
      const parsed = parseFloat(String(watchedFormPrice).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    // 3. Fallback to price prop
    if (price !== null && price !== undefined) {
      if (typeof price === 'number') return isNaN(price) || price <= 0 ? 0 : price;
      const parsed = parseFloat(String(price).replace(/[^0-9.]/g, ''));
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    }
    return 0;
  };

  const numericPrice = getFreshPrice();

  // Available duration options for chips
  const availableDurations = useMemo(() => {
    const rawOptions =
      installmentsMode === 'catalog'
        ? installmentOptions.map((o) => o.months)
        : INSTALLMENT_DURATION_PRESETS;

    const usedMonthsByOthers = plans
      .filter((_, i) => editingIndex === null || i !== editingIndex)
      .map((p) => p.months);

    return rawOptions.filter(
      (m) => m <= maxMonths && !usedMonthsByOthers.includes(m),
    );
  }, [installmentsMode, installmentOptions, maxMonths, plans, editingIndex]);

  // Synchronize view on open
  useEffect(() => {
    if (open) {
      if (initialView === 'add' || plans.length === 0) {
        openAddForm();
      } else {
        setView('list');
      }
    }
  }, [open, initialView, plans.length]);

  const openAddForm = () => {
    setEditingIndex(null);
    const defaultDuration = availableDurations.length > 0 ? availableDurations[0] : 12;
    setMonths(defaultDuration);
    setCustomMonths('');
    setDownPayment('0');
    const activePrice = getFreshPrice();
    if (activePrice > 0) {
      const computed = computeMonthlyAmount(activePrice, 0, defaultDuration);
      setMonthlyAmount(computed > 0 ? String(computed) : '');
    } else {
      setMonthlyAmount('');
    }
    setIsMonthlyOverridden(false);
    setNoteExpanded(false);
    setNoteEn('');
    setNoteAr('');
    setView('form');
  };

  const openEditForm = (index: number) => {
    const target = plans[index];
    if (!target) return;
    setEditingIndex(index);
    setMonths(target.months);
    setCustomMonths(
      INSTALLMENT_DURATION_PRESETS.includes(target.months)
        ? ''
        : String(target.months),
    );
    setDownPayment(String(target.downPayment));
    setMonthlyAmount(String(target.monthlyAmount));
    setIsMonthlyOverridden(true); // Editing existing plan never overwrites user's amount
    const hasNote =
      Boolean(target.noteTranslations?.en) ||
      Boolean(target.noteTranslations?.ar);
    setNoteExpanded(hasNote);
    setNoteEn(target.noteTranslations?.en || '');
    setNoteAr(target.noteTranslations?.ar || '');
    setView('form');
  };

  const handleDeletePlan = (index: number) => {
    const newPlans = plans.filter((_, i) => i !== index);
    onChange(newPlans, newPlans.length > 0);
  };

  const handleTurnOff = () => {
    onChange(plans, false);
    onOpenChange(false);
  };

  const handleDone = () => {
    onChange(plans, plans.length > 0);
    onOpenChange(false);
  };

  // Handle duration selection
  const handleSelectMonths = (m: number) => {
    setMonths(m);
    setCustomMonths('');

    const activePrice = getFreshPrice();
    // Recompute monthly amount if not overridden
    if (!isMonthlyOverridden && activePrice > 0) {
      const dp = parseFloat(downPayment) || 0;
      const computed = computeMonthlyAmount(activePrice, dp, m);
      setMonthlyAmount(computed > 0 ? String(computed) : '');
    }
  };

  const handleCustomMonthsChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    setCustomMonths(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num > 0) {
      setMonths(num);
      const activePrice = getFreshPrice();
      if (!isMonthlyOverridden && activePrice > 0) {
        const dp = parseFloat(downPayment) || 0;
        const computed = computeMonthlyAmount(activePrice, dp, num);
        setMonthlyAmount(computed > 0 ? String(computed) : '');
      }
    } else {
      setMonths('');
    }
  };

  // Handle down payment change
  const handleDownPaymentChange = (val: string) => {
    setDownPayment(val);
    const dp = parseFloat(val) || 0;
    const activeMonths = typeof months === 'number' && months > 0 ? months : (availableDurations[0] || 12);
    if (typeof months !== 'number' || months <= 0) {
      setMonths(activeMonths);
    }
    const activePrice = getFreshPrice();
    if (!isMonthlyOverridden && activePrice > 0 && activeMonths > 0) {
      const computed = computeMonthlyAmount(activePrice, dp, activeMonths);
      setMonthlyAmount(computed > 0 ? String(computed) : '');
    }
  };

  const handleDownPaymentPercent = (percent: number) => {
    const activePrice = getFreshPrice();
    const activeMonths = typeof months === 'number' && months > 0
      ? months
      : (availableDurations[0] || 12);
    
    if (typeof months !== 'number' || months <= 0) {
      setMonths(activeMonths);
    }

    if (percent === 0) {
      setDownPayment('0');
      if (activePrice > 0 && activeMonths > 0) {
        const computed = computeMonthlyAmount(activePrice, 0, activeMonths);
        setMonthlyAmount(computed > 0 ? String(computed) : '');
        setIsMonthlyOverridden(false);
      }
      return;
    }

    if (activePrice <= 0) {
      setDownPayment('0');
      return;
    }

    const computedDp = roundToCents((activePrice * percent) / 100);
    setDownPayment(String(computedDp));

    if (activeMonths > 0) {
      const computed = computeMonthlyAmount(activePrice, computedDp, activeMonths);
      setMonthlyAmount(computed > 0 ? String(computed) : '');
      setIsMonthlyOverridden(false);
    }
  };

  const handleMonthlyAmountChange = (val: string) => {
    setMonthlyAmount(val);
    setIsMonthlyOverridden(true);
  };

  const handleResetMonthlyAmount = () => {
    const activeMonths = typeof months === 'number' && months > 0 ? months : (availableDurations[0] || 12);
    const activePrice = getFreshPrice();
    if (activePrice > 0 && activeMonths > 0) {
      const dp = parseFloat(downPayment) || 0;
      const computed = computeMonthlyAmount(activePrice, dp, activeMonths);
      setMonthlyAmount(computed > 0 ? String(computed) : '');
      setIsMonthlyOverridden(false);
    }
  };

  // Live calculated values for the math panel
  const numericDownPayment = parseFloat(downPayment) || 0;
  const numericToFinance = Math.max(0, numericPrice - numericDownPayment);
  const numericMonths = typeof months === 'number' ? months : 0;
  const numericMonthlyAmount = parseFloat(monthlyAmount) || 0;
  const derivedTotal = computeTotalInstallment(
    numericDownPayment,
    numericMonthlyAmount,
    numericMonths,
  );
  const overCashPrice =
    derivedTotal > numericPrice ? derivedTotal - numericPrice : 0;

  // Validation
  const catalogMonthsList =
    installmentsMode === 'catalog'
      ? installmentOptions.map((o) => o.months)
      : null;
  const otherPlansMonths = plans
    .filter((_, i) => editingIndex === null || i !== editingIndex)
    .map((p) => p.months);

  const monthsError = validatePlanMonths(
    typeof months === 'number' ? months : null,
    maxMonths,
    catalogMonthsList,
    otherPlansMonths,
  );
  const downPaymentError = validatePlanDownPayment(
    downPayment !== '' ? numericDownPayment : null,
    numericPrice,
  );
  const monthlyAmountError = validatePlanMonthlyAmount(
    monthlyAmount !== '' ? numericMonthlyAmount : null,
  );

  const isFormValid =
    typeof months === 'number' &&
    months > 0 &&
    downPayment !== '' &&
    monthlyAmount !== '' &&
    !monthsError &&
    !downPaymentError &&
    !monthlyAmountError;

  const handleSavePlan = () => {
    if (!isFormValid || typeof months !== 'number') return;

    const newPlan: InstallmentPlanInputDto = {
      months,
      downPayment: roundToCents(numericDownPayment),
      monthlyAmount: roundToCents(numericMonthlyAmount),
      noteTranslations:
        noteEn.trim() || noteAr.trim()
          ? {
              en: noteEn.trim() || null,
              ar: noteAr.trim() || null,
            }
          : null,
      displayOrder: editingIndex !== null ? plans[editingIndex].displayOrder : plans.length,
    };

    let updatedPlans = [...plans];
    if (editingIndex !== null) {
      updatedPlans[editingIndex] = newPlan;
    } else {
      updatedPlans.push(newPlan);
    }

    // Sort by displayOrder, then months
    updatedPlans.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.months - b.months);

    onChange(updatedPlans, true);
    onOpenChange(false);
  };

  const isCatalogExhausted =
    installmentsMode === 'catalog' && availableDurations.length === 0;
  const isMaxReached = plans.length >= maxPlans;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto p-0 rounded-3xl border dark:border-zinc-800"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* VIEW 1: PLANS LIST */}
        {view === 'list' && (
          <div className="flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b dark:border-zinc-800 flex flex-row items-center gap-3 space-y-0">
              <div className="w-10 h-10 rounded-2xl bg-[#198341]/10 flex items-center justify-center text-[#198341] dark:text-[#ABDE3B] flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('sheet_title')}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
                  {plans.length === 0 ? t('empty_hint') : t('description')}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-4">
              {plans.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 max-w-xs mb-4">
                    {t('empty_hint')}
                  </p>
                  <Button
                    type="button"
                    onClick={openAddForm}
                    className="bg-[#198341] hover:bg-[#156d35] text-white rounded-xl gap-2 font-bold text-xs h-10 px-4"
                  >
                    <Plus className="w-4 h-4" />
                    {t('add_first')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map((p, idx) => (
                    <InstallmentPlanRow
                      key={`${p.months}-${idx}`}
                      plan={p}
                      currency={currency}
                      variant="full"
                      isArabic={isArabic}
                      onEdit={() => openEditForm(idx)}
                      onDelete={() => handleDeletePlan(idx)}
                    />
                  ))}

                  {/* Add plan CTA or limit notice */}
                  <div className="pt-2">
                    {!isMaxReached && !isCatalogExhausted ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openAddForm}
                        className="w-full h-11 border-dashed border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-[#198341] hover:text-[#198341] rounded-xl font-bold text-xs gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t('add_plan')}
                      </Button>
                    ) : (
                      <p className="text-xs text-center text-slate-400 dark:text-zinc-500 py-1">
                        {isCatalogExhausted
                          ? t('catalog_exhausted')
                          : t('max_reached', { max: maxPlans })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-2 border-t dark:border-zinc-800 flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleDone}
                className="w-full h-11 bg-[#198341] hover:bg-[#156d35] text-white font-bold rounded-xl"
              >
                {t('done')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleTurnOff}
                className="w-full h-10 text-slate-500 dark:text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium text-xs rounded-xl"
              >
                {t('turn_off')}
              </Button>
            </div>
          </div>
        )}

        {/* VIEW 2: SINGLE PLAN FORM */}
        {view === 'form' && (
          <div className="flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b dark:border-zinc-800 flex flex-row items-center gap-3 space-y-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setView('list')}
                className="h-8 w-8 rounded-xl text-slate-600 dark:text-zinc-300"
              >
                {isArabic ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
              </Button>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                {editingIndex !== null ? t('edit_plan') : t('add_plan')}
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* 1. DURATION */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('duration')} <span className="text-red-500">*</span>
                </Label>

                {availableDurations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableDurations.map((m) => {
                      const isSelected = months === m && customMonths === '';
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleSelectMonths(m)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200',
                            isSelected
                              ? 'bg-[#198341] text-white border-[#198341] shadow-sm'
                              : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-slate-300',
                          )}
                        >
                          {m === 1
                            ? t('months_one', { count: m })
                            : t('months_other', { count: m })}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  installmentsMode === 'catalog' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {t('catalog_exhausted')}
                    </p>
                  )
                )}

                {/* Free mode custom duration input */}
                {installmentsMode === 'free' && (
                  <div className="pt-1">
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={t('duration_placeholder')}
                        value={customMonths}
                        onChange={(e) => handleCustomMonthsChange(e.target.value)}
                        className="h-10 pe-16 border-slate-200 dark:border-zinc-800 rounded-xl text-sm"
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        {t('duration_unit')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                      {t('duration_hint', { max: maxMonths })}
                    </span>
                  </div>
                )}

                {monthsError && months !== '' && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {t(monthsError as any, { max: maxMonths })}
                  </p>
                )}
              </div>

              {/* 2. DOWN PAYMENT */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('down_payment')} <span className="text-red-500">*</span>
                </Label>

                <div className="flex flex-wrap gap-2 mb-2">
                  {DOWN_PAYMENT_PERCENT_PRESETS.map((pct) => {
                    const isSelected =
                      numericPrice > 0 &&
                      ((pct === 0 && (numericDownPayment === 0 || downPayment === '0')) ||
                        (pct > 0 &&
                          Math.abs(
                            numericDownPayment -
                              roundToCents((numericPrice * pct) / 100),
                          ) < 0.01));
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleDownPaymentPercent(pct)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                          isSelected
                            ? 'bg-[#198341] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300',
                        )}
                      >
                        {t('down_payment_percent', { percent: pct })}
                      </button>
                    );
                  })}
                </div>

                {numericPrice <= 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 py-1 px-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {locale === 'ar'
                        ? 'يرجى إدخال سعر الإعلان في الخطوة السابقة لتفعيل الحساب التلقائي للنسب والقسط الشهري'
                        : 'Please enter the listing price in the form to enable automatic percentage and installment calculations'}
                    </span>
                  </p>
                )}

                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={downPayment}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      handleDownPaymentChange(val);
                    }}
                    placeholder="0"
                    className="h-10 pe-14 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    {currency}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                  {numericPrice > 0 && numericDownPayment > 0
                    ? t('down_payment_of_price', {
                        percent: Math.round((numericDownPayment / numericPrice) * 100),
                      })
                    : t('down_payment_hint')}
                </span>

                {downPaymentError && downPayment !== '' && (
                  <p className="text-xs text-red-500 font-medium">
                    {t(downPaymentError as any)}
                  </p>
                )}
              </div>

              {/* 3. MONTHLY AMOUNT */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('monthly_amount')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={monthlyAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      handleMonthlyAmountChange(val);
                    }}
                    placeholder="0"
                    className="h-10 pe-14 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-[#198341] dark:text-[#ABDE3B]"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    {currency}
                  </span>
                </div>

                {isMonthlyOverridden && (
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>
                      {t('monthly_calculated', {
                        value: `${formatMoney(
                          computeMonthlyAmount(
                            numericPrice,
                            numericDownPayment,
                            numericMonths,
                          ),
                        )} ${currency}`,
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={handleResetMonthlyAmount}
                      className="text-[#198341] hover:underline font-bold flex items-center gap-1 flex-shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {t('monthly_reset')}
                    </button>
                  </div>
                )}

                {monthlyAmountError && monthlyAmount !== '' && (
                  <p className="text-xs text-red-500 font-medium">
                    {t(monthlyAmountError as any)}
                  </p>
                )}
              </div>

              {/* 4. OPTIONAL NOTE */}
              <div className="pt-1">
                {!noteExpanded ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNoteExpanded(true)}
                    className="text-xs text-slate-500 hover:text-[#198341] p-0 h-auto font-medium gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('note_add')}
                  </Button>
                ) : (
                  <div className="space-y-3 bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('note')}
                    </Label>

                    <div className="space-y-2">
                      <Textarea
                        value={noteAr}
                        onChange={(e) =>
                          setNoteAr(e.target.value.slice(0, INSTALLMENT_NOTE_MAX_LENGTH))
                        }
                        placeholder="ملاحظات باللغة العربية (مثال: متوفر كفالة بنكية)..."
                        maxLength={INSTALLMENT_NOTE_MAX_LENGTH}
                        rows={2}
                        className="text-xs rounded-xl border-slate-200 dark:border-zinc-700 text-right"
                        dir="rtl"
                      />
                      <span className="text-[10px] text-slate-400 block text-end">
                        {noteAr.length}/{INSTALLMENT_NOTE_MAX_LENGTH}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        value={noteEn}
                        onChange={(e) =>
                          setNoteEn(e.target.value.slice(0, INSTALLMENT_NOTE_MAX_LENGTH))
                        }
                        placeholder="Notes in English (optional)..."
                        maxLength={INSTALLMENT_NOTE_MAX_LENGTH}
                        rows={2}
                        className="text-xs rounded-xl border-slate-200 dark:border-zinc-700 text-left"
                        dir="ltr"
                      />
                      <span className="text-[10px] text-slate-400 block text-end">
                        {noteEn.length}/{INSTALLMENT_NOTE_MAX_LENGTH}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. LIVE MATHS PANEL */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>{t('price_label')}</span>
                  <span className="font-mono">
                    {numericPrice > 0 ? `${formatMoney(numericPrice)} ${currency}` : '—'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>{t('down_payment_line')}</span>
                  <span className="font-mono">
                    {downPayment !== ''
                      ? `${formatMoney(numericDownPayment)} ${currency}`
                      : '—'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700 dark:text-zinc-300 font-semibold pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                  <span>{t('to_finance')}</span>
                  <span className="font-mono">
                    {numericPrice > 0 ? `${formatMoney(numericToFinance)} ${currency}` : '—'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>
                    {numericMonths > 0
                      ? t('monthly_line', { months: numericMonths })
                      : '× — months'}
                  </span>
                  <span className="font-mono">
                    {monthlyAmount !== ''
                      ? `${formatMoney(numericMonthlyAmount)} ${currency}`
                      : '—'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-2 border-t border-slate-200 dark:border-zinc-700">
                  <span>{t('total_line')}</span>
                  <span className="font-mono text-[#198341] dark:text-[#ABDE3B]">
                    {derivedTotal > 0
                      ? `${formatMoney(derivedTotal)} ${currency}`
                      : '—'}
                  </span>
                </div>

                {overCashPrice > 0 && (
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-end italic">
                    {t('over_cash_price', {
                      value: `${formatMoney(overCashPrice)} ${currency}`,
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-2 border-t dark:border-zinc-800 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setView('list')}
                className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300"
              >
                {t('cancel_plan')}
              </Button>

              <Button
                type="button"
                disabled={!isFormValid}
                onClick={handleSavePlan}
                className="h-10 px-6 rounded-xl text-xs font-bold bg-[#198341] hover:bg-[#156d35] text-white disabled:opacity-50"
              >
                {t('save_plan')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstallmentPlansDialog;
