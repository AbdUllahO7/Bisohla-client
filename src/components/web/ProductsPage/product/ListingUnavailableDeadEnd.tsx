'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ListingUnavailableDeadEnd() {
  const t = useTranslations('listingDeadEnd');
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <div className="bg-background min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#2C3C39] dark:text-zinc-100 mb-2">
          {t('unavailableTitle')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
          {t('unavailableDescription')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#198341] hover:bg-[#198341]/90 text-white font-bold text-sm transition-colors text-center"
          >
            {t('browseListings')}
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-[#2C3C39] dark:text-zinc-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}

