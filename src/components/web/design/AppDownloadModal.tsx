'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/providers/settings.provider';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Smartphone, X, ChevronRight } from 'lucide-react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Skeleton } from '@/components/ui/skeleton';

interface AppDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  open,
  onOpenChange,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { getAppSettings, isLoading } = useSettings();

  const appStoreUrl = getAppSettings()?.app_info?.app_store_url;
  const playStoreUrl = getAppSettings()?.app_info?.play_store_url;

  const handleContinueWeb = () => {
    onOpenChange(false);
    // Store user preference to not show again (optional)
    localStorage.setItem('skipAppDownload', 'true');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 gap-0 overflow-hidden rounded-xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm">
                <Smartphone className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white">
                {isRTL ? 'حمّل تطبيق بسهولة' : 'Get Bishola App'}
              </DialogTitle>
            </div>
          </div>
          <p className="text-white/90 text-xs sm:text-sm">
            {isRTL
              ? 'احصل على تجربة أفضل مع تطبيقنا المحمول'
              : 'Get a better experience with our mobile app'}
          </p>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Features */}
          <div className="space-y-2 sm:space-y-3">
            <FeatureItem
              isRTL={isRTL}
              text={
                isRTL ? 'تصفح أسرع وأكثر سلاسة' : 'Faster and smoother browsing'
              }
            />
            <FeatureItem
              isRTL={isRTL}
              text={
                isRTL
                  ? 'إشعارات فورية للعروض الجديدة'
                  : 'Instant notifications for new deals'
              }
            />
            <FeatureItem
              isRTL={isRTL}
              text={isRTL ? 'إدارة إعلاناتك بسهولة' : 'Easy ad management'}
            />
          </div>

          {/* App Store Buttons */}
          <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
            {isLoading ? (
              <>
                <Skeleton className="w-full h-12 sm:h-14" />
                <Skeleton className="w-full h-12 sm:h-14" />
              </>
            ) : (
              <>
                {/* App Store Button */}
                {appStoreUrl && (
                  <Link href={appStoreUrl} target="_blank" className="block">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-gray-50 transition-all duration-200 border-2 hover:border-emerald-600"
                      onClick={() => onOpenChange(false)}
                    >
                      <Box
                        variant="row"
                        className="items-center justify-between w-full"
                      >
                        <Box
                          variant="row"
                          className="items-center gap-2 sm:gap-3"
                        >
                          <Image
                            src="/assets/icons/apple-icon.png"
                            alt="Apple"
                            width={24}
                            height={24}
                            className="w-5 h-5 sm:w-7 sm:h-7"
                          />
                          <Box variant="column" className="items-start gap-0">
                            <Text
                              variant="small"
                              className="text-[10px] sm:text-xs text-gray-600 leading-tight"
                            >
                              {isRTL ? 'حمّل من' : 'Download on'}
                            </Text>
                            <Text
                              variant="mid"
                              className="text-sm sm:text-base font-semibold text-gray-900"
                            >
                              App Store
                            </Text>
                          </Box>
                        </Box>
                        <ChevronRight
                          className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 ${
                            isRTL ? 'rotate-180' : ''
                          }`}
                        />
                      </Box>
                    </Button>
                  </Link>
                )}

                {/* Google Play Button */}
                {playStoreUrl && (
                  <Link href={playStoreUrl} target="_blank" className="block">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-gray-50 transition-all duration-200 border-2 hover:border-emerald-600"
                      onClick={() => onOpenChange(false)}
                    >
                      <Box
                        variant="row"
                        className="items-center justify-between w-full"
                      >
                        <Box
                          variant="row"
                          className="items-center gap-2 sm:gap-3"
                        >
                          <Image
                            src="/assets/icons/play-google.png"
                            alt="Google Play"
                            width={24}
                            height={24}
                            className="w-5 h-5 sm:w-7 sm:h-7"
                          />
                          <Box variant="column" className="items-start gap-0">
                            <Text
                              variant="small"
                              className="text-[10px] sm:text-xs text-gray-600 leading-tight"
                            >
                              {isRTL ? 'حمّل من' : 'Get it on'}
                            </Text>
                            <Text
                              variant="mid"
                              className="text-sm sm:text-base font-semibold text-gray-900"
                            >
                              Google Play
                            </Text>
                          </Box>
                        </Box>
                        <ChevronRight
                          className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 ${
                            isRTL ? 'rotate-180' : ''
                          }`}
                        />
                      </Box>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Continue on Web Button */}
          <div className="pt-1 sm:pt-2">
            <Button
              variant="ghost"
              className="w-full text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 py-2 sm:py-2.5"
              onClick={handleContinueWeb}
            >
              {isRTL ? 'المتابعة على المتصفح' : 'Continue on Web'}
            </Button>
          </div>

          {/* Don't show again */}
          <div className="text-center pt-1 sm:pt-2">
            <button
              onClick={() => {
                localStorage.setItem('skipAppDownload', 'true');
                onOpenChange(false);
              }}
              className="text-[10px] sm:text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {isRTL ? 'لا تظهر هذه الرسالة مرة أخرى' : "Don't show this again"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Feature Item Component
const FeatureItem: React.FC<{ isRTL: boolean; text: string }> = ({
  isRTL,
  text,
}) => (
  <div className={`flex items-center gap-2`}>
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-emerald-600" />
    </div>
    <Text variant="small" className="text-xs sm:text-sm text-gray-700">
      {text}
    </Text>
  </div>
);

export default AppDownloadModal;
