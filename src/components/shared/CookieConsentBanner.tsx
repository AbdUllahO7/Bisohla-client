'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/providers/cookie-consent.provider';
import CookiePreferencesDialog from './CookiePreferencesDialog';
import { Cookie } from 'lucide-react';

export default function CookieConsentBanner() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('cookieConsent');
  const [mounted, setMounted] = useState(false);

  const {
    hasAnswered,
    categories,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    isPreferencesOpen,
    openPreferences,
    closePreferences,
  } = useCookieConsent();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || hasAnswered) {
    return (
      <CookiePreferencesDialog
        open={isPreferencesOpen}
        onOpenChange={(open) => (open ? openPreferences() : closePreferences())}
        currentCategories={categories}
        onSavePreferences={savePreferences}
        onAcceptAll={acceptAll}
      />
    );
  }

  return (
    <>
      <div
        className="fixed bottom-0 inset-x-0 z-[990] p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 shadow-2xl animate-slideUp"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-4xl text-start">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-[#ABDE3B] flex-shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold text-gray-900 dark:text-zinc-100">
                {t('bannerTitle')}
              </span>{' '}
              {t('bannerDescription')}{' '}
              <Link
                href="/legal/cookie-policy"
                className="text-emerald-600 dark:text-[#ABDE3B] font-medium hover:underline inline-flex"
              >
                {t('readPolicy')}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end flex-shrink-0">
           
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={rejectNonEssential}
              className="text-xs rounded-xl flex-1 sm:flex-initial text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100"
            >
              {t('rejectNonEssential')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={acceptAll}
              className="text-xs rounded-xl flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {t('acceptAll')}
            </Button>
          </div>
        </div>
      </div>

      <CookiePreferencesDialog
        open={isPreferencesOpen}
        onOpenChange={(open) => (open ? openPreferences() : closePreferences())}
        currentCategories={categories}
        onSavePreferences={savePreferences}
        onAcceptAll={acceptAll}
      />
    </>
  );
}
