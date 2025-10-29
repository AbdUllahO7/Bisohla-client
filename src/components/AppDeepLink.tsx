// components/AppDeepLink.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AppDeepLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // First, ensure we're mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Don't run until mounted
    if (!isMounted) return;

    // Check if we already attempted deep link in this session
    const sessionKey = 'app_deeplink_attempted';
    const alreadyAttempted = sessionStorage.getItem(sessionKey);
    
    if (alreadyAttempted) {
      console.log('⏭️ Deep link already attempted this session');
      return;
    }

    const tryOpenApp = () => {
      try {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
        const isAndroid = /Android/i.test(userAgent);
        
        if (!isIOS && !isAndroid) {
          console.log('🖥️ Not a mobile device, skipping deep link');
          return;
        }

        const params = searchParams.toString();
        const fullPath = params ? `${pathname}?${params}` : pathname;
        
        const customSchemeUrl = `bishola://${fullPath}`;
        const universalUrl = `https://bishola.com${fullPath}`;

        console.log('🔗 Attempting deep link:', customSchemeUrl);

        const startTime = Date.now();
        let appOpened = false;

        const handleVisibilityChange = () => {
          if (document.hidden) {
            appOpened = true;
            console.log('✅ App opened (visibility hidden)');
          }
        };

        const handleBlur = () => {
          appOpened = true;
          console.log('✅ App opened (window blur)');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        if (isIOS) {
          // Try universal link first
          const link = document.createElement('a');
          link.href = universalUrl;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          
          // Clean up immediately
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
          }, 100);

          // Fallback to custom scheme
          setTimeout(() => {
            if (Date.now() - startTime < 1000 && !appOpened) {
              console.log('🔄 iOS fallback to custom scheme');
              window.location.href = customSchemeUrl;
            }
          }, 500);

        } else if (isAndroid) {
          // Use Android Intent
          const intent = `intent://${fullPath}#Intent;` +
                        `scheme=https;` +
                        `package=com.bishola.app;` +
                        `S.browser_fallback_url=${encodeURIComponent(universalUrl)};` +
                        `end`;
          
          window.location.href = intent;

          // Fallback to custom scheme
          setTimeout(() => {
            if (Date.now() - startTime < 1500 && !appOpened) {
              console.log('🔄 Android fallback to custom scheme');
              window.location.href = customSchemeUrl;
            }
          }, 1000);
        }

        // Cleanup listeners after attempts
        setTimeout(() => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('blur', handleBlur);
        }, 3000);

      } catch (error) {
        console.error('❌ Deep link error:', error);
      }
    };

    // Delay the attempt slightly to ensure page is ready
    const timer = setTimeout(() => {
      tryOpenApp();
      // Mark as attempted for this session
      sessionStorage.setItem(sessionKey, 'true');
    }, 300);

    return () => clearTimeout(timer);
  }, [isMounted, pathname, searchParams]);

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  return null;
}