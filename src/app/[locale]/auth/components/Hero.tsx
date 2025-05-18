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
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-gray-200 to-primary-light/40">
      {/* Background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-[url('/assets/images/Rectangle.png')] bg-no-repeat bg-center opacity-20 bg-cover"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Content container */}
      <Box variant="container" className="flex justify-center items-center h-full w-full relative">
        {/* Top section with logo and tagline */}
        <div className="absolute top-8 md:top-12 w-full flex flex-col items-center space-y-4 px-4 z-10">
          <Image
            src="/assets/images/logo/bishola.png"
            alt="logo"
            width={120}
            height={120}
            className="transition-all duration-700 hover:scale-105"
          />
          <Text className="text-white text-center max-w-xl mx-auto">
            {isRTL ? (
              <span className="text-base md:text-lg font-medium">
                انطلق بحرية مع أفضل عروض تأجير وبيع السيارات – <br className="hidden sm:block" /> رفاهية وسهولة في كل
                رحلة! 🚗✨
              </span>
            ) : (
              <span className="text-base md:text-lg font-medium">
                Drive freely with the best car rental and sales deals <br className="hidden sm:block" /> – Luxury and
                ease in every trip! 🚗✨
              </span>
            )}
          </Text>
        </div>

        {/* Center car image */}
        <div className="relative w-full flex justify-center items-center">
          <Image
            src="/assets/images/carHeader.png"
            alt="cars"
            width={900}
            height={400}
            className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-w-4xl object-contain transform translate-y-[-5%] transition-all duration-1000 hover:translate-y-[-7%]"
            priority
          />
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-16 md:bottom-24 w-full flex flex-col items-center space-y-6 px-4 z-10">
          <Text className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bold text-center">
            {t("hero.description")}
          </Text>
          <Image src="/assets/images/logo/bishola.png" alt="logo" width={80} height={80} className="animate-bounce" />
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 top-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 bottom-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      </Box>
    </div>
  )
}

export default Hero
