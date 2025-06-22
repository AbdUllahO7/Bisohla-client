import Box from "@/components/box/box"
import { Toaster } from "@/components/ui/toaster"
import Footer from "@/components/web/Home/Footer"
import HeaderOne from "@/components/web/Home/HeaderOne"
import HeaderTow from "@/components/web/Home/HeaderTow"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { PropsWithChildren } from "react"
import WebMetadataProvider, { generateWebMetadata } from "./MetaData"

// Generate metadata using the reusable metadata generator
export async function generateMetadata(): Promise<Metadata> {
  const webMetadata = await generateWebMetadata('home');
  
  // Ensure favicon is included
  return {
    ...webMetadata,
    icons: {
      icon: '/favicon.ico',

    },
  };
}

interface WebLayoutProps extends PropsWithChildren {
  pageType?: 'home' | 'cars' | 'car-detail' | 'profile' | 'contact' | 'about' | 'rent' | 'sale' | 'search';
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
  customBusinessInfo 
}: WebLayoutProps) => {
  const t = await getTranslations("homePage")
  
  return (
    <>
      {/* Metadata Provider Component */}
      <WebMetadataProvider 
        pageType={pageType}
        customConfig={customMetadata}
        businessInfo={customBusinessInfo}
      />

      <Box className="w-full bg-background" variant="column">
        <Box className="fixed z-[99] w-full bg-white shadow-md">
          <Box className="lg:container sm:pr-5">
            <HeaderOne />
          </Box>
        </Box>

        {/* HeaderTwo */}
        <div className="fixed top-[34px] sm:top-[40px] z-[70] w-full bg-primary shadow-md">
          <Box variant="container">
            <HeaderTow
              translations={{
                home: t("headerTow.home"),
                rent: t("headerTow.rent"),
                sale: t("headerTow.sale"),
                join: t("headerTow.join"),
                BrowseAll: t("headerTow.BrowseAll"),
                Privacypolicy: t("headerTow.Privacypolicy"),
              }}
            />
          </Box>
        </div>

        {/* Spacer for fixed headers - adjusted for different screen sizes */}
        <div className="h-[74px] sm:h-[82px]"></div>

        {children}
        <Footer />
        <Toaster />
      </Box>
    </>
  )
}

export default WebLayout