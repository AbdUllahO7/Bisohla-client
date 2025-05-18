"use client"

import React, { JSX, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Car,
  Tag,
  Phone,
  DollarSign,
  Info,
  Layers,
  Settings,
  Bookmark,
  MessageSquare,
  MapPin,
  Calendar,
  BarChart,
  Key,
  Palette,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface CarDetailsContentProps {
  data: any
  type?: "car" | "ads"
  isLoading?: boolean
}

const CarDetailsContent: React.FC<CarDetailsContentProps> = ({ data, type = "car", isLoading = false }) => {
  const t = useTranslations("product.CarDetailsContent")
  
  // State for expanded text fields
  const [expandedFields, setExpandedFields] = useState<{[key: string]: boolean}>({})
  
  // Toggle expansion of a field
  const toggleExpand = (fieldName: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  type DetailItem = {
    label: string;
    value: any;
    icon: JSX.Element;
    longText?: boolean;
    key?: string;
  };

  // Car details display fields
  const carDetails: DetailItem[] = [
    {
      label: t("trim"),
      value: data?.trim?.name || "-",
      icon: <Settings className="w-5 h-5" />,
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
      label: t("plateNumber"),
      value: data?.details?.plateNumber || "-",
      icon: <Hash className="w-5 h-5" />,
    },
    {
      label: t("vin"),
      value: data?.details?.vin || "-",
      icon: <Key className="w-5 h-5" />,
    },
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
    // Special treatment for address - will be formatted differently

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
    // Special treatment for description - will be formatted differently
    {
      label: t("description"),
      value: data?.description || "-",
      icon: <MessageSquare className="w-5 h-5" />,
      longText: true,
      key: "description"
    },
        {
      label: t("address"),
      value: data?.address || "-",
      icon: <MapPin className="w-5 h-5" />,
      longText: true,
      key: "address"
    },
    // Special treatment for story - will be formatted differently
    {
      label: t("story"),
      value: data?.story || "-",
      icon: <Info className="w-5 h-5" />,
      longText: true,
      key: "story"
    },
  ]

  // Select which details to show based on type
  const detailsToShow = type === "car" ? carDetails : adsDetails

  // Number of skeleton items to show (based on the type)
  const skeletonCount = type === "car" ? 12 : 9

  // Render skeleton loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-lg overflow-hidden shadow-md p-3 h-24 w-full flex flex-col justify-between border-l-4 border-primary-light"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>

              <div className="mt-2">
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // Function to render regular fields
  const renderRegularField = (detail: any, index: number) => (
    <div
      key={index}
      className="bg-white rounded-lg overflow-hidden shadow-md p-3 h-auto w-full flex flex-col justify-between border-l-4 border-primary-light hover:border-primary-foreground transition-colors duration-300"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-secondary-text uppercase tracking-wider">{detail.label}</h3>
        <div className="bg-primary-foreground/10 p-2 rounded-full">
          {React.cloneElement(detail.icon, {
            className: "text-primary-light",
          })}
        </div>
      </div>

      <div className="mt-2">
        <p className="text-base font-bold text-primary">{detail.value}</p>
      </div>
    </div>
  )
  
  // Function to render long text fields (description, address, story)
  const renderLongTextField = (detail: any, index: number) => {
    const isExpanded = expandedFields[detail.key] || false
    const maxLength = 150 // Maximum characters before truncation
    const shouldTruncate = detail.value.length > maxLength
    
    const displayValue = shouldTruncate && !isExpanded 
      ? `${detail.value.substring(0, maxLength)}...` 
      : detail.value
    
    return (
      <div
        key={index}
        className="bg-white rounded-lg overflow-hidden shadow-md p-3 w-full flex flex-col justify-between border-l-4 border-primary-light hover:border-primary-foreground transition-colors duration-300 col-span-1 sm:col-span-2 lg:col-span-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-secondary-text uppercase tracking-wider">{detail.label}</h3>
          <div className="bg-primary-foreground/10 p-2 rounded-full">
            {React.cloneElement(detail.icon, {
              className: "text-primary-light",
            })}
          </div>
        </div>

        <div className="mt-2">
          <p className="text-base text-primary whitespace-pre-wrap">{displayValue}</p>
          
          {shouldTruncate && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleExpand(detail.key)}
              className="mt-2 text-primary-light hover:text-primary flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <span>{t("showLess")}</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>{t("showMore")}</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {detailsToShow.map((detail, index) => 
          detail.longText 
            ? renderLongTextField(detail, index) 
            : renderRegularField(detail, index)
        )}
      </div>
    </div>
  )
}

export default CarDetailsContent