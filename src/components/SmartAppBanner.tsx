// components/SmartAppBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SmartAppBanner() {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

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
    const appUrl = `bishola://${pathname}`;
    window.location.href = appUrl;
    
    setTimeout(() => {
      if (platform === 'ios') {
        window.location.href = 'https://apps.apple.com/app/id123456789'; // ضع رابط App Store
      } else {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.bishola.app'; // ضع رابط Play Store
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

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg z-50 animate-slideDown">
      <div className="flex items-center justify-between p-3 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <img 
            src="/app-icon.png" 
            alt="Bishola App" 
            className="w-14 h-14 rounded-xl shadow-md"
          />
          <div className="flex-1">
            <p className="font-bold text-base">افتح في تطبيق Bishola</p>
            <p className="text-xs opacity-90 mt-0.5">تجربة أسرع وأسهل 🚀</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenApp}
            className="bg-white text-primary px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-md"
          >
            فتح
          </button>
          
          <button 
            onClick={handleClose}
            className="text-white opacity-70 hover:opacity-100 px-2 transition-opacity"
            aria-label="إغلاق"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="border-t border-white/20">
        <button 
          onClick={handleDismiss}
          className="w-full text-center py-2 text-xs opacity-75 hover:opacity-100 transition-opacity"
        >
          لا تظهر هذا مرة أخرى
        </button>
      </div>
    </div>
  );
}