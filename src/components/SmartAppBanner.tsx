// components/SmartAppBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSettings } from '@/providers/settings.provider';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';

type BannerState = 'checking' | 'app-installed' | 'app-not-installed';

// Map web routes to app deep links
function getAppDeepLink(webPath: string, searchParams: URLSearchParams): string {
  // Remove locale prefix (ar, en, tr)
  const path = webPath.replace(/^\/(ar|en|tr)/, '');
  
  // Route mappings
  const routes: Record<string, (params: URLSearchParams) => string> = {
    // Home/Root
    '/': () => 'bishola://',
    
    // Authentication
    '/login': () => 'bishola://(auth)/LoginScreen',
    '/signup': () => 'bishola://(auth)/SignupScreen',
    '/forgot-password': () => 'bishola://(auth)/SendResetEmailScreen',
    '/reset-password': (params) => {
      const token = params.get('token') || '';
      return `bishola://(auth)/ResetPasswordScreen?token=${token}`;
    },
    
    // Main screens
    '/buy': (params) => {
      const filters = params.get('filters');
      return filters 
        ? `bishola://(screens)/BuyScreen?filters=${encodeURIComponent(filters)}`
        : 'bishola://(screens)/BuyScreen';
    },
    '/rent': (params) => {
      const filters = params.get('filters');
      return filters 
        ? `bishola://(screens)/RentScreen?filters=${encodeURIComponent(filters)}`
        : 'bishola://(screens)/RentScreen';
    },
    '/shop': (params) => routes['/buy'](params), // Alias for buy
    
    // Profile & User screens
    '/profile': () => 'bishola://(screens)/(tabs)/(protected)/Profile',
    '/edit-profile': () => 'bishola://(screens)/EditProfileScreen',
    '/favorites': () => 'bishola://(screens)/MyFavoriteScreen',
    '/my-cars': () => 'bishola://(screens)/MyCarsScreen',
    '/notifications': () => 'bishola://(screens)/NotificationScreen',
    '/contact': () => 'bishola://(screens)/ContactUs',
    '/contact-us': () => 'bishola://(screens)/ContactUs',
    
    // Tabs
    '/explore': () => 'bishola://(screens)/(tabs)/Explore',
    '/search': () => 'bishola://(screens)/(tabs)/Search',
    '/add': () => 'bishola://(screens)/(tabs)/(add)/Add',
  };
  
  // Check for direct route match
  if (routes[path]) {
    return routes[path](searchParams);
  }
  
  // Car details patterns: /cars/123, /car/123, /products/123, /product/123
  const carDetailsMatch = path.match(/^\/(cars?|products?)\/(\d+)/);
  if (carDetailsMatch) {
    const id = carDetailsMatch[2];
    const type = searchParams.get('type') || 'for_sale'; // default to for_sale
    const isOwner = searchParams.get('owner') === 'true';
    
    if (isOwner) {
      return `bishola://(screens)/CarDetailsScreenUser?id=${id}&type=${type}`;
    }
    return `bishola://(screens)/CarDetailsScreen?id=${id}&type=${type}`;
  }
  
  // Edit car pattern: /edit-car/123 or /update-car/123
  const editCarMatch = path.match(/^\/(edit|update)-car\/(\d+)/);
  if (editCarMatch) {
    const id = editCarMatch[2];
    // You might need to fetch car data here or pass it via URL
    return `bishola://(screens)/CarDetailsScreenUser?id=${id}&type=for_sale`;
  }
  
  // Default fallback to app home
  return 'bishola://';
}

export default function SmartAppBanner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('smartAppBanner');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const { getAppSettings, getLogo, isLoading } = useSettings();
  
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);
  const [bannerState, setBannerState] = useState<BannerState>('checking');

  const appStoreUrl = getAppSettings()?.app_info?.app_store_url;
  const playStoreUrl = getAppSettings()?.app_info?.play_store_url;
  const logo = getLogo();

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    
    if (!isIOS && !isAndroid) return;

    setPlatform(isIOS ? 'ios' : 'android');

    // Check dismissal state
    const dismissed = localStorage.getItem('app-banner-dismissed');
    const dismissedDate = localStorage.getItem('app-banner-dismissed-date');
    
    if (dismissed && dismissedDate) {
      const daysPassed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) return;
    }

    setShowBanner(true);

    // Check if app is installed
    checkAppInstalled();
  }, []);

  const checkAppInstalled = () => {
    // Simple check: try to open the app
    const testUrl = 'bishola://';
    
    let appOpened = false;
    let checkTimer: NodeJS.Timeout;

    // Listen for visibility change (app opening)
    const visibilityHandler = () => {
      if (document.hidden) {
        appOpened = true;
        clearTimeout(checkTimer);
        setBannerState('app-installed');
        cleanup();
      }
    };

    // Listen for blur (app opening on some devices)
    const blurHandler = () => {
      appOpened = true;
      clearTimeout(checkTimer);
      setBannerState('app-installed');
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('blur', blurHandler);
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('blur', blurHandler);

    // Create hidden iframe to test deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = testUrl;
    document.body.appendChild(iframe);

    // After timeout, if app didn't open, assume not installed
    checkTimer = setTimeout(() => {
      cleanup();
      document.body.removeChild(iframe);
      
      if (!appOpened) {
        setBannerState('app-not-installed');
      }
    }, 1500);
  };

  const handleOpenApp = () => {
    const deepLink = getAppDeepLink(pathname, searchParams);
    window.location.href = deepLink;
    
    // Track that user opened the app
    localStorage.setItem('app-opened-from-web', 'true');
    localStorage.setItem('app-opened-timestamp', Date.now().toString());
  };

  const handleDownloadApp = () => {
    if (platform === 'ios' && appStoreUrl) {
      window.location.href = appStoreUrl;
    } else if (platform === 'android' && playStoreUrl) {
      window.location.href = playStoreUrl;
    }
    
    // Track download click
    localStorage.setItem('app-download-clicked', 'true');
  };

  const handleDismiss = () => {
    localStorage.setItem('app-banner-dismissed', 'true');
    localStorage.setItem('app-banner-dismissed-date', Date.now().toString());
    setShowBanner(false);
  };

  const handleClose = () => {
    // Just close for this session, don't dismiss permanently
    setShowBanner(false);
  };

  if (!showBanner || isLoading || bannerState === 'checking') return null;

  const isAppInstalled = bannerState === 'app-installed';

  return (
    <div 
      className="fixed bottom-0 z-[999] left-0 right-0 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg animate-slideDown"
      dir={direction}
    >
      <div className="flex items-center justify-between p-3 max-w-screen-xl mx-auto gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-14 h-14 flex-shrink-0 rounded-xl shadow-md overflow-hidden bg-white">
            <Image 
              src={logo} 
              alt="App Logo" 
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">
              {isAppInstalled ? t('openAppTitle') : t('title')}
            </p>
            <p className="text-xs opacity-90 mt-0.5 line-clamp-1">
              {isAppInstalled ? t('appInstalledDescription') : t('description')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={isAppInstalled ? handleOpenApp : handleDownloadApp}
            className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all shadow-md whitespace-nowrap"
          >
            {isAppInstalled ? t('openApp') : t('download')}
          </button>
          
          <button 
            onClick={handleClose}
            className="text-white opacity-70 hover:opacity-100 p-2 transition-opacity active:scale-95"
            aria-label={t('closeAriaLabel')}
          >
            <X size={20} />
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