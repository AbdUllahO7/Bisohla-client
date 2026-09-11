"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Check, ChevronDown, Search, X, ChevronRight, Clock, PlusCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"

export interface SelectFieldWithSearchProps {
  options?: Array<{ value: string; label: string }>
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
  fetchOptions?: (params: {
    searchTerm?: string
    page: number
    pageSize?: number
  }) => Promise<{
    options: Array<{ value: string; label: string }>
    hasMore: boolean
    total?: number
  }>
  dependencyKey?: any
}

const SelectFieldWithSearch: React.FC<SelectFieldWithSearchProps> = ({
  options = [],
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
  fetchOptions,
  dependencyKey,
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)

  const isServerMode = Boolean(fetchOptions)
  const [serverOptions, setServerOptions] = useState<Array<{ value: string; label: string }>>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const activeRequestIdRef = useRef(0)

  // Last known selected options cache
  const [lastKnownSelected, setLastKnownSelected] = useState<Array<{ value: string; label: string }>>([])

  // Fetch page 1 when open, or when debouncedSearch/dependencyKey changes
  useEffect(() => {
    if (!fetchOptions || !open) return

    const currentReqId = ++activeRequestIdRef.current
    setIsLoading(true)
    setPage(1)

    fetchOptions({
      searchTerm: debouncedSearch.trim() || undefined,
      page: 1,
      pageSize: 30,
    })
      .then((res) => {
        if (currentReqId !== activeRequestIdRef.current) return
        setServerOptions(res?.options || [])
        setHasMore(Boolean(res?.hasMore))
        setIsLoading(false)
      })
      .catch((err) => {
        if (currentReqId !== activeRequestIdRef.current) return
        console.error("SelectFieldWithSearch fetch error:", err)
        setServerOptions([])
        setHasMore(false)
        setIsLoading(false)
      })
  }, [open, debouncedSearch, dependencyKey, fetchOptions])

  // Load more pages
  const loadMore = useCallback(() => {
    if (!fetchOptions || !hasMore || isLoading || isLoadingMore) return

    const nextPage = page + 1
    const currentReqId = activeRequestIdRef.current
    setIsLoadingMore(true)

    fetchOptions({
      searchTerm: debouncedSearch.trim() || undefined,
      page: nextPage,
      pageSize: 30,
    })
      .then((res) => {
        if (currentReqId !== activeRequestIdRef.current) return
        const newItems = res?.options || []
        setServerOptions((prev) => {
          const existingKeys = new Set(prev.map((i) => String(i.value)))
          const uniqueNew = newItems.filter((i) => !existingKeys.has(String(i.value)))
          return [...prev, ...uniqueNew]
        })
        setPage(nextPage)
        setHasMore(Boolean(res?.hasMore))
        setIsLoadingMore(false)
      })
      .catch((err) => {
        if (currentReqId !== activeRequestIdRef.current) return
        console.error("SelectFieldWithSearch loadMore error:", err)
        setIsLoadingMore(false)
      })
  }, [fetchOptions, hasMore, isLoading, isLoadingMore, page, debouncedSearch])

  // IntersectionObserver for infinite scrolling inside CommandList
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || isLoading || isLoadingMore || !fetchOptions || !open) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: "100px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, isLoadingMore, loadMore, fetchOptions, open])

  // Base list of options
  const baseOptions = useMemo(() => {
    if (isServerMode) {
      return serverOptions
    }
    return options
  }, [isServerMode, serverOptions, options])

  // Find selected options
  const selectedOptions = useMemo(() => {
    const vals = isMulti
      ? Array.isArray(value)
        ? value.map(String)
        : value
        ? [String(value)]
        : []
      : value !== undefined && value !== null && value !== "" && value !== "0"
      ? [String(value)]
      : []

    if (vals.length === 0) return []

    const found: Array<{ value: string; label: string }> = []
    vals.forEach((v) => {
      const vLower = v.trim().toLowerCase()
      const matchInBase = baseOptions.find(
        (opt) => String(opt.value).trim().toLowerCase() === vLower || opt.label.trim().toLowerCase() === vLower
      )
      if (matchInBase) {
        found.push(matchInBase)
        return
      }

      const matchInProps = options.find(
        (opt) => String(opt.value).trim().toLowerCase() === vLower || opt.label.trim().toLowerCase() === vLower
      )
      if (matchInProps) {
        found.push(matchInProps)
        return
      }

      const matchInCache = lastKnownSelected.find(
        (opt) => String(opt.value).trim().toLowerCase() === vLower || opt.label.trim().toLowerCase() === vLower
      )
      if (matchInCache) {
        found.push(matchInCache)
        return
      }

      if (isNaN(Number(v)) && v.trim()) {
        found.push({ value: v, label: v })
      }
    })

    return found
  }, [baseOptions, options, lastKnownSelected, value, isMulti])

  useEffect(() => {
    if (selectedOptions.length > 0) {
      setLastKnownSelected(selectedOptions)
    }
  }, [selectedOptions])

  // Filter options based on search term, ensuring selected options remain visible
  const { displayOptions, hasSearchMatches } = useMemo(() => {
    if (isServerMode) {
      const hasMatches = baseOptions.length > 0
      if (selectedOptions.length > 0) {
        const selectedIds = new Set(selectedOptions.map((opt) => String(opt.value)))
        const otherOptions = baseOptions.filter((opt) => !selectedIds.has(String(opt.value)))
        return {
          displayOptions: [...selectedOptions, ...otherOptions],
          hasSearchMatches: hasMatches,
        }
      }
      return {
        displayOptions: baseOptions,
        hasSearchMatches: hasMatches,
      }
    }

    const trimmed = searchTerm.trim().toLowerCase()
    if (!trimmed) {
      return { displayOptions: baseOptions, hasSearchMatches: true }
    }

    const matches = baseOptions.filter((option) =>
      option.label.toLowerCase().includes(trimmed)
    )
    const hasMatches = matches.length > 0

    if (selectedOptions.length > 0) {
      const selectedIds = new Set(selectedOptions.map((opt) => String(opt.value)))
      const otherMatches = matches.filter((opt) => !selectedIds.has(String(opt.value)))

      return {
        displayOptions: [...selectedOptions, ...otherMatches],
        hasSearchMatches: hasMatches,
      }
    }

    return {
      displayOptions: matches,
      hasSearchMatches: hasMatches,
    }
  }, [isServerMode, baseOptions, searchTerm, selectedOptions])

  // Find the selected option label or joined labels for multi-select
  const selectedOptionLabel = useMemo(() => {
    if (isMulti) {
      if (selectedOptions.length > 0) {
        return selectedOptions.map((opt) => opt.label).join(", ")
      }
      return ""
    }
    if (selectedOptions.length > 0) {
      return selectedOptions[0].label
    }
    if (pendingProposalName && (!value || value === "")) {
      return pendingProposalName
    }
    return ""
  }, [selectedOptions, value, isMulti, pendingProposalName])

  const hasActiveProposal = !!pendingProposalName && (!value || value === "")

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    const clickedOpt = baseOptions.find((opt) => String(opt.value) === String(selectedValue))
    if (clickedOpt) {
      setLastKnownSelected((prev) => [...prev.filter((p) => String(p.value) !== String(selectedValue)), clickedOpt])
    }

    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : value ? [value] : []
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter((v) => v !== selectedValue)
        : [...currentValues, selectedValue]
      onChange(name, newValues)
      if (onBlur) onBlur(name, newValues)
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
    const term = searchTerm
    setOpen(false)
    setSearchTerm("")
    if (onProposeClick) {
      setTimeout(() => onProposeClick(term), 50)
    }
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}

      <div className="flex items-center gap-2">
        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) handleBlur()
          }}
        >
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
                hasActiveProposal &&
                  "border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10",
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
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 opacity-50 text-[#198341]", isRtl ? "mr-2" : "ml-2")}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-zinc-900 shadow-2xl border border-slate-100 dark:border-zinc-800 p-0 overflow-hidden !z-[99999] rounded-2xl ring-1 ring-black/5 dark:ring-white/10"
            align="start"
            style={{ width: "var(--radix-popover-trigger-width)" }}
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
                {isLoading ? (
                  <Loader2
                    className={cn(
                      "absolute h-4 w-4 text-[#198341] top-1/2 -translate-y-1/2 animate-spin pointer-events-none",
                      isRtl ? "right-3" : "left-3"
                    )}
                  />
                ) : (
                  <Search
                    className={cn(
                      "absolute h-4 w-4 text-slate-400 top-1/2 -translate-y-1/2 pointer-events-none",
                      isRtl ? "right-3" : "left-3"
                    )}
                  />
                )}
              </div>
            </div>

            <Command shouldFilter={false} className="bg-transparent border-none">
              <CommandList
                className={cn(
                  "max-h-[280px] overflow-auto bg-transparent p-2",
                  "custom-scrollbar-rtl"
                )}
              >
                {isLoading && displayOptions.length === 0 ? (
                  <div className="space-y-1.5 p-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : null}

                {displayOptions.length === 0 && !isLoading && (
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
                          <span>
                            {proposeCtaLabel || (isRtl ? "اقترح قيمة جديدة" : "Suggest new value")}
                          </span>
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                )}

                <CommandGroup className="p-0">
                  {displayOptions.map((option) => {
                    const isSelected = isMulti
                      ? (Array.isArray(value)
                          ? value.map(String)
                          : value
                          ? [String(value)]
                          : []
                        ).includes(String(option.value))
                      : String(value) === String(option.value)
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
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <span className="font-semibold text-xs truncate">{option.label}</span>
                          {isSelected && searchTerm.trim() && (
                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium shrink-0">
                              {isRtl ? "المحدد" : "Selected"}
                            </span>
                          )}
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
                    )
                  })}
                </CommandGroup>

                {/* Loading More Spinner */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#198341] font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isRtl ? "جاري تحميل المزيد..." : "Loading more..."}</span>
                  </div>
                )}

                {/* Sentinel for infinite scroll */}
                {isServerMode && hasMore && (
                  <div ref={sentinelRef} className="h-3 w-full" aria-hidden="true" />
                )}

                {/* When user searched and no other items matched */}
                {searchTerm.trim() && !hasSearchMatches && displayOptions.length > 0 && (
                  <div className="py-4 px-3 text-center border-t border-slate-100 dark:border-zinc-800 mt-1">
                    <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                      {isRtl ? "لا توجد خيارات مطابقة أخرى" : "No other matching options found"}
                    </p>
                    {emptyDescription && (
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        {emptyDescription}
                      </p>
                    )}
                    {onProposeClick && (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOpenPropose}
                          className="rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 gap-1.5 h-8 shadow-none"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>
                            {proposeCtaLabel || (isRtl ? "اقترح قيمة جديدة" : "Suggest new value")}
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CommandList>
            </Command>

            {/* Ghost propose CTA in list footer when options are present and not already showing the no-matches block */}
            {displayOptions.length > 0 &&
              onProposeClick &&
              !(!hasSearchMatches && searchTerm.trim()) && (
                <div className="p-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenPropose}
                    className="w-full justify-center text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-8 gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>
                      {proposeCtaLabel || (isRTL(isRtl) ? "لم تجد طلبك؟ اقترحه" : "Can't find it? Suggest it")}
                    </span>
                  </Button>
                </div>
              )}
          </PopoverContent>
        </Popover>

        {/* Clear button (Sibling to trigger) */}
        {(hasActiveProposal || (value && value !== "" && (Array.isArray(value) ? value.length > 0 : true))) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (hasActiveProposal && onClearProposal) {
                onClearProposal()
              } else {
                onChange(name, isMulti ? [] : "")
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

function isRTL(isRtlProp?: boolean) {
  return Boolean(isRtlProp)
}

export default SelectFieldWithSearch