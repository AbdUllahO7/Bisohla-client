"use client"

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { PropsWithChildren, Suspense } from 'react';
import Hero from './components/Hero';
import { useLocale } from 'next-intl';
import MetadataProvider from './components/MetaData';

interface AuthLayoutProps extends PropsWithChildren {
  pageType?: 'login' | 'register' | 'forgot-password' | 'auth';
  customMetadata?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

const AuthLayout = ({ 
  children, 
  pageType = 'auth',
  customMetadata 
}: AuthLayoutProps) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <>
      {/* Metadata Component */}
      <MetadataProvider 
        pageType={pageType}
        customConfig={customMetadata}
      />

      {/* Main Layout - Fixed height without scrolling */}
      <div className={`w-full h-screen overflow-hidden flex `} dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Left Section - Auth Content */}
        <div className="w-full md:w-3/5 lg:w-1/2 xl:w-2/5 2xl:w-1/3 flex flex-col bg-white relative z-10">
          <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
            
            {/* Auth Form Content - Centered */}
            <div className="w-full max-w-md mx-auto my-auto">
              <Suspense fallback={
                <div className="w-full h-64 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  <Text className="mt-4 text-gray-500">
                    {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </Text>
                </div>
              }>
                {children}
              </Suspense>
            </div>
            
            {/* Footer - Always at bottom */}
            <div className="w-full text-center mt-auto pt-4">
              <Text className="text-xs text-gray-400">
                {locale === 'ar' 
                  ? '© 2024 بسهولة. جميع الحقوق محفوظة.' 
                  : '© 2024 Bishola. All rights reserved.'
                }
              </Text>
            </div>
          </div>
        </div>

        {/* Right Section - Hero (Responsive visibility) */}
        <div className="hidden md:flex md:w-2/5 lg:w-1/2 xl:w-3/5 2xl:w-2/3 relative overflow-hidden">
          <Hero />
        </div>
      </div>
    </>
  );
};

export default AuthLayout;