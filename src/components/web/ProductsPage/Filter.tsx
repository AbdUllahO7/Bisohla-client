"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { Search, ListRestart } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"

// UI Components
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import SelectDropdown from "@/components/SelectDropdown"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Hooks and Data
import { useProductStepOne } from "./addProducts/StepOne/hooks"
import { useAddProductStepTwo } from "./addProducts/stepTow/hooks"
import { getPriceRanges, getMileageRanges } from "@/constants/filterData"
import { getCurrencyOptions } from "@/core/entities/enums/currency.enum"

// Types for filtering
import type { QueryParams, FilterGroup } from "@/core/entities/api/api"
import type { Filter } from "@/core/entities/api/api"

// Define simple interface for filter state
interface FilterState {
  governorate?: string
  city?: string
  marka?: string
  model?: string
  trim?: string
  minYear?: string
  maxYear?: string
  transmission?: string
  fuelType?: string
  bodyType?: string
  minMileage?: string
  maxMileage?: string
  [key: string]: string | undefined
}

// Types for components
interface FilterOptionDropdownProps {
  title?: string
  options: { value: string; label: string; logoUrl?: string }[]
  placeholder: string
  onChange?: (name: string, value: string) => void
  name?: string
  value?: string
  disabled?: boolean
}

interface CarBrandCheckboxItemProps {
  id: string
  logoUrl?: string
  label: string
  checked?: boolean
  onChange?: () => void
}

// Props interface for the Filter component
interface FilterProps {
  onChange?: (params: QueryParams) => void
}

// Components
const FilterOptionDropdown = ({
  title,
  options,
  placeholder,
  onChange,
  value,
  name,
  disabled = false,
}: FilterOptionDropdownProps) => {
  return (
    <div className="mb-3 w-full">
      {title && <Label className="text-sm font-medium text-slate-700 mb-1.5">{title}</Label>}
      <SelectDropdown
        options={options}
        placeholder={placeholder}
        SelectTriggerStyle={`border border-[#EFEFEF] rounded-lg p-2.5 shadow-sm ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white relatable hover:bg-slate-50"} transition-colors w-full text-slate-800`}
        className="w-full"
        onChange={onChange}
        value={value || ""}
        name={name || ""}
        disabled={disabled}
      />
    </div>
  )
}

const CarBrandCheckboxItem = ({ id, logoUrl, label, checked = false, onChange }: CarBrandCheckboxItemProps) => {
  const locale = useLocale()
  const isRTL = locale === "ar"

  return (
    <div className="flex items-center p-2 my-1 rounded-md hover:bg-slate-50 transition-colors">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <Label
        htmlFor={id}
        className={`text-sm text-slate-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isRTL ? "pr-2 mr-auto" : "pl-2"} flex items-center cursor-pointer w-full`}
      >
        {logoUrl && (
          <Image
            src={logoUrl || "/placeholder.svg"}
            alt={label}
            width={24}
            height={24}
            className={isRTL ? "ml-2" : "mr-2"}
          />
        )}
        {label}
      </Label>
    </div>
  )
}

interface AccordionHeaderProps {
  title: string
}

const AccordionHeader = ({ title }: AccordionHeaderProps) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-slate-800 font-bold">{title}</span>
  </div>
)

