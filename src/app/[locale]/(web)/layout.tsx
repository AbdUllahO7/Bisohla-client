// WebLayout.tsx - Fixed mobile layout
import Box from '@/components/box/box';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/web/Home/Footer';
import HeaderOne from '@/components/web/Home/HeaderOne';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import WebMetadataProvider, { generateWebMetadata } from './MetaData';
import HeaderTwo from '@/components/web/Home/HeaderTow';

// Generate metadata using the reusable metadata generator
export async function generateMetadata(): Promise<Metadata> {
  const webMetadata = await generateWebMetadata('home');

  return {
    ...webMetadata,
    icons: {
      icon: '/favicon.ico',
    },
  };
}

interface WebLayoutProps extends PropsWithChildren {
  pageType?:
    | 'home'
    | 'cars'
    | 'car-detail'
    | 'profile'
    | 'contact'
    | 'about'
    | 'rent'
    | 'sale'
    | 'search';
  customMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  customBusinessInfo?: {
    phone?: string;
    email?: string;
    salesEmail?: string;
    address?: {
      street?: string;
      city?: { en: string; ar: string };
      region?: { en: string; ar: string };
      postalCode?: string;
      country?: string;
    };
    coordinates?: {
      latitude?: string;
      longitude?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
    businessHours?: {
      weekdays?: { opens: string; closes: string };
      friday?: { opens: string; closes: string };
    };
  };
}

const WebLayout = async ({
  children,
  pageType = 'home',
  customMetadata,
  customBusinessInfo,
}: WebLayoutProps) => {
  const t = await getTranslations('homePage');

  return (
    <>
      {/* Metadata Provider Component */}
      <WebMetadataProvider
        pageType={pageType}
        customConfig={customMetadata}
        businessInfo={customBusinessInfo}
      />

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Fixed Header Container */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          {/* Header One */}
          <HeaderOne />

          {/* Header Two */}
          <HeaderTwo
            translations={{
              home: t('headerTow.home'),
              rent: t('headerTow.rent'),
              sale: t('headerTow.sale'),
              join: t('headerTow.join'),
              BrowseAll: t('headerTow.BrowseAll'),
              Privacypolicy: t('headerTow.Privacypolicy'),
            }}
          />
        </div>

        {/* Spacer for fixed headers */}
        <div className="h-[120px] md:h-[100px] flex-shrink-0"></div>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </>
  );
};

export default WebLayout;
