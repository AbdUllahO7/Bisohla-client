"use client"

import Image from "next/image"
import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useLocale, useTranslations } from "next-intl"

const Hero = () => {
  const t = useTranslations("homePage")
  const locale = useLocale()
  const isRTL = locale === "ar"

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100"></div>

      {/* Animated background elements - Contained within viewport */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-8 w-48 h-48 lg:w-72 lg:h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 right-8 w-64 h-64 lg:w-96 lg:h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 lg:w-64 lg:h-64 bg-green-200/25 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Main content container */}
      <div className="relative h-full flex flex-col justify-center items-center p-2 md:p-4 lg:p-6 xl:p-8">
        <div className="w-full max-w-3xl xl:max-w-4xl mx-auto h-full flex flex-col justify-center">
          
          {/* Glassmorphism background */}
          <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl border border-white/30 shadow-2xl p-4 md:p-6 lg:p-8 xl:p-12">

            {/* Content */}
            <div className="space-y-3 md:space-y-4 lg:space-y-6 xl:space-y-8">
              
              {/* Top section with logo */}
              <div className="text-center space-y-2 md:space-y-3 lg:space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-20 scale-110"></div>
                   <Image
                    src="/assets/images/logo/bishola.png"
                    alt="Bishola Logo"
                    width={120}
                    height={120}
                    className="relative mx-auto transition-all duration-700 hover:scale-110 drop-shadow-2xl"
                    priority
                  />
                </div>

                <Text className="text-slate-700 text-center leading-relaxed max-w-lg lg:max-w-2xl mx-auto">
                  {isRTL ? (
                    <span className="text-xs md:text-sm lg:text-base xl:text-lg font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-700">
                      انطلق بحرية مع أفضل عروض تأجير وبيع السيارات
                      <br className="hidden sm:block" />
                      رفاهية وسهولة في كل رحلة! 🚗✨
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm lg:text-base xl:text-lg font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-700">
                      Drive freely with the best car rental and sales deals
                      <br className="hidden sm:block" />
                      Luxury and ease in every trip! 🚗✨
                    </span>
                  )}
                </Text>
              </div>

              {/* Services section */}
              <div className="text-center space-y-2 md:space-y-3 lg:space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-200/50 backdrop-blur-sm transition-all duration-700 hover:scale-105">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <Text className="text-emerald-700 font-medium text-xs md:text-sm">{t('PremiumCarServices')}</Text>
                </div>

                <Text className="text-sm md:text-base lg:text-xl xl:text-2xl font-bold text-slate-800 leading-tight transition-all duration-700">
                  {t("hero.description")}
                </Text>
              </div>

              {/* Car showcase - More compact for tablet */}
              <div className="relative max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
                <Image
                  src="/assets/images/carHeader.png"
                  alt="Premium Cars"
                  width={500}
                  height={300}
                  className="w-full h-auto object-contain transform hover:scale-105 transition-all duration-700 drop-shadow-2xl"
                  priority
                />

                {/* Floating service badges - Compact for tablet */}
                <div className="absolute top-1 left-1 md:top-2 md:left-2 lg:-top-4 lg:-left-4 px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 bg-yellow-400 text-yellow-900 font-bold text-xs md:text-sm rounded-lg lg:rounded-xl shadow-lg transform -rotate-3 md:-rotate-6 lg:-rotate-12 hover:rotate-0 transition-all duration-700">
                  {t('FORRENT')}
                </div>
                <div className="absolute top-1 right-1 md:top-2 md:right-2 lg:-top-4 lg:-right-4 px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 bg-orange-400 text-orange-900 font-bold text-xs md:text-sm rounded-lg lg:rounded-xl shadow-lg transform rotate-3 md:rotate-6 lg:rotate-12 hover:rotate-0 transition-all duration-700">
                 {t('FORSALE')}
                </div>
              </div>

              {/* Bottom stats - Compact for tablet */}
              <div className="grid grid-cols-3 gap-1.5 md:gap-2 lg:gap-4">
                <div className="text-center p-1.5 md:p-2 lg:p-4 bg-white/30 rounded-lg md:rounded-xl lg:rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-700 hover:scale-105 hover:bg-white/40">
                  <div className="text-base md:text-lg lg:text-2xl font-bold text-emerald-600">500+</div>
                  <div className="text-xs md:text-sm text-slate-600">{t('CarsAvailable')}</div>
                </div>
                <div className="text-center p-1.5 md:p-2 lg:p-4 bg-white/30 rounded-lg md:rounded-xl lg:rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-700 hover:scale-105 hover:bg-white/40">
                  <div className="text-base md:text-lg lg:text-2xl font-bold text-teal-600">24/7</div>
                  <div className="text-xs md:text-sm text-slate-600">{t('Support')}</div>
                </div>
                <div className="text-center p-1.5 md:p-2 lg:p-4 bg-white/30 rounded-lg md:rounded-xl lg:rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-700 hover:scale-105 hover:bg-white/40">
                  <div className="text-base md:text-lg lg:text-2xl font-bold text-emerald-600">5★</div>
                  <div className="text-xs md:text-sm text-slate-600">{t('Rating')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero