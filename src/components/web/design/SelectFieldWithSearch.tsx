"use client"

import React, { useState, useMemo } from "react"
import { Check, ChevronDown, Search, X, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface SelectFieldWithSearchProps {
  options: Array<{ value: string; label: string }>
  value: string | string[]
  onChange: (field: string, value: any) => void
  onBlur?: (field: string, value: any) => void
  name: string
  placeholder: string
  label?: string
  className?: string
  SelectTriggerStyle?: string
  required?: boolean
  error?: string
  searchPlaceholder?: string
  emptyMessage?: string
  isRtl?: boolean
  disabled?: boolean
  isMulti?: boolean
}

const SelectFieldWithSearch: React.FC<SelectFieldWithSearchProps> = ({
  options,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  label,
  className,
  SelectTriggerStyle,
  required = false,
  error,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  isRtl = false,
  disabled = false,
  isMulti = false,
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // Find the selected option label or joined labels for multi-select
  const selectedOptionLabel = useMemo(() => {
    if (isMulti) {
      const vals = Array.isArray(value) ? value : (value ? [value] : []);
      return options
        .filter((option) => vals.includes(option.value))
        .map((option) => option.label)
        .join(", ");
    }
    const selected = options.find((option) => option.value === value);
    return selected ? selected.label : "";
  }, [options, value, isMulti]);

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter((v) => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(name, newValues);
      if (onBlur) onBlur(name, newValues);
    } else {
      onChange(name, selectedValue)
      if (onBlur) onBlur(name, selectedValue)
      setOpen(false)
      setSearchTerm("")
    }
  }

  // Handle blur event
  const handleBlur = () => {
    if (onBlur) onBlur(name, value)
    setSearchTerm("")
  }

  // Prevent Enter key from closing the popover
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  return (
    <div className={cn("w-full  ", className)}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) handleBlur()
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full h-12 px-4 justify-between bg-white border-2 border-[#198341]/20 hover:border-[#198341]/40 text-gray-700 font-semibold transition-all rounded-2xl shadow-sm hover:shadow-md",
              isRtl ? "text-right flex-row" : "text-left flex-row",
              error ? "border-red-500" : "",
              disabled && "opacity-50 cursor-not-allowed bg-gray-50",
              SelectTriggerStyle
            )}
          >
            <span className="truncate">{selectedOptionLabel || placeholder}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 text-[#198341]", isRtl ? "mr-2" : "ml-2")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="bg-white shadow-2xl border-none p-0 overflow-hidden !z-[99999] rounded-2xl ring-1 ring-black/5" 
          align="start" 
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="p-5 pb-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="relative w-full">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={isRtl ? `بحث ${placeholder}...` : searchPlaceholder}
                className={cn(
                  "w-full py-4 h-12 text-sm border-2 border-[#198341]/30 focus:border-[#198341] focus:ring-4 focus:ring-[#ABDE3B]/20 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 bg-white text-gray-800 transition-all duration-300 shadow-sm hover:shadow-md",
                  isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                )}
                dir={isRtl ? "rtl" : "ltr"}
              />
              <Search className={cn("absolute h-5 w-5 text-[#198341] top-1/2 -translate-y-1/2 pointer-events-none", isRtl ? "right-3" : "left-3")} />
            </div>
          </div>

          <Command className="bg-transparent border-none">
            <CommandList 
              className={cn(
                "max-h-[350px] overflow-auto bg-transparent p-2",
                "custom-scrollbar-rtl"
              )}
            >
              <CommandEmpty className="py-12 text-center text-sm text-gray-500">
                <Search className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup className="p-0">
                {filteredOptions.map((option) => {
                  const isSelected = isMulti
                    ? (Array.isArray(value) ? value : (value ? [value] : [])).includes(option.value)
                    : value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 cursor-pointer rounded-xl mb-1 transition-all duration-300 border border-transparent group",
                        isSelected 
                          ? "bg-gradient-to-r from-[#198341] to-[#2C3C39] text-white shadow-lg scale-[1.01] border-[#198341]" 
                          : "bg-white text-[#2C3C39] hover:bg-gradient-to-r hover:from-[#ABDE3B]/10 hover:to-[#198341]/5 hover:shadow-md hover:border-[#198341]/20"
                      )}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-semibold text-sm truncate">{option.label}</span>
                      </div>
                      {isSelected ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 transition-all duration-300", 
                            "text-gray-300 group-hover:text-[#198341] group-hover:translate-x-1",
                            isRtl && "rotate-180 group-hover:-translate-x-1"
                          )} 
                        />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default SelectFieldWithSearch