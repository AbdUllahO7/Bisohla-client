"use client"

import React, { useState, useMemo } from "react"
import { Check, ChevronDown, Search, X, ChevronRight, Clock, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface SelectFieldWithSearchProps {
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
  emptyDescription?: string
  isRtl?: boolean
  disabled?: boolean
  isMulti?: boolean
  pendingProposalName?: string | null
  onClearProposal?: () => void
  onProposeClick?: (currentSearch: string) => void
  proposeCtaLabel?: string
  pendingPillLabel?: string
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
  emptyDescription,
  isRtl = false,
  disabled = false,
  isMulti = false,
  pendingProposalName,
  onClearProposal,
  onProposeClick,
  proposeCtaLabel,
  pendingPillLabel = "Pending",
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
    if (selected) return selected.label;
    if (pendingProposalName && (!value || value === '')) {
      return pendingProposalName;
    }
    return "";
  }, [options, value, isMulti, pendingProposalName]);

  const hasActiveProposal = !!pendingProposalName && (!value || value === '');

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

  const handleOpenPropose = () => {
    const term = searchTerm;
    setOpen(false);
    setSearchTerm("");
    if (onProposeClick) {
      // Small timeout to allow popover to unmount cleanly before dialog opens
      setTimeout(() => onProposeClick(term), 50);
    }
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}

      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) handleBlur()
        }}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "flex-1 h-12 px-4 justify-between bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 hover:border-[#198341]/40 dark:hover:border-zinc-700 text-slate-700 dark:text-white font-semibold transition-all rounded-2xl shadow-sm hover:shadow-md",
                isRtl ? "text-right flex-row" : "text-left flex-row",
                error ? "border-red-500" : "",
                hasActiveProposal && "border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10",
                disabled && "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-zinc-850",
                SelectTriggerStyle
              )}
            >
              <div className="flex items-center gap-2 truncate flex-1">
                <span className="truncate">{selectedOptionLabel || placeholder}</span>
                {hasActiveProposal && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{pendingPillLabel}</span>
                  </span>
                )}
              </div>
              <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 text-[#198341]", isRtl ? "mr-2" : "ml-2")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="bg-white dark:bg-zinc-900 shadow-2xl border border-slate-100 dark:border-zinc-800 p-0 overflow-hidden !z-[99999] rounded-2xl ring-1 ring-black/5 dark:ring-white/10" 
            align="start" 
            style={{ width: 'var(--radix-popover-trigger-width)' }}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="p-3 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-gray-100 dark:border-zinc-800">
              <div className="relative w-full">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={isRtl ? `بحث ${placeholder}...` : searchPlaceholder}
                  className={cn(
                    "w-full h-10 text-xs border border-slate-200 dark:border-zinc-800 focus:border-[#198341] rounded-xl focus-visible:ring-1 focus-visible:ring-[#198341] bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 shadow-sm",
                    isRtl ? "pr-9 pl-4 text-right" : "pl-9 pr-4 text-left"
                  )}
                  dir={isRtl ? "rtl" : "ltr"}
                />
                <Search className={cn("absolute h-4 w-4 text-slate-400 top-1/2 -translate-y-1/2 pointer-events-none", isRtl ? "right-3" : "left-3")} />
              </div>
            </div>

            <Command className="bg-transparent border-none">
              <CommandList 
                className={cn(
                  "max-h-[280px] overflow-auto bg-transparent p-2",
                  "custom-scrollbar-rtl"
                )}
              >
                <CommandEmpty className="py-6 px-4 text-center">
                  <Search className="h-6 w-6 text-slate-300 dark:text-zinc-700 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                    {emptyMessage}
                  </p>
                  {emptyDescription && (
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      {emptyDescription}
                    </p>
                  )}
                  {onProposeClick && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenPropose}
                        className="rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 gap-1.5 h-8 shadow-none"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{proposeCtaLabel || (isRtl ? "اقترح قيمة جديدة" : "Suggest new value")}</span>
                      </Button>
                    </div>
                  )}
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
                          "flex items-center justify-between px-3.5 py-2 cursor-pointer rounded-xl mb-1 transition-all duration-200 border border-transparent group",
                          isSelected 
                            ? "bg-gradient-to-r from-[#198341] to-[#2C3C39] text-white shadow-md font-bold" 
                            : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 hover:border-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="font-semibold text-xs truncate">{option.label}</span>
                        </div>
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <ChevronRight 
                            className={cn(
                              "h-3.5 w-3.5 text-slate-300 dark:text-zinc-600 group-hover:text-primary transition-all",
                              isRtl && "rotate-180"
                            )} 
                          />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>

            {/* Ghost propose CTA in list footer when options are present */}
            {filteredOptions.length > 0 && onProposeClick && (
              <div className="p-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenPropose}
                  className="w-full justify-center text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-8 gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{proposeCtaLabel || (isRtl ? "لم تجد طلبك؟ اقترحه" : "Can't find it? Suggest it")}</span>
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Clear button (Sibling to trigger) */}
        {(hasActiveProposal || (value && value !== '')) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (hasActiveProposal && onClearProposal) {
                onClearProposal();
              } else {
                onChange(name, isMulti ? [] : '');
              }
            }}
            className="h-12 w-12 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-zinc-800 flex-shrink-0"
            title={isRtl ? "إلغاء التحديد" : "Clear"}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export default SelectFieldWithSearch