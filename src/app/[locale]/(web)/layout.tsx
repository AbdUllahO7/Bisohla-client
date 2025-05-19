import Box from "@/components/box/box"
import { Toaster } from "@/components/ui/toaster"
import Footer from "@/components/web/Home/Footer"
import HeaderOne from "@/components/web/Home/HeaderOne"
import HeaderTow from "@/components/web/Home/HeaderTow"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { PropsWithChildren } from "react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("homePage")

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  }
}

const WebLayout = async ({ children }: PropsWithChildren) => {
  const t = await getTranslations("homePage")
  return (
    <Box className="w-full bg-background" variant="column">
      <Box className="fixed z-[99] w-full bg-white shadow-md">
        <Box  className="lg:container sm:pr-5">
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
              Privacypolicy :t("headerTow.Privacypolicy"),
            }}

          />
        </Box>
      </div>

      {/* Spacer for fixed headers - adjusted for different screen sizes */}
      <div className="h-[74px] sm:h-[82px]"></div>

      {children}
      <Toaster />
      <Footer />
    </Box>
  )
}

export default WebLayout
