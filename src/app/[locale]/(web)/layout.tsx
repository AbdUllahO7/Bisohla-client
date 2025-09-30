// WebLayout.tsx - Fixed mobile layout
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/web/Home/Footer';
import HeaderOne from '@/components/web/Home/HeaderOne';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import HeaderTwo from '@/components/web/Home/HeaderTow';
import ChatbotWidget from '@/components/web/Home/ChatbotWidget';
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
        <div className="h-[120px] md:h-[100px] flex-shrink-0 bg-background"></div>

        {/* Main Content */}
        <main className="flex-1 bg-background">{children}</main>

        {/* Footer */}
        <Footer />
        <ChatbotWidget />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </>
  );
};

export default WebLayout;
