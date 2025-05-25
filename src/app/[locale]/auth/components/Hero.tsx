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
    <div className="w-full  relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-200/25 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <Box  className="flex justify-center items-center h-full w-full relative">
        {/* Right Section - Modern Car Showcase - Full Width */}
        <div className="w-full relative flex flex-col justify-center items-center">
          {/* Modern glass card container */}
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl"></div>

            {/* Content */}
            <div className="relative p-8 lg:p-16 space-y-12">
              {/* Top section with logo */}
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-20 scale-110"></div>
                  <Image
                    src="/assets/images/logo/bishola.png"
                    alt="Bishola Logo"
                    width={140}
                    height={140}
                    className="relative mx-auto transition-all duration-700 hover:scale-110 drop-shadow-2xl"
                    priority
                  />
                </div>

                <Text className="text-slate-700 text-center leading-relaxed max-w-2xl mx-auto">
                  {isRTL ? (
                    <span className="text-lg md:text-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-700">
                      انطلق بحرية مع أفضل عروض تأجير وبيع السيارات
                      <br className="hidden sm:block" />
                      رفاهية وسهولة في كل رحلة! 🚗✨
                    </span>
                  ) : (
                    <span className="text-lg md:text-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-700">
                      Drive freely with the best car rental and sales deals
                      <br className="hidden sm:block" />
                      Luxury and ease in every trip! 🚗✨
                    </span>
                  )}
                </Text>
              </div>

              {/* Services section */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-200/50 backdrop-blur-sm transition-all duration-700 hover:scale-105">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <Text className="text-emerald-700 font-medium text-sm">{t('PremiumCarServices')}</Text>
                </div>

               

                <Text className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 leading-tight transition-all duration-700">
                  {t("hero.description")}
                </Text>
              </div>

              {/* Car showcase */}
              <div className="relative">
                <Image
                  src="/assets/images/carHeader.png"
                  alt="Premium Cars"
                  width={800}
                  height={800}
                  className="w-full object-contain transform hover:scale-105 transition-all duration-700 drop-shadow-2xl"
                  priority
                />

                {/* Floating service badges */}
                <div className="absolute -top-4 -left-4 px-4 py-2 bg-yellow-400 text-yellow-900 font-bold text-sm rounded-xl shadow-lg transform -rotate-12 hover:rotate-0 transition-all duration-700">
                  {t('FORRENT')}
                </div>
                <div className="absolute -top-4 -right-4 px-4 py-2 bg-orange-400 text-orange-900 font-bold text-sm rounded-xl shadow-lg transform rotate-12 hover:rotate-0 transition-all duration-700">
                 {t('FORSALE')}
                </div>
              </div>

             

              {/* Bottom stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center p-4 bg-white/30 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-700 hover:scale-105 hover:bg-white/40">
                  <div className="text-2xl font-bold text-emerald-600">500+</div>
                  <div className="text-sm text-slate-600">{t('CarsAvailable')}</div>
                </div>
                <div className="text-center p-4 bg-white/30 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-700 hover:scale-105 hover:bg-white/40">
                  <div className="text-2xl font-bold text-teal-600">24/7</div>
                  <div className="text-sm text-slate-600">{t('Support')}</div>
                </div>
                <div className="text-center p-4 bg-white/30 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-700 hover:scale-105 hover:bg-white/40">
                  <div className="text-2xl font-bold text-emerald-600">5★</div>
                  <div className="text-sm text-slate-600">{t('Rating')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating logo at bottom */}
          <div className="absolute bottom-8 animate-bounce">
            <Image
              src="/assets/images/logo/bishola.png"
              alt="Bishola"
              width={60}
              height={60}
              className="opacity-80 hover:opacity-100 transition-all duration-700 hover:scale-110"
            />
          </div>
        </div>
      </Box>
    </div>
  )
}

export default Hero
