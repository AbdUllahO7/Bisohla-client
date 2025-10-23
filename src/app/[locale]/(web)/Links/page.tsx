import Image from 'next/image';
import { Apple, Smartphone, Globe } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function DownloadPage() {
  const t = useTranslations('linksPage');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen flex items-center pt-0 justify-center bg-[#2C3C39] p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-[#ABDE3B]">
            <Image
              src="/assets/images/logo/bisholaLogo2.jpg"
              alt="Bishola Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#ABDE3B] mb-3">
            {t('Download')}
          </h1>
          <p className="text-gray-300 text-lg">
            {t('getOurApp')}
          </p>
        </div>

        {/* Download Links */}
        <div className="space-y-4">
          {/* App Store */}
          <a 
            href="https://apps.apple.com/tr/app/bishola/id6751427088"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full p-5 bg-[#198341] hover:bg-[#ABDE3B] transition-all duration-300 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
              <div className="bg-white/10 group-hover:bg-[#2C3C39]/20 p-3 rounded-lg transition-colors">
                <Apple className="w-7 h-7 text-white group-hover:text-[#2C3C39]" />
              </div>
              <div>
                <p className="text-sm text-white/80 group-hover:text-[#2C3C39]/80 font-medium">
                  {t('downloadOnThe')}
                </p>
                <p className="text-xl font-bold text-white group-hover:text-[#2C3C39]">
                  {t('AppStore')}
                </p>
              </div>
            </div>
            <div className="text-white/60 group-hover:text-[#2C3C39]/60">
              <svg className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Google Play */}
          <a 
            href="https://play.google.com/store/apps/details?id=com.bishola.app&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full p-5 bg-[#198341] hover:bg-[#ABDE3B] transition-all duration-300 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
              <div className="bg-white/10 group-hover:bg-[#2C3C39]/20 p-3 rounded-lg transition-colors">
                <Smartphone className="w-7 h-7 text-white group-hover:text-[#2C3C39]" />
              </div>
              <div>
                <p className="text-sm text-white/80 group-hover:text-[#2C3C39]/80 font-medium">
                  {t('GetItOn')}
                </p>
                <p className="text-xl font-bold text-white group-hover:text-[#2C3C39]">
                  {t('GooglePlay')}
                </p>
              </div>
            </div>
            <div className="text-white/60 group-hover:text-[#2C3C39]/60">
              <svg className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Website */}
          <a 
            href="https://bishola.com/ar"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full p-5 bg-[#198341] hover:bg-[#ABDE3B] transition-all duration-300 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
              <div className="bg-white/10 group-hover:bg-[#2C3C39]/20 p-3 rounded-lg transition-colors">
                <Globe className="w-7 h-7 text-white group-hover:text-[#2C3C39]" />
              </div>
              <div>
                <p className="text-sm text-white/80 group-hover:text-[#2C3C39]/80 font-medium">
                  {t('Visit')}
                </p>
                <p className="text-xl font-bold text-white group-hover:text-[#2C3C39]">
                  {t('WebSite')}
                </p>
              </div>
            </div>
            <div className="text-white/60 group-hover:text-[#2C3C39]/60">
              <svg className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            {t('Available')}
          </p>
        </div>
      </div>
    </div>
  );
}