// components/AppDeepLink.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { APP_URL } from '@/core/lib/web/constants';

export default function AppDeepLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted) return;

    const tryOpenApp = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      
      if (!isIOS && !isAndroid) return;

      const params = searchParams.toString();
      const fullPath = params ? `${pathname}?${params}` : pathname;
      
      const customSchemeUrl = `bishola://${fullPath}`;
      const universalUrl = `${APP_URL}/${fullPath}`;

      const startTime = Date.now();
      let appOpened = false;

      if (isIOS) {
        const link = document.createElement('a');
        link.href = universalUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          if (Date.now() - startTime < 1000 && !appOpened) {
            window.location.href = customSchemeUrl;
          }
        }, 500);

      } else if (isAndroid) {
      
        
        const customSchemeUrl = `bishola://${fullPath}`;
        const universalUrl = `https://bishola.com${fullPath}`;

        setTimeout(() => {
          if (Date.now() - startTime < 1500 && !appOpened) {
            window.location.href = customSchemeUrl;
          }
        }, 1000);
      }

      const handleVisibilityChange = () => {
        if (document.hidden) appOpened = true;
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', () => { appOpened = true; });

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    const timer = setTimeout(() => {
      tryOpenApp();
      setAttempted(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, attempted]);

  return null;
}
