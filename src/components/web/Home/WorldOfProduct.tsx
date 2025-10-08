"use client"

import { useMemo } from "react"
import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import CarouselComponent from "../design/CarouselComponent"
import { useProductStepOne } from "@/components/web/ProductsPage/addProducts/StepOne/hooks"
import { useGetCityCounts } from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions"

interface CityData {
  governorate: string
  count: number
}

interface CityCarouselItem {
  title: string
  carCount: string
  image: string
  governorateId?: string
  actualCount: number
}

const WorldOfProduct = () => {
  const t = useTranslations("homePage")
  const locale = useLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"
  const router = useRouter()

  // Initialize the hook with a dummy validation handler
  const handleValidationChange = (isValid: boolean) => {}

  // Use the hook to get governorate options
  const { governorateOptions } = useProductStepOne(handleValidationChange)

  const { data, isLoading, error } = useGetCityCounts()

  // Static image mapping for cities
  const cityImageMap: Record<string, string> = {
    Damascus: "/assets/images/damascus.jpg",
    Idlib: "/assets/images/idlib.png",
    Aleppo: "/assets/images/aleppo.png",
    Homs: "/assets/images/homs.png",
    Hama: "/assets/images/hama.png",
    Latakia: "/assets/images/latakia.jpg",
    "Al-Hasakah": "/assets/images/al_hasakah.jpg",
    "Deir ez-Zor": "/assets/images/deir_ez_zor.jpg",
    Tartus: "/assets/images/tartus.jpg",
    Raqqa: "/assets/images/raqqa.jpg",
    Daraa: "/assets/images/draa.jpg",
    "As-Suwayda": "/assets/images/as_suwayda.jpg",
    Quneitra: "/assets/images/quneitra.jpg",
    "Damascus-Countryside": "/assets/images/rif_dimashq.jpg",
  }

  // Create translation key mapping for governorate names
  const getTranslationKey = (governorate: string): string => {
    const keyMap: Record<string, string> = {
      Damascus: "damascus",
      Idlib: "idlib",
      Aleppo: "aleppo",
      Homs: "homs",
      Hama: "hama",
      Latakia: "latakia",
      "Al-Hasakah": "al_hasakah",
      "Deir ez-Zor": "deir_ez_zor",
      Tartus: "tartus",
      Raqqa: "raqqa",
      Daraa: "daraa",
      "As-Suwayda": "as_suwayda",
      Quneitra: "quneitra",
      "Damascus-Countryside": "rif_dimashq",
    }

    return keyMap[governorate] || governorate.toLowerCase().replace(/[\s-]/g, "_")
  }

  // Create carousel data from backend response
  const carouselData = useMemo(() => {
    if (!data?.data || isLoading) {
      return []
    }

    const cityDataArray: CityData[] = data.data

    return (
      cityDataArray
        .map((cityData: CityData) => {
          const translationKey = getTranslationKey(cityData.governorate)

          // Find matching governorate option to get the ID
          const matchingGov = governorateOptions.find(
            (gov) =>
              gov.label.toLowerCase() === cityData.governorate.toLowerCase() ||
              gov.label.toLowerCase().includes(cityData.governorate.toLowerCase()) ||
              cityData.governorate.toLowerCase().includes(gov.label.toLowerCase()),
          )

          // Get translated title, fallback to English name if translation doesn't exist
          let cityTitle: string
          try {
            cityTitle = t(`worldOfProducts.cities.${translationKey}.title`)
            // If the translation returns the key itself, use the original governorate name
            if (cityTitle === `worldOfProducts.cities.${translationKey}.title`) {
              cityTitle = cityData.governorate
            }
          } catch {
            cityTitle = cityData.governorate
          }

          // Format car count with proper pluralization
          const carCount =
            locale === "ar"
              ? `${cityData.count} ${cityData.count <= 1 ? "سيارة" : "سيارات"}`
              : `${cityData.count} ${cityData.count <= 1 ? "Car" : "Cars"}`

          return {
            title: cityTitle,
            carCount: carCount,
            image: cityImageMap[cityData.governorate] || "/assets/images/default-city.jpg",
            governorateId: matchingGov?.value,
            actualCount: cityData.count,
          } as CityCarouselItem
        })
        // Sort by count (highest first) to show cities with more cars first
        .sort((a, b) => b.actualCount - a.actualCount)
    )
  }, [data, isLoading, governorateOptions, locale, t])

  // Handle city click to navigate to products page with filter
  const handleCityClick = (cityTitle: string, governorateId?: string) => {
    if (governorateId) {
      // Create URL parameters
      const params = new URLSearchParams()
      params.set("governorate", governorateId)

      // Navigate to products page with filter
      router.push(`/products?${params.toString()}`)
    } else {
      // Fallback: try to find governorate by name matching
      const matchingGov = governorateOptions.find(
        (gov) =>
          gov.label.toLowerCase() === cityTitle.toLowerCase() ||
          gov.label.toLowerCase().includes(cityTitle.toLowerCase()) ||
          cityTitle.toLowerCase().includes(gov.label.toLowerCase()),
      )

      if (matchingGov) {
        const params = new URLSearchParams()
        params.set("governorate", matchingGov.value)
        router.push(`/products?${params.toString()}`)
      }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Box variant="column" className="w-full">
        <Box variant="column" className="">
          <Text variant="h3" className="font-bold text-[20px] font-cairo mb-5">
            {t("worldOfProducts.title")}
          </Text>
        </Box>
        <Box className="w-full overflow-hidden">
          <div className="flex space-x-4 animate-pulse">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 h-40 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </Box>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box variant="column" className="w-full">
        <Box variant="column" className="">
          <Text variant="h3" className="font-bold text-[20px] font-cairo mb-5">
            {t("worldOfProducts.title")}
          </Text>
        </Box>
        <Box className="w-full overflow-hidden p-4">
          <Text className="text-red-500">
            {locale === "ar" ? "خطأ في تحميل بيانات المدن" : "Error loading cities data"}
          </Text>
        </Box>
      </Box>
    )
  }

  // Empty state
  if (!carouselData.length) {
    return (
      <Box variant="column" className="w-full">
        <Box variant="column" className="">
          <Text variant="h3" className="font-bold text-[20px] font-cairo mb-5">
            {t("worldOfProducts.title")}
          </Text>
        </Box>
        <Box className="w-full overflow-hidden p-4">
          <Text className="text-gray-500">{locale === "ar" ? "لا توجد بيانات متاحة" : "No data available"}</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box variant="column" className="w-full">
      <Box variant="column" className="">
        <Text variant="h3" className="font-bold text-[20px] font-cairo mb-5">
          {t("worldOfProducts.title")}
        </Text>
      </Box>
      <Box className="w-full overflow-hidden">
        <CarouselComponent data={carouselData} direction={direction} onCityClick={handleCityClick} />
      </Box>
    </Box>
  )
}

export default WorldOfProduct
