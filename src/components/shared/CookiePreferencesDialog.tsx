'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CookieConsentCategories } from '@/core/lib/web/cookie-consent';
import { ShieldCheck, BarChart3, Sliders, Megaphone } from 'lucide-react';

interface CookiePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCategories: CookieConsentCategories;
  onSavePreferences: (categories: CookieConsentCategories) => void;
  onAcceptAll: () => void;
}

export default function CookiePreferencesDialog({
  open,
  onOpenChange,
  currentCategories,
  onSavePreferences,
  onAcceptAll,
}: CookiePreferencesDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('cookieConsent');

  const [categories, setCategories] = useState<CookieConsentCategories>(currentCategories);

  useEffect(() => {
    setCategories(currentCategories);
  }, [currentCategories, open]);

  const handleToggle = (key: keyof CookieConsentCategories) => {
    if (key === 'necessary') return; // strictly necessary cannot be disabled
    setCategories((prev) => ({
      ...prev,
      [key]: prev[key] ? 0 : 1,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRTL ? 'rtl' : 'ltr'}
        className="max-w-xl max-h-[85vh] flex flex-col p-6 rounded-2xl sm:rounded-3xl"
      >
        <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800 text-start">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
            {t('preferencesTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-zinc-400 pt-1 leading-relaxed">
            {t('preferencesDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-start">
          {/* Necessary Cookies */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-[#ABDE3B] shrink-0" />
                <h4 className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
                  {t('necessaryTitle')}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {t('alwaysActive')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                {t('necessaryDescription')}
              </p>
            </div>
            <Switch checked disabled className="data-[state=checked]:bg-emerald-600 shrink-0 mt-0.5" />
          </div>

          {/* Preferences Cookies */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-700 dark:text-zinc-300 shrink-0" />
                <h4 className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
                  {t('functionalTitle')}
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                {t('functionalDescription')}
              </p>
            </div>
            <Switch
              checked={Boolean(categories.preferences)}
              onCheckedChange={() => handleToggle('preferences')}
              className="data-[state=checked]:bg-emerald-600 shrink-0 mt-0.5"
            />
          </div>

          {/* Analytics Cookies */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-700 dark:text-zinc-300 shrink-0" />
                <h4 className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
                  {t('analyticsTitle')}
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                {t('analyticsDescription')}
              </p>
            </div>
            <Switch
              checked={Boolean(categories.analytics)}
              onCheckedChange={() => handleToggle('analytics')}
              className="data-[state=checked]:bg-emerald-600 shrink-0 mt-0.5"
            />
          </div>

          {/* Marketing Cookies */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-gray-700 dark:text-zinc-300 shrink-0" />
                <h4 className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
                  {t('marketingTitle')}
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                {t('marketingDescription')}
              </p>
            </div>
            <Switch
              checked={Boolean(categories.marketing)}
              onCheckedChange={() => handleToggle('marketing')}
              className="data-[state=checked]:bg-emerald-600 shrink-0 mt-0.5"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSavePreferences(categories)}
            className="w-full sm:w-auto rounded-xl"
          >
            {t('savePreferences')}
          </Button>
          <Button
            type="button"
            onClick={onAcceptAll}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            {t('acceptAll')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
