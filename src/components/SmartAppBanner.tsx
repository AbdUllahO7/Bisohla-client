// components/SmartAppBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSettings } from '@/providers/settings.provider';
import Image from 'next/image';

export default function SmartAppBanner() {
  const pathname = usePathname();
  const t = useTranslations('smartAppBanner');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const { getAppSettings, getLogo, isLoading } = useSettings();
  
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

  const appStoreUrl = getAppSettings()?.app_info?.app_store_url;
  const playStoreUrl = getAppSettings()?.app_info?.play_store_url;
  const logo = getLogo();

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    
    if (!isIOS && !isAndroid) return;

    setPlatform(isIOS ? 'ios' : 'android');

    const dismissed = localStorage.getItem('app-banner-dismissed');
    const dismissedDate = localStorage.getItem('app-banner-dismissed-date');
    
    if (dismissed && dismissedDate) {
      const daysPassed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) return;
    }

    setShowBanner(true);
  }, []);

  const handleOpenApp = () => {
    const appUrl = `bishola://(screens)/BuyScreen`;
    window.location.href = appUrl;
    
    setTimeout(() => {
      if (platform === 'ios' && appStoreUrl) {
        window.location.href = appStoreUrl;
      } else if (platform === 'android' && playStoreUrl) {
        window.location.href = playStoreUrl;
      }
    }, 2500);
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
      className="fixed bottom-[0px] z-[999] left-0 right-0 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg  animate-slideDown"
      dir={direction}
    >
      <div className="flex items-center justify-between p-3 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-14 h-14 rounded-xl shadow-md overflow-hidden bg-white">
            <Image 
              src={logo} 
              alt="Bishola App" 
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="flex-1">
            <p className="font-bold text-base">{t('title')}</p>
            <p className="text-xs opacity-90 mt-0.5">{t('description')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenApp}
            className="bg-white text-primary px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-md"
          >
            <p className="text-xs opacity-90 mt-0.5">{t('description')}</p>
          </button>
          
          <button 
            onClick={handleClose}
            className="text-white opacity-70 hover:opacity-100 px-2 transition-opacity"
            aria-label={t('closeAriaLabel')}
          >
            
          </button>
        </div>
      </div>

      <div className="border-t border-white/20">
        <button 
          onClick={handleDismiss}
          className="w-full text-center py-2 text-xs opacity-75 hover:opacity-100 transition-opacity"
        >
          {t('dontShowAgain')}
        </button>
      </div>
    </div>
  );
}