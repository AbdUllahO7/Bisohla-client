"use client"

import type React from "react"
import { useTranslations } from "next-intl"
import { Car, Tag, Phone, DollarSign, Info, Layers, Settings, Bookmark, MessageSquare } from "lucide-react"

import Box from "@/components/box/box"
import Text from "@/components/text/text"

interface CarDetailsContentProps {
  data: any
}

const CarDetailsContent: React.FC<CarDetailsContentProps> = ({ data }) => {
  const t = useTranslations("product.CarDetailsContent")

  // Extract the required fields with fallbacks
  const carDetails = [
    {
      label: t("title"),
      value: data?.title || "-",
      important: true,
      icon: <Car className="w-5 h-5" />,
    },
    {
      label: t("contactNumber"),
      value: data?.contactNumber || "-",
      important: true,
      icon: <Phone className="w-5 h-5" />,
    },
    {
      label: t("price"),
      value: data?.price ? `${data?.price} ${data?.currency || ""}` : "-",
      important: true,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: t("make"),
      value: data?.make?.name || "-",
      important: false,
      icon: <Tag className="w-5 h-5" />,
    },
    {
      label: t("model"),
      value: data?.model?.description || "-",
      important: false,
      icon: <Layers className="w-5 h-5" />,
    },
    {
      label: t("trim"),
      value: data?.trim?.name || "-",
      important: true,
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: t("currency"),
      value: data?.currency || "-",
      important: true,
      icon: <Bookmark className="w-5 h-5" />,
    },
    {
        label: t("description"),
        value: data?.description || "-",
        important: true,
        icon: <Bookmark className="w-5 h-5" />,
      },
  ]

  return (
    <Box
      variant="column"
      className="w-full space-y-8 p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg"
    >
      {/* Main details in a grid */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {carDetails.map((detail, index) => (
          <Box
            key={index}
            className="relative overflow-hidden p-5 rounded-xl transition-all duration-300 
            bg-white shadow-md hover:shadow-xl hover:translate-y-[-2px]"
          >
            <Box variant="row" className="items-center gap-4">
              <Box className="p-3 rounded-full bg-primary-foreground/15 text-primary ring-4 ring-primary">{detail.icon}</Box>
              <Box variant="column" className="flex-1 text-start items-start">
                <Text variant="small" className="text-slate-500 font-medium mb-1">
                  {detail.label}
                </Text>
                <Text variant="mid" className="font-semibold text-slate-900 text-lg">
                    {detail.value}
                </Text>
              </Box>
            </Box>
            <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-primary-foreground/15 rounded-full" />
          </Box>
        ))}
      </Box>

    

      {/* If description exists and is longer, show it separately with the same style */}
     
    </Box>
  )
}

export default CarDetailsContent
