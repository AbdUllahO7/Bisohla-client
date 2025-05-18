"use client"
import Box from "@/components/box/box"
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
    <div  className="w-full overflow-hidden container">
      <div className="  flex justify-between  overflow-hidden">
        <div className="flex  justify-between  items-center w-full overflow-hidden">
          <div className="flex items-center ">
            <Text variant="mid" className="text-center overflow-hidden font-bold text-primary text-xl">
              {totalItems} {t("header.adCounter")}
            </Text>
          </div>

          <div className="flex items-center gap-2 flex-shrink-1">
            <Text className="whitespace-nowrap">{t("header.orderBy")}</Text>
            <div>
              <SelectDropdown
                options={sortOptions}
                placeholder={t("header.selectPrice")}
                SelectTriggerStyle="shadow-none p-0 border-none"
                className="w-[150px] xs:w-[120px]"
                disabled={false}
                onChange={handleSortChange}
                value={getCurrentSortValue()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
