"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import Image from "next/image"

// Option interface to use instead of directly using SelectCarMakeDto
interface Option {
  value: string
  label: string
  logoUrl?: string | null // Handle both undefined and null cases
}

interface SelectableListProps {
  title: string
  type: "marka" | "model" | "year" | "trim" | "governorate" | "city"
  options: Option[]
  selectedValue: string
  direction: string // Changed to string to accept any string value
  onSelect: (type: "marka" | "model" | "year" | "trim" | "governorate" | "city", value: string) => void
  required?: boolean
}

const SelectableList: React.FC<SelectableListProps> = ({
  title,
  type,
  options,
  selectedValue,
  direction,
  onSelect,
  required = true, // Make required by default
}) => {
  // State for search input
  const [searchTerm, setSearchTerm] = useState("")

  console.log("options", options)

  // Ensure direction is always a valid value for components that expect "rtl" | "ltr"
  const safeDirection = direction === "rtl" || direction === "ltr" ? direction : "ltr"

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options

    return options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [options, searchTerm])

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("")
  }

  // Placeholder text based on direction
  const searchPlaceholder = safeDirection === "ltr" ? `Search ${title.toLowerCase()}...` : `بحث ${title}...`

  // Check if this is a car make type (should show logos)
  const shouldShowLogo = type === "marka"

  return (
    <Box className="min-w-[250px] px-5 py-5" variant="column">
      <Box variant="row" className="flex items-center border-b border-primary-foreground pb-2">
        <Text className="text-primary font-bold text-xl">{title}</Text>
        {required && <Text className="text-red-500 ml-1 text-lg">*</Text>}
        {required && !selectedValue && (
          <Text className="text-red-500 text-xs ml-2">{safeDirection === "ltr" ? "(Required)" : "(مطلوب)"}</Text>
        )}
      </Box>
      <Box
        variant="column"
        className={`min-w-[250px] max-w-[250px] border ${!selectedValue && required ? "border-red-300" : "border-gray-200"} px-5 rounded-lg mt-2`}
      >
        {/* Search input */}
        <Box variant="row" className="relative w-full mt-3 mb-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full pr-8 pl-8 py-2 text-sm  border-primary-light border-2  rounded-lg focus:border-primary focus:ring-1 focus:ring-primary ${safeDirection === "rtl" ? "text-right" : "text-left"}`}
            dir={safeDirection}
          />
          <div
            className={`absolute ${safeDirection === "rtl" ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 flex items-center`}
          >
            {searchTerm ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </Button>
            ) : null}
          </div>
          <div
            className={`absolute ${safeDirection === "rtl" ? "right-2" : "left-2"} top-1/2 transform -translate-y-1/2`}
          >
            <Search size={16} className="text-gray-400" />
          </div>
        </Box>

        <ScrollArea
          className="h-[250px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          dir={safeDirection}
        >
          <Box variant="column" className="w-full mt-2">
            {filteredOptions && filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => onSelect(type, option.value)}
                  className={`w-full py-6 px-4 text-primary bg-white font-semibold border-b border-b-gray-200 hover:bg-primary hover:text-white duration-500 ${selectedValue === option.value ? "bg-primary-foreground text-primary" : ""} ${shouldShowLogo ? "flex items-center justify-between" : ""}`}
                >
                  <span className={`${shouldShowLogo ? "flex-1" : "w-full"} ${safeDirection === "ltr" ? "text-left" : "text-right"}`}>
                    {option.label}
                  </span>
                  {/* Only show logo for car makes and if logoUrl exists and is not null */}
                  {shouldShowLogo && option.logoUrl && (
                    <div className="flex-shrink-0 ml-2">
                      <Image
                        alt={`${option.label} logo`}
                        src={option.logoUrl}
                        width={24}
                        height={24}
                        className="object-contain"
                        onError={(e) => {
                          // Hide image if it fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </Button>
              ))
            ) : (
              <Text className="p-4 text-gray-500 text-center">
                {searchTerm
                  ? safeDirection === "ltr"
                    ? "No matching options"
                    : "لا توجد خيارات مطابقة"
                  : safeDirection === "ltr"
                    ? `No options available${required ? " (selection required)" : ""}`
                    : `لا توجد خيارات متاحة${required ? " (الاختيار مطلوب)" : ""}`}
              </Text>
            )}
          </Box>
        </ScrollArea>
      </Box>
    </Box>
  )
}

export default SelectableList