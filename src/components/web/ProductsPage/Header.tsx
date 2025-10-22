"use client"
import SelectDropdown from "@/components/SelectDropdown"
import Text from "@/components/text/text"
import { useTranslations } from "next-intl"
import type React from "react"

// Sort options type
interface SortOption {
  value: string
  label: string
  sortBy: string
  sortDirection: "asc" | "desc"
}

// Props interface for the Header component to receive the sort handler
interface HeaderProps {
  onSortChange?: (sortBy: string, sortDirection: "asc" | "desc") => void
  totalItems?: number
  currentSort?: {
    sortBy: string
    sortDirection: "asc" | "desc"
  }
}

const Header: React.FC<HeaderProps> = ({
  onSortChange,
  totalItems = 0,
  currentSort = { sortBy: "createdAt", sortDirection: "desc" },
}) => {
  const t = useTranslations("productsPage")

  // Define sort options with both label and actual sort parameters
  const sortOptions: SortOption[] = [
    {
      value: "newest",
      label: t("header.options.newest"),
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    {
      value: "price-high",
      label: t("header.options.priceHigh"),
      sortBy: "price",
      sortDirection: "desc",
    },
    {
      value: "price-low",
      label: t("header.options.priceLow"),
      sortBy: "price",
      sortDirection: "asc",
    },
  ]

  // Get the current selected value based on sortBy and sortDirection
  const getCurrentSortValue = () => {
    const match = sortOptions.find(
      (option) => option.sortBy === currentSort.sortBy && option.sortDirection === currentSort.sortDirection,
    )
    return match ? match.value : "newest" // Default to newest if no match
  }

  // Handle sort change
  const handleSortChange = (name: string, value: string) => {
    const selectedOption = sortOptions.find((option) => option.value === value)
    if (selectedOption && onSortChange) {
      onSortChange(selectedOption.sortBy, selectedOption.sortDirection)
    }
  }

  return (
    <div className="w-full overflow-hidden container">
      <div className="flex justify-between overflow-hidden">
        <div className="flex justify-between items-center w-full overflow-hidden">
          
          {/* Enhanced Total Items Section */}
          <div className="flex items-center gap-3 relative">
            {/* Accent Bar */}
            <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#ABDE3B] to-[#198341] shadow-lg"></div>
            
            {/* Counter with Background Effect */}
            <div className="relative">
              {/* Glow Background */}
              <div className="absolute inset-0 bg-[#ABDE3B]/10 blur-xl rounded-full"></div>
              
              {/* Text Content */}
              <Text variant="mid" className="relative text-center overflow-hidden font-bold text-[#2C3C39] text-xl">
                {totalItems} {t("header.adCounter")}
              </Text>
            </div>
          </div>

          {/* Enhanced Sort Section */}
          <div className="flex items-center gap-3 flex-shrink-1">
            {/* Label with Underline Effect */}
            <div className="relative">
              <Text className="whitespace-nowrap text-[#2C3C39] font-semibold">
                {t("header.orderBy")}
              </Text>
            </div>
            
            {/* Enhanced Dropdown Container */}
            <div className="relative group">
              {/* Outer Glow on Hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-lg opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
              
              {/* Dropdown Wrapper */}
              <div className="relative">
                {/* Pulsing Indicator Dot */}
                
                <SelectDropdown
                  options={sortOptions}
                  placeholder={t("header.selectPrice")}
                  SelectTriggerStyle="shadow-none pl-6 pr-3 py-2.5  hover:border-[#198341] focus:border-[#198341] transition-all duration-300 bg-white font-medium text-[#2C3C39]"
                  className="w-[150px] xs:w-[120px]"
                  disabled={false}
                  onChange={handleSortChange}
                  value={getCurrentSortValue()}
                />
                
                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ABDE3B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header