"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Box from "@/components/ui/box"
import Text from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, X, ChevronRight, Clock, PlusCircle } from "lucide-react"
import Image from "next/image"

// Option interface to use instead of directly using SelectCarMakeDto
interface Option {
  value: string
  label: string
  logoUrl?: string | null // Handle both undefined and null cases
}

interface SelectableListProps {
  title: string
  type: string
  options: Option[]
  selectedValue: string
  direction: string // Changed to string to accept any string value
  onSelect: (type: any, value: string) => void
  required?: boolean
  pendingProposalName?: string | null
  onClearProposal?: () => void
  onProposeClick?: (currentSearch: string) => void
  proposeCtaLabel?: string
  emptyDescription?: string
}

const SelectableList: React.FC<SelectableListProps> = ({
  title,
  type,
  options,
  selectedValue,
  direction,
  onSelect,
  required = true,
  pendingProposalName,
  onClearProposal,
  onProposeClick,
  proposeCtaLabel,
  emptyDescription,
}) => {
  // State for search input
  const [searchTerm, setSearchTerm] = useState("")

  // Ensure direction is always a valid value for components that expect "rtl" | "ltr"
  const safeDirection = direction === "rtl" || direction === "ltr" ? direction : "ltr"
  const isRTL = safeDirection === "rtl"

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
  const hasActiveProposal = !!pendingProposalName && (!selectedValue || selectedValue === "");

  return (
    <Box className="min-w-[280px] px-6 py-6" variant="column">
      {/* Enhanced Header */}
      <Box variant="row" className="flex items-center justify-between pb-4 mb-2">
        <div className="flex items-center">
          <Text className="text-[#1a2b28] dark:text-white font-bold text-2xl tracking-tight">{title}</Text>
          {required && <Text className="text-red-500 ml-2 text-xl">*</Text>}
        </div>
        {hasActiveProposal ? (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {isRTL ? "قيد المراجعة" : "Pending"}
            </span>
          </div>
        ) : required && !selectedValue ? (
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
              {safeDirection === "ltr" ? "Required" : "مطلوب"}
            </span>
          </div>
        ) : null}
      </Box>

      {/* Active Proposal banner */}
      {hasActiveProposal && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold truncate">
              {pendingProposalName}
            </span>
          </div>
          {onClearProposal && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClearProposal}
              className="h-6 w-6 rounded-full text-amber-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              title={isRTL ? "إزالة القيمة المقترحة" : "Remove suggested value"}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      )}

      {/* Enhanced Container */}
      <Box
        variant="column"
        className={`min-w-[280px] max-w-[280px] bg-white dark:bg-zinc-900 border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
          !selectedValue && !hasActiveProposal && required 
            ? "border-red-300 dark:border-red-900 shadow-red-100 dark:shadow-none" 
            : hasActiveProposal
            ? "border-amber-300 dark:border-amber-700/60"
            : "border-[#198341]/20 dark:border-zinc-800 hover:border-[#198341]/40 dark:hover:border-zinc-700"
        } overflow-hidden`}
      >
        {/* Enhanced Search Input */}
        <div className="p-5 pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-gray-100 dark:border-zinc-800">
          <Box variant="row" className="relative w-full">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pr-12 pl-12 py-3.5 text-sm border-2 border-[#198341]/30 dark:border-zinc-800 rounded-xl 
                focus:border-[#198341] focus:ring-4 focus:ring-[#ABDE3B]/20 
                transition-all duration-300 bg-white dark:bg-zinc-950 dark:text-white shadow-sm hover:shadow-md
                placeholder:text-gray-400 dark:placeholder:text-zinc-500
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
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="h-7 w-7 p-0 text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:text-red-400 rounded-full transition-all duration-200"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </Box>
        </div>

        {/* Enhanced Options List */}
        <ScrollArea
          className="h-[280px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341]/60 scrollbar-track-gray-100 dark:scrollbar-track-zinc-800 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          dir={safeDirection}
        >
          <Box variant="column" className="w-full p-2">
            {filteredOptions && filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  onClick={() => onSelect(type, option.value)}
                  className={`w-full py-4 px-4 mb-1 text-[#2C3C39] dark:text-zinc-200 bg-white dark:bg-zinc-900 font-medium text-left
                    hover:bg-gradient-to-r hover:from-[#ABDE3B]/10 hover:to-[#198341]/5 dark:hover:from-[#ABDE3B]/20 dark:hover:to-[#198341]/10
                    hover:text-[#1a2b28] dark:hover:text-white hover:shadow-md hover:scale-[1.02]
                    transition-all duration-300 rounded-xl border border-transparent
                    hover:border-[#198341]/20 dark:hover:border-[#198341]/40 group
                    ${String(selectedValue) === String(option.value)
                      ? "bg-gradient-to-r from-[#198341] to-[#2C3C39] text-white shadow-lg scale-[1.02] border-[#198341]" 
                      : "hover:border-gray-200 dark:hover:border-zinc-800"
                    } 
                    ${shouldShowLogo ? "flex items-center justify-between" : ""}`}
                >
                  <div className={`flex items-center ${shouldShowLogo ? "flex-1" : "w-full"} ${safeDirection === "ltr" ? "text-left" : "text-right"}`}>
                    {/* Logo for car makes */}
                    {shouldShowLogo && option.logoUrl && (
                      <div className="flex-shrink-0 mr-3 rtl:mr-0 rtl:ml-3">
                        <div className={`w-8 h-8 rounded-lg p-1 shadow-sm transition-all duration-300 ${
                          String(selectedValue) === String(option.value) ? "bg-white/20" : "bg-gray-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-750 group-hover:shadow-md"
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
                    className={`ml-2 rtl:ml-0 rtl:mr-2 transition-all duration-300 ${
                      selectedValue === option.value 
                        ? "text-white" 
                        : "text-gray-400 group-hover:text-[#198341] group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                    }`} 
                  />
                </Button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                  <Search size={20} className="text-gray-400 dark:text-zinc-500" />
                </div>
                <Text className="text-gray-600 dark:text-zinc-300 text-xs font-semibold mb-1">
                  {searchTerm
                    ? isRTL ? "لا توجد خيارات مطابقة" : "No matching options found"
                    : isRTL ? "لا توجد خيارات متاحة" : "No options available"}
                </Text>
                {emptyDescription && (
                  <Text className="text-gray-400 dark:text-zinc-500 text-[11px] max-w-[200px] leading-relaxed mb-3">
                    {emptyDescription}
                  </Text>
                )}
                {onProposeClick && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onProposeClick(searchTerm)}
                    className="mt-2 rounded-xl text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 gap-1.5 h-8 shadow-none"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{proposeCtaLabel || (isRTL ? "اقترح قيمة جديدة" : "Suggest new value")}</span>
                  </Button>
                )}
              </div>
            )}

            {/* List footer propose CTA when options exist */}
            {filteredOptions && filteredOptions.length > 0 && onProposeClick && (
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onProposeClick(searchTerm)}
                  className="w-full justify-center text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl h-8 gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{proposeCtaLabel || (isRTL ? "لم تجد طلبك؟ اقترحه" : "Can't find it? Suggest it")}</span>
                </Button>
              </div>
            )}
          </Box>
        </ScrollArea>
      </Box>
    </Box>
  )
}

export default SelectableList