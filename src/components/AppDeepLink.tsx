// Alternative Solution: Deep Link ONLY when explicitly requested via URL parameter
// This prevents automatic redirects while still supporting deep linking

// components/SafeAppDeepLink.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useSettings } from '@/providers/settings.provider';

export default function SafeAppDeepLink() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { getAppSettings } = useSettings();

  useEffect(() => {
    // Only attempt deep link if URL has ?openApp=true parameter
    const shouldOpenApp = searchParams.get('openApp') === 'true';
    if (!shouldOpenApp) return;

    // Check if already attempted
    const attempted = sessionStorage.getItem('deeplink-attempted');
    if (attempted) return;

    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    
    if (!isIOS && !isAndroid) return;

    // Mark as attempted immediately to prevent loops
    sessionStorage.setItem('deeplink-attempted', 'true');

    const tryOpenApp = () => {
      // Remove locale prefix for deep link
      const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '') || '/';
      
      // Get store URLs from settings
      const appStoreUrl = getAppSettings()?.app_info?.app_store_url;
      const playStoreUrl = getAppSettings()?.app_info?.play_store_url;

      if (isIOS) {
        // Try Universal Link first
        window.location.href = `bishola://(screens)/BuyScreen`;
        
        // Fallback to App Store after delay
        setTimeout(() => {
          if (appStoreUrl && document.hidden === false) {
            window.location.href = appStoreUrl;
          }
        }, 2500);

      } else if (isAndroid) {
        // Try App Link / Intent
        const intentUrl = `intent:/${pathWithoutLocale}#Intent;scheme=bishola;package=com.bishola.app;end`;
        window.location.href = intentUrl;
        
        // Fallback to Play Store after delay
        setTimeout(() => {
          if (playStoreUrl && document.hidden === false) {
            window.location.href = playStoreUrl;
          }
        }, 2500);
      }
    };

    // Small delay before attempting
    const timer = setTimeout(tryOpenApp, 300);
    return () => clearTimeout(timer);

  }, [searchParams, pathname, getAppSettings]);

  return null;
}

// USAGE:
// Now you can create deep links like:
// https://yoursite.com/ar/products/123?openApp=true
// This will ONLY trigger when the URL explicitly has ?openApp=true

// You can generate these links from:
// 1. Push notifications
// 2. Email campaigns
// 3. Social media posts
// 4. QR codes
// etc.

// Regular users browsing the site won't be affected!