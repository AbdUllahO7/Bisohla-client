"use client"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useTranslations } from "next-intl"

const SpaceAds = () => {
  const t = useTranslations("homePage")

  return (
    <Box variant="container" className="w-full mx-auto p-0">
      <Box variant="row" className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
        {/* First Ad Box */}
        <Box
          variant="center"
          className="w-full md:w-[48%] h-[200px]  xs:w-[100%] sm:h-[220px] md:h-[250px] relative overflow-hidden bg-primary-light rounded-md mb-4 md:mb-0"
        >
          {/* border-l-t */}
          <Box className="absolute top-0 left-0 bg-transparent w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] border-r-[40px] sm:border-r-[50px] border-b-[40px] sm:border-b-[50px] border-primary rounded-br-[80px] sm:rounded-br-[100px]"></Box>
          {/* border-b-r */}
          <Box className="absolute bottom-0 right-0 bg-transparent w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] border-l-[40px] sm:border-l-[50px] border-t-[40px] sm:border-t-[50px] border-primary rounded-tl-[80px] sm:rounded-tl-[100px]"></Box>
          {/* text */}
          <Box variant="column" className="text-center">
            <Text
              variant="h4"
              className="text-primary-foreground font-bold text-[18px] sm:text-[20px] md:text-[24px] font-cairo"
            >
              {t("spaceAds.box1.title")}
            </Text>
            <Text
              variant="h4"
              className="font-bold text-[28px] sm:text-[32px] md:text-[36px] lg:text-[64px] font-cairo text-white"
            >
              {t("spaceAds.box1.bishola")}
            </Text>
          </Box>
        </Box>

        {/* Second Ad Box */}
        <Box
          variant="center"
          className="w-full md:w-[48%] xs:w-[100%]  h-[200px] sm:h-[220px] md:h-[250px] relative overflow-hidden bg-primary-light rounded-md"
        >
          {/* border-l-t */}
          <Box className="absolute top-0 left-0 bg-transparent w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] border-r-[40px] sm:border-r-[50px] border-b-[40px] sm:border-b-[50px] border-primary rounded-br-[80px] sm:rounded-br-[100px]"></Box>
          {/* border-b-r */}
          <Box className="absolute bottom-0 right-0 bg-transparent w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] border-l-[40px] sm:border-l-[50px] border-t-[40px] sm:border-t-[50px] border-primary rounded-tl-[80px] sm:rounded-tl-[100px]"></Box>
          {/* text */}
          <Box variant="column" className="text-center">
            <Text
              variant="h4"
              className="text-primary-foreground font-bold text-[18px] sm:text-[20px] md:text-[24px] font-cairo"
            >
              {t("spaceAds.box2.title")}
            </Text>
            <Text
              variant="h4"
              className="font-bold text-[28px] sm:text-[32px] md:text-[36px] lg:text-[64px] font-cairo text-white"
            >
              {t("spaceAds.box2.bishola")}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default SpaceAds
