// components/SmartAppBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSettings } from '@/providers/settings.provider';
import Image from 'next/image';
import { mapWebUrlToDeepLink } from '@/lib/utils/link-to-deep-link';

export default function SmartAppBanner() {
  const t = useTranslations('smartAppBanner');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const { getAppSettings, getFavicon, isLoading } = useSettings();

  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);
  const [isOpeningApp, setIsOpeningApp] = useState(false);

  const appStoreUrl = getAppSettings()?.app_info?.app_store_url;
  const playStoreUrl = getAppSettings()?.app_info?.play_store_url;
  const logo = getFavicon();

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);

    if (!isIOS && !isAndroid) return;

    setPlatform(isIOS ? 'ios' : 'android');

    const dismissed = localStorage.getItem('app-banner-dismissed');
    const dismissedDate = localStorage.getItem('app-banner-dismissed-date');

    if (dismissed && dismissedDate) {
      const daysPassed =
        (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) return;
    }

    setShowBanner(true);
  }, []);

  const handleOpenApp = () => {
    setIsOpeningApp(true);

    const appUrl = mapWebUrlToDeepLink(window.location.href, {
      appScheme: 'bishola',
    }).deepLink;

    const storeUrl = platform === 'ios' ? appStoreUrl : playStoreUrl;

    // Track if app opened
    let appOpened = false;

    const visibilityHandler = () => {
      if (document.hidden) {
        appOpened = true;
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler);

    // Try to open the app with deep link using iframe. The mapper always
    // returns a bishola:// URL (it falls back to the app home on parse error),
    // so `appUrl` is effectively never null — `bishola://` is just a safety net.
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = appUrl || 'bishola://';
    document.body.appendChild(iframe);

    // If app doesn't open, redirect to store by simulating a link click
    setTimeout(() => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      document.body.removeChild(iframe);

      // Only go to store if app didn't open
      if (!appOpened && storeUrl) {
        // Create a link and click it - this opens store app natively (like WhatsApp does)
        const link = document.createElement('a');
        link.href = storeUrl;
        link.click();
      }

      setIsOpeningApp(false);
    }, 1500);
  };

  const handleDismiss = () => {
    localStorage.setItem('app-banner-dismissed', 'true');
    localStorage.setItem('app-banner-dismissed-date', Date.now().toString());
    setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  if (!showBanner || isLoading) return null;

  return (
    <div
      className="fixed bottom-0 z-[999] left-0 right-0 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg animate-slideDown"
      dir={direction}
    >
      <div className="flex items-center gap-3 p-4 max-w-screen-xl mx-auto">
        {/* App Icon */}
        <div className="relative w-16 h-16 rounded-xl shadow-md overflow-hidden flex-shrink-0">
          <Image
            src={logo}
            alt="Bishola App"
            fill
            className="object-contain p-1"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base leading-tight">{t('title')}</p>
          <p className="text-sm opacity-90 mt-1 line-clamp-2">
            {t('description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleOpenApp}
            disabled={isOpeningApp}
            className="bg-white text-primary px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isOpeningApp ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('opening')}
              </>
            ) : (
              t('openApp')
            )}
          </button>

          <button
            onClick={handleClose}
            className="text-white opacity-70 hover:opacity-100 p-2 transition-opacity"
            aria-label={t('closeAriaLabel')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Don't Show Again Button */}
      <div className="border-t border-white/20">
        <button
          onClick={handleDismiss}
          className="w-full text-center py-2.5 text-sm opacity-75 hover:opacity-100 transition-opacity"
        >
          {t('dontShowAgain')}
        </button>
      </div>
    </div>
  );
}
