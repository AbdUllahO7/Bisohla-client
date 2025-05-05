"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { 
  Car, Tag, Phone, DollarSign, Info, Layers, Settings, Bookmark, 
  MessageSquare, MapPin, Calendar, BarChart, Key, Palette, Hash 
} from "lucide-react"

import Box from "@/components/box/box"
import Text from "@/components/text/text"

interface CarDetailsContentProps {
  data: any;
  type?: "car" | "ads";
}

const CarDetailsContent: React.FC<CarDetailsContentProps> = ({ data, type = "car" }) => {
  const t = useTranslations("product.CarDetailsContent")

  // Car details display fields
  const carDetails = [
    {
      label: t("title"),
      value: data?.title || "-",
      icon: <Car className="w-5 h-5" />,
    },
    {
      label: t("make"),
      value: data?.make?.name || "-",
      icon: <Tag className="w-5 h-5" />,
    },
    {
      label: t("model"),
      value: data?.model?.description || "-",
      icon: <Layers className="w-5 h-5" />,
    },
    {
      label: t("trim"),
      value: data?.trim?.name || "-",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: t("year"),
      value: data?.details?.year || "-",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: t("mileage"),
      value: data?.details?.mileage || "-",
      icon: <BarChart className="w-5 h-5" />,
    },
    {
      label: t("engineSize"),
      value: data?.details?.engineSize || "-",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: t("enginePower"),
      value: data?.details?.enginePower || "-",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: t("doors"),
      value: data?.details?.doors || "-",
      icon: <Car className="w-5 h-5" />,
    },
    {
      label: t("colorInterior"),
      value: data?.details?.colorInterior || "-",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      label: t("plateNumber"),
      value: data?.details?.plateNumber || "-",
      icon: <Hash className="w-5 h-5" />,
    },
    {
      label: t("vin"),
      value: data?.details?.vin || "-",
      icon: <Key className="w-5 h-5" />,
    }
  ]

  // Ads details display fields
  const adsDetails = [
    {
      label: t("title"),
      value: data?.title || "-",
      icon: <Car className="w-5 h-5" />,
    },
    {
      label: t("contactNumber"),
      value: data?.contactNumber || "-",
      icon: <Phone className="w-5 h-5" />,
    },
    {
      label: t("price"),
      value: data?.price ? `${data?.price} ${data?.currency || ""}` : "-",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: t("currency"),
      value: data?.currency || "-",
      icon: <Bookmark className="w-5 h-5" />,
    },
    {
      label: t("address"),
      value: data?.address || "-",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: t("city"),
      value: data?.city || "-",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: t("governorate"),
      value: data?.governorate || "-",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: t("description"),
      value: data?.description || "-",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: t("story"),
      value: data?.story || "-",
      icon: <Info className="w-5 h-5" />,
    }
  ]

  // Select which details to display based on type
  const detailsToShow = type === "car" ? carDetails : adsDetails;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {detailsToShow.map((detail, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md p-4 h-32 w-full flex flex-col justify-between border-l-4 border-primary-light hover:border-primary-foreground transition-colors duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-secondary-text uppercase tracking-wider">{detail.label}</h3>
              <div className="bg-primary-foreground/10 p-2 rounded-full">
                {React.cloneElement(detail.icon, { 
                  className: "text-primary-light" 
                })}
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-lg font-bold text-primary truncate">{detail.value}</p>
            </div>
            
          
          </div>
        ))}
      </div>
    </div>
  )
}

export default CarDetailsContent