// Main Component
const ProductsFilter: React.FC<FilterProps> = ({ onChange }) => {
  const locale = useLocale()
  const isRTL = locale === "ar"
  const t = useTranslations("productsPage")
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(80)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [minMileage, setMinMileage] = useState<string>("")
  const [maxMileage, setMaxMileage] = useState<string>("")
  const [minYear, setMinYear] = useState<string>("")
  const [maxYear, setMaxYear] = useState<string>("")
  const [currency, setCurrency] = useState<string>("")
  const [filterState, setFilterState] = useState<FilterState>({})
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [carMarkaAccordionValue, setCarMarkaAccordionValue] = useState<string>("car-marka")
  const priceRanges = getPriceRanges
  const mileageRanges = getMileageRanges
  const hasInitialized = useRef(false)

  useEffect(() => {
    const header = document.querySelector(".mt-\\[50px\\]")
    if (header) {
      const headerRect = header.getBoundingClientRect()
      setHeaderHeight(headerRect.height + headerRect.top)
    }
  }, [])

  const handleValidationChangeStepOne = (isValid: boolean) => {}
  const handleValidationChangeStepTwo = (isValid: boolean) => {}

  const {
    selectedOptions,
    governorateOptions,
    cityOptions,
    carMarka,
    carModel,
    carTrim,
    madeYear,
    handleSelectChange: handleStepOneSelectChange,
    titles: stepOneTitles,
  } = useProductStepOne(handleValidationChangeStepOne)

  const {
    carInfo,
    options: stepTwoOptions,
    labels: stepTwoLabels,
    handleSelectChange: handleStepTwoSelectChange,
  } = useAddProductStepTwo(handleValidationChangeStepTwo)

  const currencyOptions = getCurrencyOptions(t)

  useEffect(() => {
    if (hasInitialized.current || !searchParams || Array.from(searchParams.entries()).length === 0) {
      return
    }

    const make = searchParams.get("make")
    const model = searchParams.get("model")
    const trim = searchParams.get("trim")
    const minYear = searchParams.get("minYear")
    const maxYear = searchParams.get("maxYear")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const minMileage = searchParams.get("minMileage")
    const maxMileage = searchParams.get("maxMileage")
    const currency = searchParams.get("currency")
    const governorate = searchParams.get("governorate")
    const city = searchParams.get("city")
    const transmission = searchParams.get("transmission")
    const fuelType = searchParams.get("fuelType")
    const bodyType = searchParams.get("bodyType")
    const search = searchParams.get("search")

    const initialState: FilterState = {}
    if (make) initialState.marka = make
    if (model) initialState.model = model
    if (trim) initialState.trim = trim
    if (governorate) initialState.governorate = governorate
    if (city) initialState.city = city
    if (transmission) initialState.transmission = transmission
    if (fuelType) initialState.fuelType = fuelType
    if (bodyType) initialState.bodyType = bodyType
    if (minMileage) initialState.minMileage = minMileage
    if (maxMileage) initialState.maxMileage = maxMileage

    setFilterState((prev) => ({ ...prev, ...initialState }))
    if (minPrice) setMinPrice(minPrice)
    if (maxPrice) setMaxPrice(maxPrice)
    if (minMileage) setMinMileage(minMileage)
    if (maxMileage) setMaxMileage(maxMileage)
    if (minYear) setMinYear(minYear)
    if (maxYear) setMaxYear(maxYear)
    if (currency) setCurrency(currency)
    if (search) setSearchText(search)
    if (make) setSelectedBrands([make])

    handleStepOneSelectChange("governorate", initialState.governorate || "")
    handleStepOneSelectChange("city", initialState.city || "")
    handleStepOneSelectChange("marka", initialState.marka || "")
    handleStepOneSelectChange("model", initialState.model || "")
    handleStepOneSelectChange("trim", initialState.trim || "")
    handleStepTwoSelectChange("transmission", initialState.transmission || "")
    handleStepTwoSelectChange("fuelType", initialState.fuelType || "")
    handleStepTwoSelectChange("bodyType", initialState.bodyType || "")
    handleStepTwoSelectChange("currency", currency || "")

    hasInitialized.current = true
  }, [searchParams, handleStepOneSelectChange, handleStepTwoSelectChange])

  const scrollHeight = `calc(100vh - ${headerHeight + 170}px)`

  const handleBrandCheckboxChange = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      const newSelectedBrands = selectedBrands.filter((id) => id !== brandId)
      setSelectedBrands(newSelectedBrands)
      if (filterState.marka === brandId) {
        const newFilterState = { ...filterState }
        delete newFilterState.marka
        delete newFilterState.model
        delete newFilterState.trim
        setFilterState(newFilterState)
        handleStepOneSelectChange("marka", "")
        handleStepOneSelectChange("model", "")
        handleStepOneSelectChange("trim", "")
      }
    } else {
      setSelectedBrands([brandId])
      const newFilterState = {
        ...filterState,
        marka: brandId,
        model: "",
        trim: "",
      }
      setFilterState(newFilterState)
      handleStepOneSelectChange("marka", brandId)
      handleStepOneSelectChange("model", "")
      handleStepOneSelectChange("trim", "")
    }
    setCarMarkaAccordionValue("")
  }

  const handleFilterChange = (name: string, value: string) => {
    const newFilterState = { ...filterState, [name]: value }
    if (name === "governorate") {
      newFilterState.city = ""
      handleStepOneSelectChange("city", "")
    }
    if (name === "model") {
      newFilterState.trim = ""
      handleStepOneSelectChange("trim", "")
    }
    setFilterState(newFilterState)
    handleStepOneSelectChange(name, value)
  }

  const handleYearChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinYear(value)
      setFilterState((prev) => ({ ...prev, minYear: value }))
    } else {
      setMaxYear(value)
      setFilterState((prev) => ({ ...prev, maxYear: value }))
    }
  }

  const handlePriceChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinPrice(value)
    } else {
      setMaxPrice(value)
    }
  }

  const handleMileageChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinMileage(value)
      setFilterState((prev) => ({ ...prev, minMileage: value }))
    } else {
      setMaxMileage(value)
      setFilterState((prev) => ({ ...prev, maxMileage: value }))
    }
  }

  const handleCurrencyChange = (name: string, value: string) => {
    setCurrency(value)
    handleStepTwoSelectChange(name, value)
  }

  const handleTransmissionChange = (name: string, value: string) => {
    const newFilterState = { ...filterState, [name]: value }
    setFilterState(newFilterState)
    handleStepTwoSelectChange(name, value)
  }

  const buildFilterQuery = (): QueryParams => {
    const filterGroups: FilterGroup[] = []

    // Car details filter group
    const carDetailsFilters: Filter[] = []
    if (filterState.marka) {
      carDetailsFilters.push({
        field: "makeId",
        operator: "eq",
        value: filterState.marka,
      })
    }
    if (filterState.model) {
      carDetailsFilters.push({
        field: "modelId",
        operator: "eq",
        value: filterState.model,
      })
    }
    if (filterState.trim) {
      carDetailsFilters.push({
        field: "trimId",
        operator: "eq",
        value: filterState.trim,
      })
    }
    if (carDetailsFilters.length > 0) {
      filterGroups.push({
        operator: "and",
        filters: carDetailsFilters,
      })
    }

    // Location filter group
    const locationFilters: Filter[] = []
    if (filterState.governorate) {
      locationFilters.push({
        field: "governorate",
        operator: "eq",
        value: filterState.governorate,
      })
    }
    if (filterState.city) {
      locationFilters.push({
        field: "city",
        operator: "eq",
        value: filterState.city,
      })
    }
    if (locationFilters.length > 0) {
      filterGroups.push({
        operator: "and",
        filters: locationFilters,
      })
    }

    // Technical details filter group
    const technicalDetailsFilters: Filter[] = []
    if (minYear) {
      technicalDetailsFilters.push({
        field: "details.year",
        operator: "gte",
        value: Number.parseInt(minYear, 10),
      })
    }
    if (maxYear) {
      technicalDetailsFilters.push({
        field: "details.year",
        operator: "lte",
        value: Number.parseInt(maxYear, 10),
      })
    }
    if (filterState.transmission) {
      technicalDetailsFilters.push({
        field: "details.transmission",
        operator: "eq",
        value: filterState.transmission,
      })
    }
    if (filterState.fuelType) {
      technicalDetailsFilters.push({
        field: "details.fuelType",
        operator: "eq",
        value: filterState.fuelType,
      })
    }
    if (filterState.bodyType) {
      technicalDetailsFilters.push({
        field: "details.bodyType",
        operator: "eq",
        value: filterState.bodyType,
      })
    }
    if (minMileage) {
      technicalDetailsFilters.push({
        field: "details.mileage",
        operator: "gte",
        value: Number.parseInt(minMileage, 10),
      })
    }
    if (maxMileage) {
      technicalDetailsFilters.push({
        field: "details.mileage",
        operator: "lte",
        value: Number.parseInt(maxMileage, 10),
      })
    }
    if (technicalDetailsFilters.length > 0) {
      filterGroups.push({
        operator: "and",
        filters: technicalDetailsFilters,
      })
    }

    // Price filter group
    if (minPrice || maxPrice) {
      const priceFilters: Filter[] = []
      if (minPrice) {
        priceFilters.push({
          field: "price",
          operator: "gte",
          value: Number.parseInt(minPrice, 10),
        })
      }
      if (maxPrice) {
        priceFilters.push({
          field: "price",
          operator: "lte",
          value: Number.parseInt(maxPrice, 10),
        })
      }
      if (priceFilters.length > 0) {
        filterGroups.push({
          operator: "and",
          filters: priceFilters,
        })
      }
    }

    // Currency filter group
    if (currency) {
      const currencyFilters: Filter[] = [
        {
          field: "currency",
          operator: "eq",
          value: currency,
        },
      ]
      filterGroups.push({
        operator: "and",
        filters: currencyFilters,
      })
    }

    return {
      page: 1,
      pageSize: 8,
      sortBy: "createdAt",
      sortDirection: "desc",
      searchTerm: searchText || undefined,
      filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
    }
  }

  const applyFilters = () => {
    const queryParams = buildFilterQuery()
    const params = new URLSearchParams()
    if (filterState.marka) params.set("make", filterState.marka)
    if (filterState.model) params.set("model", filterState.model)
    if (filterState.trim) params.set("trim", filterState.trim)
    if (minYear) params.set("minYear", minYear)
    if (maxYear) params.set("maxYear", maxYear)
    if (filterState.governorate) params.set("governorate", filterState.governorate)
    if (filterState.city) params.set("city", filterState.city)
    if (filterState.transmission) params.set("transmission", filterState.transmission)
    if (filterState.fuelType) params.set("fuelType", filterState.fuelType)
    if (filterState.bodyType) params.set("bodyType", filterState.bodyType)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (minMileage) params.set("minMileage", minMileage)
    if (maxMileage) params.set("maxMileage", maxMileage)
    if (currency) params.set("currency", currency)
    if (searchText) params.set("search", searchText)

    router.push(`?${params.toString()}`);
    if (onChange) {
      onChange(queryParams);
    }
  }

  const resetFilters = () => {
    setFilterState({})
    setMinPrice("")
    setMaxPrice("")
    setMinMileage("")
    setMaxMileage("")
    setMinYear("")
    setMaxYear("")
    setCurrency("")
    setSearchText("")
    setSelectedBrands([])
    setCarMarkaAccordionValue("car-marka")

    handleStepOneSelectChange("governorate", "")
    handleStepOneSelectChange("city", "")
    handleStepOneSelectChange("marka", "")
    handleStepOneSelectChange("model", "")
    handleStepOneSelectChange("trim", "")
    handleStepTwoSelectChange("transmission", "")
    handleStepTwoSelectChange("fuelType", "")
    handleStepTwoSelectChange("bodyType", "")
    handleStepTwoSelectChange("currency", "")

    const defaultParams: QueryParams = {
      page: 1,
      pageSize: 8,
      sortBy: "createdAt",
      sortDirection: "desc",
    }

    if (onChange) {
      onChange(defaultParams)
    }

    router.push(window.location.pathname)
  }

  return (
    <div ref={filterRef} className="sticky top-[80px] transition-all min-h-[50vh]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full bg-white rounded-t-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filter Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-slate-800">{t("filter.title")}</h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4`}
            />
            <Input
              type="text"
              id="search"
              placeholder={t("filter.searchInput")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`border border-slate-200 bg-[#EFEFEF] ${isRTL ? "pr-9" : "pl-9"} h-10 rounded-xl focus-visible:ring-primary/30`}
            />
          </div>
        </div>

        {/* Filter Body */}
        <div className={`transition-all duration-300 ${isCollapsed ? "h-0 overflow-hidden" : ""}`}>
          <ScrollArea className="px-4" style={{ height: scrollHeight, minHeight: "70vh" }}>
            {/* Location Filter */}
            <Accordion type="single" collapsible defaultValue="address" className="my-2">
              <AccordionItem value="address" className="border-b border-[#EFEFEF] py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.address.filterOptionsTitle")} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={governorateOptions}
                    placeholder={stepOneTitles.governorate}
                    onChange={handleFilterChange}
                    value={filterState.governorate || selectedOptions.governorate}
                    name="governorate"
                  />
                  <FilterOptionDropdown
                    options={cityOptions}
                    placeholder={
                      !filterState.governorate && !selectedOptions.governorate
                        ? t("filter.filterOptions.address.selectGovernorateFirst") ||
                          "Please select a governorate first"
                        : stepOneTitles.city
                    }
                    onChange={handleFilterChange}
                    value={filterState.city || selectedOptions.city}
                    name="city"
                    disabled={!filterState.governorate && !selectedOptions.governorate}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Car Brand Filter */}
            <Accordion type="single" collapsible className="my-2" value={carMarkaAccordionValue} onValueChange={setCarMarkaAccordionValue}>
              <AccordionItem value="car-marka" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.productMarka.filterOptionsTitle")} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {carMarka.map((brand) => (
                      <CarBrandCheckboxItem
                        key={brand.value}
                        id={`brand-${brand.value}`}
                        logoUrl={brand.logoUrl || ""}
                        label={brand.label}
                        checked={selectedBrands.includes(brand.value)}
                        onChange={() => handleBrandCheckboxChange(brand.value)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Car Models */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="car-models" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.productModels.title")} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={carModel}
                    placeholder={
                      !filterState.marka && !selectedOptions.marka
                        ? t("filter.filterOptions.productModels.selectMarkaFirst") || "Please select a brand first"
                        : stepOneTitles.model
                    }
                    onChange={handleFilterChange}
                    value={filterState.model || selectedOptions.model}
                    name="model"
                    disabled={!filterState.marka && !selectedOptions.marka}
                  />
                  <FilterOptionDropdown
                    options={carTrim}
                    placeholder={
                      !filterState.model && !selectedOptions.model
                        ? t("filter.filterOptions.productModels.selectModelFirst") || "Please select a model first"
                        : stepOneTitles.trim
                    }
                    onChange={handleFilterChange}
                    value={filterState.trim || selectedOptions.trim}
                    name="trim"
                    disabled={!filterState.model && !selectedOptions.model}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Car Year Range */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="car-year" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={stepOneTitles.year} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FilterOptionDropdown
                      options={madeYear}
                      placeholder={t("filter.filterOptions.productModels.minYear", { defaultValue: "Min Year" })}
                      onChange={(name, value) => handleYearChange("min", value)}
                      value={minYear}
                      name="minYear"
                    />
                    <FilterOptionDropdown
                      options={madeYear}
                      placeholder={t("filter.filterOptions.productModels.maxYear", { defaultValue: "Max Year" })}
                      onChange={(name, value) => handleYearChange("max", value)}
                      value={maxYear}
                      name="maxYear"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Price Range */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="price-range" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.productPrice.title")} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FilterOptionDropdown
                      options={priceRanges}
                      placeholder={t("filter.filterOptions.productPrice.lessPrice")}
                      onChange={(name, value) => handlePriceChange("min", value)}
                      value={minPrice}
                      name="minPrice"
                    />
                    <FilterOptionDropdown
                      options={priceRanges}
                      placeholder={t("filter.filterOptions.productPrice.highestPrice")}
                      onChange={(name, value) => handlePriceChange("max", value)}
                      value={maxPrice}
                      name="maxPrice"
                    />
                  </div>
                  <FilterOptionDropdown
                    options={currencyOptions}
                    placeholder={t("filter.filterOptions.currency.title")}
                    onChange={handleCurrencyChange}
                    value={currency || carInfo.currency}
                    name="currency"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Mileage Range */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="mileage-range" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.mileage.title", { defaultValue: "Mileage Range" })} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FilterOptionDropdown
                      options={mileageRanges}
                      placeholder={t("filter.filterOptions.mileage.minMileage", { defaultValue: "Min Mileage" })}
                      onChange={(name, value) => handleMileageChange("min", value)}
                      value={minMileage}
                      name="minMileage"
                    />
                    <FilterOptionDropdown
                      options={mileageRanges}
                      placeholder={t("filter.filterOptions.mileage.maxMileage", { defaultValue: "Max Mileage" })}
                      onChange={(name, value) => handleMileageChange("max", value)}
                      value={maxMileage}
                      name="maxMileage"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Control Type */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="control-type" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.ControlType.title")} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={stepTwoOptions.transmission}
                    placeholder={stepTwoLabels.selectTransmission}
                    onChange={handleTransmissionChange}
                    value={filterState.transmission || carInfo.transmission}
                    name="transmission"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Fuel Type */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="fuel-type" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.FuelType.title")} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={stepTwoOptions.fuelType}
                    placeholder={stepTwoLabels.selectFuelType}
                    onChange={handleTransmissionChange}
                    value={filterState.fuelType || carInfo.fuelType}
                    name="fuelType"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Body Type */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="body-type" className="border-b border-slate-100 py-1" dir={isRTL ? "rtl" : "ltr"}>
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={stepTwoLabels.bodyType} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={stepTwoOptions.bodyType}
                    placeholder={stepTwoLabels.selectBodyType}
                    onChange={handleTransmissionChange}
                    value={filterState.bodyType || carInfo.bodyType}
                    name="bodyType"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 rounded-b-lg shadow-lg bg-white mt-5 rounded-md">
        <div className="flex flex-col items-center space-y-3">
          <Button
            className="rounded-lg bg-primary-foreground text-black font-bold transition-colors h-10 w-full"
            onClick={applyFilters}
          >
            {t("filter.filterOptions.search")}
          </Button>
          <Button
            variant="outline"
            className="bg-white shadow-none hover:bg-transparent hover:text-black text-black border-none font-medium transition-colors rounded-lg h-10 w-full sm:w-2/3 md:w-1/2"
            onClick={resetFilters}
          >
            <ListRestart className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`} />
            {t("filter.filterOptions.resetSearch")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductsFilter