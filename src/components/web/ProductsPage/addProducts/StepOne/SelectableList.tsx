"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Box from "@/components/ui/box"
import Text from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, X, ChevronRight, Clock, PlusCircle, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { useDebounce } from "@/hooks/use-debounce"

export interface Option {
  value: any
  label: any
  logoUrl?: string | null
  keywords?: string[]
  /** Reference-item metadata, forwarded on select so `conditionallyRequiredWhen` can read it. */
  metadata?: Record<string, unknown> | null
}

const toStr = (val: any): string => {
  if (val === null || val === undefined) return ""
  if (typeof val === "string") return val
  if (typeof val === "number" || typeof val === "boolean") return String(val)
  if (typeof val === "object") {
    if (typeof val.ar === "string" && val.ar.trim()) return val.ar
    if (typeof val.en === "string" && val.en.trim()) return val.en
    if (val.ar && typeof val.ar === "object") {
      if (typeof val.ar.name === "string" && val.ar.name.trim()) return val.ar.name
      if (typeof val.ar.label === "string" && val.ar.label.trim()) return val.ar.label
      if (typeof val.ar.value === "string" && val.ar.value.trim()) return val.ar.value
    }
    if (val.en && typeof val.en === "object") {
      if (typeof val.en.name === "string" && val.en.name.trim()) return val.en.name
      if (typeof val.en.label === "string" && val.en.label.trim()) return val.en.label
      if (typeof val.en.value === "string" && val.en.value.trim()) return val.en.value
    }
    if (typeof val.name === "string" && val.name.trim()) return val.name
    if (typeof val.label === "string" && val.label.trim()) return val.label
    if (typeof val.value === "string" && val.value.trim()) return val.value
    if (val.name && typeof val.name === "object") {
      const res = toStr(val.name)
      if (res) return res
    }
    if (val.label && typeof val.label === "object") {
      const res = toStr(val.label)
      if (res) return res
    }
    if (Array.isArray(val) && val.length > 0) {
      for (const item of val) {
        const s = toStr(item)
        if (s) return s
      }
      return ""
    }
    return ""
  }
  return String(val)
}

