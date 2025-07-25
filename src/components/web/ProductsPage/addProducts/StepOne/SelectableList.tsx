"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, X, ChevronRight } from "lucide-react"
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
    <Box className="min-w-[280px] px-6 py-6" variant="column">
      {/* Enhanced Header */}
      <Box variant="row" className="flex items-center pb-4 mb-2">
        <div className="flex items-center">
          <Text className="text-[#1a2b28] font-bold text-2xl tracking-tight">{title}</Text>
          {required && <Text className="text-red-500 ml-2 text-xl">*</Text>}
        </div>
        {required && !selectedValue && (
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              {safeDirection === "ltr" ? "Required" : "مطلوب"}
            </span>
          </div>
        )}
      </Box>

      {/* Enhanced Container */}
      <Box
        variant="column"
        className={`min-w-[280px] max-w-[280px] bg-white border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
          !selectedValue && required 
            ? "border-red-300 shadow-red-100" 
            : "border-[#198341]/20 hover:border-[#198341]/40"
        } overflow-hidden`}
      >
        {/* Enhanced Search Input */}
        <div className="p-5 pb-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <Box variant="row" className="relative w-full">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pr-12 pl-12 py-3.5 text-sm border-2 border-[#198341]/30 rounded-xl 
                focus:border-[#198341] focus:ring-4 focus:ring-[#ABDE3B]/20 
                transition-all duration-300 bg-white shadow-sm hover:shadow-md
                placeholder:text-gray-400
                ${safeDirection === "rtl" ? "text-right" : "text-left"}`}
              dir={safeDirection}
            />
            
            {/* Search Icon */}
            <div
              className={`absolute ${safeDirection === "rtl" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2`}
            >
              <Search size={18} className="text-[#198341]" />
            </div>

            {/* Clear Button */}
            {searchTerm && (
              <div
                className={`absolute ${safeDirection === "rtl" ? "left-4" : "right-4"} top-1/2 transform -translate-y-1/2`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </Box>
        </div>

        {/* Enhanced Options List */}
        <ScrollArea
          className="h-[280px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341]/60 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          dir={safeDirection}
        >
          <Box variant="column" className="w-full p-2">
            {filteredOptions && filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <Button
                  key={option.value}
                  onClick={() => onSelect(type, option.value)}
                  className={`w-full py-4 px-4 mb-1 text-[#2C3C39] bg-white font-medium text-left
                    hover:bg-gradient-to-r hover:from-[#ABDE3B]/10 hover:to-[#198341]/5
                    hover:text-[#1a2b28] hover:shadow-md hover:scale-[1.02]
                    transition-all duration-300 rounded-xl border border-transparent
                    hover:border-[#198341]/20 group
                    ${selectedValue === option.value 
                      ? "bg-gradient-to-r from-[#198341] to-[#2C3C39] text-white shadow-lg scale-[1.02] border-[#198341]" 
                      : "hover:border-gray-200"
                    } 
                    ${shouldShowLogo ? "flex items-center justify-between" : ""}`}
                >
                  <div className={`flex items-center ${shouldShowLogo ? "flex-1" : "w-full"} ${safeDirection === "ltr" ? "text-left" : "text-right"}`}>
                    {/* Logo for car makes */}
                    {shouldShowLogo && option.logoUrl && (
                      <div className="flex-shrink-0 mr-3">
                        <div className={`w-8 h-8 rounded-lg p-1 shadow-sm transition-all duration-300 ${
                          selectedValue === option.value ? "bg-white/20" : "bg-gray-100 group-hover:bg-white group-hover:shadow-md"
                        }`}>
                          <Image
                            alt={`${option.label} logo`}
                            src={option.logoUrl}
                            width={32}
                            height={32}
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <span className="flex-1 truncate">
                      {option.label}
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight 
                    size={16} 
                    className={`ml-2 transition-all duration-300 ${
                      selectedValue === option.value 
                        ? "text-white" 
                        : "text-gray-400 group-hover:text-[#198341] group-hover:translate-x-1"
                    }`} 
                  />
                </Button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <Text className="text-gray-500 text-center font-medium mb-2">
                  {searchTerm
                    ? safeDirection === "ltr"
                      ? "No matching options found"
                      : "لا توجد خيارات مطابقة"
                    : safeDirection === "ltr"
                      ? "No options available"
                      : "لا توجد خيارات متاحة"}
                </Text>
                {required && !searchTerm && (
                  <Text className="text-gray-400 text-center text-sm">
                    {safeDirection === "ltr" ? "Selection is required" : "الاختيار مطلوب"}
                  </Text>
                )}
              </div>
            )}
          </Box>
        </ScrollArea>
      </Box>
    </Box>
  )
}

export default SelectableList