import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Image from 'next/image';
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

      {/* Main Layout */}
      <Box className={`w-full h-[100vh] flex-col md:flex-row ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Left Section - Auth Content */}
        <Box className="lg:w-[35%] md:w-[100%] xs:w-[100%] justify-center items-center bg-white">
          <Box className="flex-col w-full items-center justify-center p-6 md:p-8">
            
            {/* Logo Section */}
            <Box className="w-full items-center justify-center mb-8">
              <Image
                src="/assets/images/logo/bishola.png"
                alt={locale === 'ar' ? 'شعار بسهولة' : 'Bishola Logo'}
                width={150}
                height={50}
                priority
                className="object-contain"
              />
            </Box>
            
            {/* Auth Form Content */}
            <Box className="w-full max-w-md items-center justify-center">
              <Suspense fallback={
                <Box className="w-full h-64 items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <Text className="mt-4 text-gray-500">
                    {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </Text>
                </Box>
              }>
                {children}
              </Suspense>
            </Box>
            
            {/* Footer */}
            <Box className="w-full items-center justify-center mt-8 text-center">
              <Text className="text-sm text-gray-500">
                {locale === 'ar' 
                  ? '© 2024 بيشولا. جميع الحقوق محفوظة.' 
                  : '© 2024 Bishola. All rights reserved.'
                }
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Right Section - Hero */}
        <Box className="w-[65%] hidden lg:flex bg-background relative overflow-hidden">
          <Hero />
          
          {/* Branding Overlay */}
          <Box className="absolute bottom-8 left-8 right-8 text-white z-10">
            <Text className="text-3xl font-bold mb-3">
              {locale === 'ar' ? 'مرحباً بك في بيشولا' : 'Welcome to Bishola'}
            </Text>
            <Text className="text-lg opacity-90 leading-relaxed">
              {locale === 'ar' 
                ? 'منصتك الموثوقة لتأجير وبيع السيارات بأفضل الأسعار والخدمات' 
                : 'Your trusted platform for car rental and sales with the best prices and services'
              }
            </Text>
            
            {/* Feature Highlights */}
            <Box className="flex-col gap-2 mt-4">
              <Text className="text-sm opacity-80">
                {locale === 'ar' ? '✓ تأجير آمن ومضمون' : '✓ Safe & Guaranteed Rental'}
              </Text>
              <Text className="text-sm opacity-80">
                {locale === 'ar' ? '✓ أفضل أسعار البيع' : '✓ Best Sales Prices'}
              </Text>
              <Text className="text-sm opacity-80">
                {locale === 'ar' ? '✓ خدمة عملاء 24/7' : '✓ 24/7 Customer Service'}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AuthLayout;