const normalizeArabic = (text: string): string => {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove Tashkeel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[يىئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .toLowerCase()
    .trim()
}

const checkMatch = (targetText: any, term: string): boolean => {
  if (!targetText || !term) return false
  const str = toStr(targetText).toLowerCase().trim()
  const rawTerm = term.toLowerCase().trim()
  if (!rawTerm) return true
  if (str.includes(rawTerm)) return true
  const normStr = normalizeArabic(str)
  const normTerm = normalizeArabic(rawTerm)
  if (normStr.includes(normTerm)) return true
  return false
}

const matchesOption = (opt: Option | null | undefined, term: string): boolean => {
  if (!opt || !term) return false
  if (checkMatch(opt.label, term)) return true
  if (checkMatch(opt.value, term)) return true
  if (Array.isArray(opt.keywords)) {
    for (const kw of opt.keywords) {
      if (checkMatch(kw, term)) return true
    }
  }
  return false
}

export interface SelectableListProps {
  title: string
  type: string
  options?: Option[]
  selectedValue: string
  selectedOption?: Option | null
  direction: string
  onSelect: (type: any, value: string, option?: Option) => void
  required?: boolean
  pendingProposalName?: string | null
  onClearProposal?: () => void
  onProposeClick?: (currentSearch: string) => void
  proposeCtaLabel?: string
  emptyDescription?: string
  fetchOptions?: (params: {
    searchTerm?: string
    page: number
    pageSize?: number
  }) => Promise<{
    options: Option[]
    hasMore: boolean
    total?: number
  }>
  dependencyKey?: any
}

const SelectableList: React.FC<SelectableListProps> = ({
  title,
  type,
  options = [],
  selectedValue,
  selectedOption: propSelectedOption,
  direction,
  onSelect,
  required = true,
  pendingProposalName,
  onClearProposal,
  onProposeClick,
  proposeCtaLabel,
  emptyDescription,
  fetchOptions,
  dependencyKey,
}) => {
  // State for search input
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 250)

  // Ensure direction is always a valid value for components that expect "rtl" | "ltr"
  const safeDirection = direction === "rtl" || direction === "ltr" ? direction : "ltr"
  const isRTL = safeDirection === "rtl"

  const isServerMode = Boolean(fetchOptions)

  // Server-side pagination states
  const [serverOptions, setServerOptions] = useState<Option[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const activeRequestIdRef = useRef(0)

  // Cache the last known selected option so it never disappears while options are loading or updating
  const [lastKnownSelectedOption, setLastKnownSelectedOption] = useState<Option | null>(
    propSelectedOption
      ? {
          ...propSelectedOption,
          value: toStr(propSelectedOption.value),
          label: toStr(propSelectedOption.label),
        }
      : null
  )

  useEffect(() => {
    if (!selectedValue) {
      setLastKnownSelectedOption(null)
      return
    }
    if (propSelectedOption && toStr(propSelectedOption.label).trim()) {
      const pVal = toStr(propSelectedOption.value)
      const pLab = toStr(propSelectedOption.label)
      setLastKnownSelectedOption((prev) => {
        if (prev && toStr(prev.value) === pVal && toStr(prev.label) === pLab) return prev
        return {
          ...propSelectedOption,
          value: pVal,
          label: pLab,
        }
      })
    } else {
      setLastKnownSelectedOption((prev) => {
        if (prev && toStr(prev.value) !== toStr(selectedValue)) {
          return null
        }
        return prev
      })
    }
  }, [propSelectedOption, selectedValue])

  const prevDepKeyRef = useRef(dependencyKey)
  useEffect(() => {
    if (prevDepKeyRef.current !== undefined && prevDepKeyRef.current !== dependencyKey) {
      prevDepKeyRef.current = dependencyKey
      setSearchTerm("")
    } else {
      prevDepKeyRef.current = dependencyKey
    }
  }, [dependencyKey])

  // Fetch initial/search page 1 when in server mode
  useEffect(() => {
    if (!fetchOptions) return

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
        console.error("Failed to fetch options for", title, err)
        setServerOptions([])
        setHasMore(false)
        setIsLoading(false)
      })
  }, [debouncedSearch, dependencyKey, fetchOptions, title])

  // Function to load subsequent pages
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
          const existingKeys = new Set(prev.map((i) => toStr(i.value)))
          const uniqueNew = newItems.filter((i) => !existingKeys.has(toStr(i.value)))
          return [...prev, ...uniqueNew]
        })
        setPage(nextPage)
        setHasMore(Boolean(res?.hasMore))
        setIsLoadingMore(false)
      })
      .catch((err) => {
        if (currentReqId !== activeRequestIdRef.current) return
        console.error("Failed to load more options for", title, err)
        setIsLoadingMore(false)
      })
  }, [fetchOptions, hasMore, isLoading, isLoadingMore, page, debouncedSearch, title])

  // Attach IntersectionObserver to the bottom sentinel for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || isLoading || isLoadingMore || !fetchOptions) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: "120px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, isLoadingMore, loadMore, fetchOptions])

  // Determine base list of options (server list if server mode, else client options)
  const baseOptions = useMemo(() => {
    if (isServerMode) {
      return serverOptions
    }
    return options
  }, [isServerMode, serverOptions, options])

  const isPureDigits = useCallback((str: string) => /^\d+$/.test(str.trim()), [])

  // Selected option if present (matching by value, or by label as fallback)
  const selectedOption = useMemo(() => {
    if (!selectedValue && selectedValue !== "0") return null
    const target = toStr(selectedValue).trim().toLowerCase()
    if (!target) return null

    // 0. If selectedOption prop is directly provided and has a valid label
    if (propSelectedOption) {
      const pVal = toStr(propSelectedOption.value).trim().toLowerCase()
      const pLabel = toStr(propSelectedOption.label).trim()
      if (pVal === target || (pLabel && pLabel.toLowerCase() === target)) {
        return {
          ...propSelectedOption,
          value: toStr(propSelectedOption.value),
          label: pLabel || toStr(propSelectedOption.value),
        }
      }
    }

    // 1. Search in current base options
    const foundInBase = baseOptions.find((opt) => {
      const valStr = toStr(opt.value).trim().toLowerCase()
      const labelStr = toStr(opt.label).trim().toLowerCase()
      return valStr === target || (labelStr && labelStr === target)
    })
    if (foundInBase && toStr(foundInBase.label)) {
      return {
        ...foundInBase,
        value: toStr(foundInBase.value),
        label: toStr(foundInBase.label),
      }
    }

    // 2. Search in initial options if different
    if (options && options.length > 0) {
      const foundInProps = options.find((opt) => {
        const valStr = toStr(opt.value).trim().toLowerCase()
        const labelStr = toStr(opt.label).trim().toLowerCase()
        return valStr === target || (labelStr && labelStr === target)
      })
      if (foundInProps && toStr(foundInProps.label)) {
        return {
          ...foundInProps,
          value: toStr(foundInProps.value),
          label: toStr(foundInProps.label),
        }
      }
    }

    // 3. Fallback to cached last known option if it has a real name
    if (lastKnownSelectedOption) {
      const cachedValStr = toStr(lastKnownSelectedOption.value).trim().toLowerCase()
      const cachedLabelStr = toStr(lastKnownSelectedOption.label).trim()
      if (
        (cachedValStr === target || (cachedLabelStr && cachedLabelStr.toLowerCase() === target)) &&
        cachedLabelStr
      ) {
        return lastKnownSelectedOption
      }
    }

    // 4. If propSelectedOption was provided and has a label
    if (propSelectedOption && toStr(propSelectedOption.label).trim()) {
      return {
        ...propSelectedOption,
        value: toStr(propSelectedOption.value),
        label: toStr(propSelectedOption.label),
      }
    }

    // 5. If selectedValue is a textual name (not purely numeric ID)
    const valStr = toStr(selectedValue).trim()
    if (valStr) {
      if (lastKnownSelectedOption && toStr(lastKnownSelectedOption.value) === valStr && toStr(lastKnownSelectedOption.label).trim()) {
        return lastKnownSelectedOption
      }
      if (!isPureDigits(valStr)) {
        return { value: valStr, label: valStr }
      }
      return { value: valStr, label: "" }
    }

    return null
  }, [baseOptions, options, selectedValue, lastKnownSelectedOption, propSelectedOption, isPureDigits])

  useEffect(() => {
    if (
      selectedOption &&
      toStr(selectedOption.label).trim() &&
      (!lastKnownSelectedOption ||
        toStr(lastKnownSelectedOption.value) !== toStr(selectedOption.value) ||
        toStr(lastKnownSelectedOption.label) !== toStr(selectedOption.label))
    ) {
      setLastKnownSelectedOption(selectedOption)
    }
  }, [selectedOption, lastKnownSelectedOption])

  // If selectedValue exists and label is still missing or empty, fetch it directly
  useEffect(() => {
    if (!fetchOptions || !selectedValue) return
    const sVal = toStr(selectedValue).trim()
    if (!sVal) return

    const hasValidLabel =
      selectedOption &&
      toStr(selectedOption.label).trim().length > 0

    if (!hasValidLabel) {
      fetchOptions({
        searchTerm: sVal,
        page: 1,
        pageSize: 10,
      })
        .then((res) => {
          if (res?.options && res.options.length > 0) {
            const match =
              res.options.find(
                (o) =>
                  toStr(o.value) === sVal ||
                  toStr(o.label).toLowerCase() === sVal.toLowerCase()
              ) || res.options[0]
            if (
              match &&
              toStr(match.label).trim()
            ) {
              setLastKnownSelectedOption({
                ...match,
                value: toStr(match.value),
                label: toStr(match.label),
              })
            }
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch label for selected item ID:", sVal, err)
        })
    }
  }, [selectedValue, fetchOptions, selectedOption])

  // Check if selected option should be visibly pinned (always stays on top when selected)
  const isPinnedVisible = useMemo(() => {
    if (!selectedOption) return false
    return Boolean(toStr(selectedOption.value).trim() || toStr(selectedOption.label).trim())
  }, [selectedOption])

  // Compute other options (excluding selectedOption to avoid duplicate in scroll area)
  const { scrollableOptions, hasSearchMatches } = useMemo(() => {
    const sTerm = searchTerm.trim()
    const selVal = selectedOption ? toStr(selectedOption.value) : null

    // Filter out selected option from the scrollable list so it only lives in the pinned section
    const unselectedBase = baseOptions.filter((opt) => toStr(opt.value) !== selVal)

    if (isServerMode) {
      const hasMatches = unselectedBase.length > 0
      return {
        scrollableOptions: unselectedBase,
        hasSearchMatches: Boolean(hasMatches),
      }
    }

    // Client mode
    if (!sTerm) {
      return {
        scrollableOptions: unselectedBase,
        hasSearchMatches: true,
      }
    }

    const matches = unselectedBase.filter((option) => matchesOption(option, sTerm))
    const hasMatches = matches.length > 0

    return {
      scrollableOptions: matches,
      hasSearchMatches: Boolean(hasMatches),
    }
  }, [isServerMode, baseOptions, searchTerm, selectedOption])

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("")
  }

  // Handle option click
  const handleSelectOption = (option: Option) => {
    const optVal = toStr(option.value)
    const optLabel = toStr(option.label)

    setLastKnownSelectedOption({
      ...option,
      value: optVal,
      label: optLabel,
    })
    onSelect(type, optVal, option)
  }

  // Placeholder text based on direction
  const searchPlaceholder =
    safeDirection === "ltr" ? `Search ${title.toLowerCase()}...` : `بحث ${title}...`

  // Check if options have logos (dynamic for any reference group / listing type)
  const shouldShowLogo = useMemo(() => {
    return (
      (selectedOption && Boolean(selectedOption.logoUrl)) ||
      scrollableOptions.some((opt) => Boolean(opt.logoUrl))
    )
  }, [selectedOption, scrollableOptions])
  const hasActiveProposal = !!pendingProposalName && (!selectedValue || selectedValue === "")

  return (
    <Box className="min-w-[280px] px-6 py-6" variant="column">
      {/* Enhanced Header */}
      <Box variant="row" className="flex items-center justify-between pb-4 mb-2">
        <div className="flex items-center">
          <Text className="text-[#1a2b28] dark:text-white font-bold text-2xl tracking-tight">
            {title}
          </Text>
          {required && <Text className="text-red-500 ml-2 rtl:ml-0 rtl:mr-2 text-xl">*</Text>}
        </div>
        {hasActiveProposal ? (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {isRTL ? "قيد المراجعة" : "Pending"}
            </span>
          </div>
        ) : required && !selectedValue ? (
          <div className="ml-auto rtl:ml-0 rtl:mr-auto">
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
              className={`absolute ${
                safeDirection === "rtl" ? "right-4" : "left-4"
              } top-1/2 transform -translate-y-1/2`}
            >
              {isLoading && scrollableOptions.length === 0 && !selectedOption ? (
                <Loader2 size={18} className="text-[#198341] animate-spin" />
              ) : (
                <Search size={18} className="text-[#198341]" />
              )}
            </div>

            {/* Clear Button */}
            {searchTerm && (
              <div
                className={`absolute ${
                  safeDirection === "rtl" ? "left-4" : "right-4"
                } top-1/2 transform -translate-y-1/2`}
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

        {/* Pinned Selected Option (Always stays on top when scrolling) */}
        {isPinnedVisible && selectedOption && (
          <div className="p-2 pb-1 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 shrink-0">
            <Button
              type="button"
              onClick={() => handleSelectOption(selectedOption)}
              className={`w-full py-4 px-4 text-white font-medium text-left
                bg-gradient-to-r from-[#198341] to-[#2C3C39] shadow-lg scale-[1.02] border border-[#198341]
                hover:shadow-xl transition-all duration-300 rounded-xl group
                ${shouldShowLogo ? "flex items-center justify-between" : ""}`}
            >
              <div
                className={`flex items-center ${
                  shouldShowLogo ? "flex-1" : "w-full"
                } ${safeDirection === "ltr" ? "text-left" : "text-right"}`}
              >
                {/* Logo for car makes */}
                {shouldShowLogo && selectedOption.logoUrl && (
                  <div className="flex-shrink-0 mr-3 rtl:mr-0 rtl:ml-3">
                    <div className="w-8 h-8 rounded-lg p-1 bg-white/20 shadow-sm">
                      <Image
                        alt={`${toStr(selectedOption.label)} logo`}
                        src={selectedOption.logoUrl}
                        width={32}
                        height={32}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    </div>
                  </div>
                )}

                <span className="flex-1 truncate">
                  {toStr(selectedOption.label) ||
                    (toStr(lastKnownSelectedOption?.value) === toStr(selectedOption.value) && lastKnownSelectedOption?.label
                      ? toStr(lastKnownSelectedOption.label)
                      : "") ||
                    toStr(selectedOption.value)}
                </span>

                {/* Selected badge */}
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium shrink-0 mx-2">
                  {isRTL ? "المحدد" : "Selected"}
                </span>
              </div>

              {/* Check indicator */}
              <Check
                size={16}
                className="ml-2 rtl:ml-0 rtl:mr-2 text-white shrink-0"
              />
            </Button>

            {/* Divider below pinned selected item */}
            {(scrollableOptions.length > 0 || isLoading) && (
              <div className="flex items-center gap-2 mt-2 px-1">
                <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium select-none">
                  {searchTerm.trim()
                    ? isRTL
                      ? "نتائج البحث"
                      : "Search results"
                    : isRTL
                    ? "خيارات أخرى"
                    : "All options"}
                </span>
                <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
              </div>
            )}
          </div>
        )}

        {/* Enhanced Scrollable Options List */}
        <ScrollArea
          className={`${
            isPinnedVisible && selectedOption ? "h-[210px]" : "h-[280px]"
          } w-full scrollbar-thin scrollbar-thumb-[#198341]/60 scrollbar-track-gray-100 dark:scrollbar-track-zinc-800 scrollbar-thumb-rounded-full scrollbar-track-rounded-full overscroll-contain`}
          dir={safeDirection}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Box variant="column" className="w-full p-2">
            {isLoading && scrollableOptions.length === 0 && !selectedOption ? (
              /* Loading Skeletons on initial load / full search */
              <div className="space-y-2 p-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-full h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 animate-pulse flex items-center px-4 gap-3"
                  >
                    {shouldShowLogo && (
                      <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-zinc-700 shrink-0" />
                    )}
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-md flex-1" />
                  </div>
                ))}
              </div>
            ) : scrollableOptions && scrollableOptions.length > 0 ? (
              <>
                {scrollableOptions.map((option, index) => {
                  const optVal = toStr(option.value)
                  const optLabel = toStr(option.label)

                  return (
                    <React.Fragment key={`${optVal}_${index}`}>
                      <Button
                        type="button"
                        onClick={() => handleSelectOption(option)}
                        className={`w-full py-4 px-4 mb-1 text-[#2C3C39] dark:text-zinc-200 bg-white dark:bg-zinc-900 font-medium text-left
                          hover:bg-gradient-to-r hover:from-[#ABDE3B]/10 hover:to-[#198341]/5 dark:hover:from-[#ABDE3B]/20 dark:hover:to-[#198341]/10
                          hover:text-[#1a2b28] dark:hover:text-white hover:shadow-md hover:scale-[1.02]
                          transition-all duration-300 rounded-xl border border-transparent
                          hover:border-[#198341]/20 dark:hover:border-[#198341]/40 group hover:border-gray-200 dark:hover:border-zinc-800
                          ${shouldShowLogo ? "flex items-center justify-between" : ""}`}
                      >
                        <div
                          className={`flex items-center ${
                            shouldShowLogo ? "flex-1" : "w-full"
                          } ${safeDirection === "ltr" ? "text-left" : "text-right"}`}
                        >
                          {/* Logo for car makes */}
                          {shouldShowLogo && option.logoUrl && (
                            <div className="flex-shrink-0 mr-3 rtl:mr-0 rtl:ml-3">
                              <div className="w-8 h-8 rounded-lg p-1 shadow-sm transition-all duration-300 bg-gray-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-750 group-hover:shadow-md">
                                <Image
                                  alt={`${optLabel} logo`}
                                  src={option.logoUrl}
                                  width={32}
                                  height={32}
                                  className="object-contain w-full h-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = "none"
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <span className="flex-1 truncate">
                            {optLabel || optVal}
                          </span>
                        </div>

                        {/* Arrow indicator */}
                        <ChevronRight
                          size={16}
                          className="ml-2 rtl:ml-0 rtl:mr-2 text-gray-400 group-hover:text-[#198341] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-300 shrink-0"
                        />
                      </Button>
                    </React.Fragment>
                  )
                })}

                {/* Loading More Spinner at list bottom */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#198341] font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جاري تحميل المزيد..." : "Loading more..."}</span>
                  </div>
                )}

                {/* Bottom Sentinel for Infinite Scroll */}
                {isServerMode && hasMore && (
                  <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
                )}

                {/* When user searched and no other items matched */}
                {searchTerm.trim() && !hasSearchMatches && (
                  <div className="flex flex-col items-center justify-center py-6 px-3 text-center border-t border-dashed border-gray-200 dark:border-zinc-800 mt-2">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                      <Search size={16} className="text-gray-400 dark:text-zinc-500" />
                    </div>
                    <Text className="text-gray-600 dark:text-zinc-300 text-xs font-semibold mb-1">
                      {isRTL ? "لا توجد خيارات مطابقة أخرى" : "No other matching options found"}
                    </Text>
                    {emptyDescription && (
                      <Text className="text-gray-400 dark:text-zinc-500 text-[11px] max-w-[200px] leading-relaxed mb-2">
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
                        <span>
                          {proposeCtaLabel || (isRTL ? "اقترح قيمة جديدة" : "Suggest new value")}
                        </span>
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                  <Search size={20} className="text-gray-400 dark:text-zinc-500" />
                </div>
                <Text className="text-gray-600 dark:text-zinc-300 text-xs font-semibold mb-1">
                  {searchTerm
                    ? isRTL
                      ? "لا توجد خيارات مطابقة"
                      : "No matching options found"
                    : isRTL
                    ? "لا توجد خيارات متاحة"
                    : "No options available"}
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
                    <span>
                      {proposeCtaLabel || (isRTL ? "اقترح قيمة جديدة" : "Suggest new value")}
                    </span>
                  </Button>
                )}
              </div>
            )}

            {/* List footer propose CTA when options exist and not already showing the no-matches propose block */}
            {scrollableOptions &&
              scrollableOptions.length > 0 &&
              onProposeClick &&
              !(!hasSearchMatches && searchTerm.trim()) && (
                <div className="pt-2 mt-1 border-t border-slate-100 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onProposeClick(searchTerm)}
                    className="w-full justify-center text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl h-8 gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>
                      {proposeCtaLabel ||
                        (isRTL ? "لم تجد طلبك؟ اقترحه" : "Can't find it? Suggest it")}
                    </span>
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