"use client"
import { useState, useEffect, useRef } from "react"
import { Search, ChevronDown, Sliders, SearchCheck, ListRestart } from "lucide-react"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Hooks and Data
import { useProductStepOne } from "./addProducts/StepOne/hooks"
import { useAddProductStepTwo } from "./addProducts/stepTow/hooks"
import { getPriceRanges } from "@/constants/filterData"

// Types for filtering
import { QueryParams, FilterGroup } from "@/core/entities/api/api"
import type { Filter } from "@/core/entities/api/api"


// Define simple interface for filter state
interface FilterState {
  governorate?: string;
  city?: string;
  marka?: string;
  model?: string;
  trim?: string;
  minYear?: string;
  maxYear?: string;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
  [key: string]: string | undefined;
}

// Types for components
interface FilterOptionDropdownProps {
  title?: string;
  options: { value: string; label: string; logoUrl?: string; }[];
  placeholder: string;
  onChange?: (name: string, value: string) => void;
  name?: string;
  value?: string;
  disabled?: boolean;
}

interface CarBrandCheckboxItemProps {
  id: string;
  logoUrl?: string;
  label: string;
  checked?: boolean;
  onChange?: () => void;
}

// Props interface for the Filter component
interface FilterProps {
  onChange?: (params: QueryParams) => void;
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
        SelectTriggerStyle={`border rounded-lg p-2.5 shadow-sm ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50'} transition-colors w-full text-slate-800`}
        className="w-full"
        onChange={onChange}
        value={value || ""}
        name={name || ""}
        disabled={disabled}
      />
    </div>
  )
}

const CarBrandCheckboxItem = ({ id, logoUrl, label, checked = false, onChange }: CarBrandCheckboxItemProps) => (
  <div className="flex items-center p-2 my-1 rounded-md hover:bg-slate-50 transition-colors">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
    />
    <Label
      htmlFor={id}
      className="text-sm text-slate-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pl-2 flex items-center cursor-pointer w-full"
    >
      {logoUrl && (
        <Image src={logoUrl || "/placeholder.svg"} alt={label} width={24} height={24} className="mr-2" />
      )}
      {label}
    </Label>
  </div>
)

interface AccordionHeaderProps {
  title: string;
}

const AccordionHeader = ({ title }: AccordionHeaderProps) => (
  <div className="flex items-center justify-between w-full">
    <span className="font-medium text-slate-800">{title}</span>
  </div>
)

// Main Component
const Filter: React.FC<FilterProps> = ({ onChange }) => {
  const t = useTranslations("productsPage")
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(80)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [minYear, setMinYear] = useState<string>("")
  const [maxYear, setMaxYear] = useState<string>("")
  const [currency, setCurrency] = useState<string>("")
  const [filterState, setFilterState] = useState<FilterState>({})
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const priceRanges = getPriceRanges

  // Initialize filter from URL parameters
  useEffect(() => {
    if (searchParams) {
      const make = searchParams.get("make")
      const model = searchParams.get("model")
      const trim = searchParams.get("trim")
      const minYear = searchParams.get("minYear")
      const maxYear = searchParams.get("maxYear")
      const minPrice = searchParams.get("minPrice")
      const maxPrice = searchParams.get("maxPrice")
      const currency = searchParams.get("currency")
      const governorate = searchParams.get("governorate")
      const city = searchParams.get("city")
      const transmission = searchParams.get("transmission")
      const fuelType = searchParams.get("fuelType")
      const bodyType = searchParams.get("bodyType")
      const search = searchParams.get("search")

      // Set state based on URL parameters
      const initialState: FilterState = {}
      if (make) initialState.marka = make
      if (model) initialState.model = model
      if (trim) initialState.trim = trim
      if (minYear) initialState.minYear = minYear
      if (maxYear) initialState.maxYear = maxYear
      if (governorate) initialState.governorate = governorate
      if (city) initialState.city = city
      if (transmission) initialState.transmission = transmission
      if (fuelType) initialState.fuelType = fuelType
      if (bodyType) initialState.bodyType = bodyType
      
      setFilterState(initialState)
      if (minPrice) setMinPrice(minPrice)
      if (maxPrice) setMaxPrice(maxPrice)
      if (minYear) setMinYear(minYear)
      if (maxYear) setMaxYear(maxYear)
      if (currency) setCurrency(currency)
      if (search) setSearchText(search)
      
      // Initialize selected brands if marka is in URL
      if (make) {
        setSelectedBrands([make])
      } else {
        setSelectedBrands([])
      }
    }
  }, [searchParams])

  // Effect to measure header height once on mount
  useEffect(() => {
    const header = document.querySelector(".mt-\\[50px\\]")
    if (header) {
      const headerRect = header.getBoundingClientRect()
      setHeaderHeight(headerRect.height + headerRect.top)
    }
  }, [])

  // Validation handlers
  const handleValidationChangeStepOne = (isValid: boolean) => {}
  const handleValidationChangeStepTwo = (isValid: boolean) => {}

  // Hooks data
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

  // Calculate the available height for the scroll area
  const scrollHeight = `calc(100vh - ${headerHeight + 170}px)`
  
  // Handler for brand checkbox changes
  const handleBrandCheckboxChange = (brandId: string) => {
    // If already selected, remove it, otherwise add it
    if (selectedBrands.includes(brandId)) {
      const newSelectedBrands = selectedBrands.filter(id => id !== brandId);
      setSelectedBrands(newSelectedBrands);
      
      // If we're unselecting the current marka, reset model and trim
      if (filterState.marka === brandId) {
        const newFilterState = { ...filterState };
        delete newFilterState.marka;
        delete newFilterState.model;
        delete newFilterState.trim;
        
        setFilterState(newFilterState);
        handleStepOneSelectChange('marka', '');
        handleStepOneSelectChange('model', '');
        handleStepOneSelectChange('trim', '');
      }
    } else {
      // Single selection mode - clear previous selections
      setSelectedBrands([brandId]);
      
      // Update the filter state with the selected brand
      const newFilterState = { 
        ...filterState, 
        marka: brandId,
        // Reset dependent fields
        model: '',
        trim: '' 
      };
      
      setFilterState(newFilterState);
      handleStepOneSelectChange('marka', brandId);
      handleStepOneSelectChange('model', '');
      handleStepOneSelectChange('trim', '');
    }
  };
  
  // Custom handlers for filter changes
  const handleFilterChange = (name: string, value: string) => {
    const newFilterState = { ...filterState, [name]: value }
    
    // Special handling for governorate change: reset city
    if (name === 'governorate') {
      newFilterState.city = '';
      // Also reset in the hook state
      handleStepOneSelectChange('city', '');
    }
    
    // Special handling for model change: reset trim
    if (name === 'model') {
      newFilterState.trim = '';
      // Also reset in the hook state
      handleStepOneSelectChange('trim', '');
    }
    
    setFilterState(newFilterState)
    handleStepOneSelectChange(name, value)
  }
  
  // Handler for year range changes
  const handleYearChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinYear(value)
      setFilterState(prev => ({ ...prev, minYear: value }))
    } else {
      setMaxYear(value)
      setFilterState(prev => ({ ...prev, maxYear: value }))
    }
  }
  
  const handlePriceChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinPrice(value)
    } else {
      setMaxPrice(value)
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
  
// Improved buildFilterQuery function that fully leverages FilterGroups
// This version organizes filters into logical groups for better API compatibility

const buildFilterQuery = (): QueryParams => {
  const filterGroups: FilterGroup[] = []
  
  // Car details filter group (make, model, trim)
  const carDetailsFilters: Filter[] = []
  
  if (filterState.marka) {
    carDetailsFilters.push({
      field: "makeId", 
      operator: "eq",
      value: filterState.marka
    })
  }
  
  if (filterState.model) {
    carDetailsFilters.push({
      field: "modelId",
      operator: "eq",
      value: filterState.model
    })
  }
  
  if (filterState.trim) {
    carDetailsFilters.push({
      field: "trimId",
      operator: "eq",
      value: filterState.trim
    })
  }
  
  if (carDetailsFilters.length > 0) {
    filterGroups.push({
      operator: "and",
      filters: carDetailsFilters
    })
  }
  
  // Location filter group
  const locationFilters: Filter[] = []
  
  if (filterState.governorate) {
    locationFilters.push({
      field: "governorate",
      operator: "eq",
      value: filterState.governorate
    })
  }
  
  if (filterState.city) {
    locationFilters.push({
      field: "city",
      operator: "eq",
      value: filterState.city
    })
  }
  
  if (locationFilters.length > 0) {
    filterGroups.push({
      operator: "and",
      filters: locationFilters
    })
  }
  
  // Technical details filter group
  const technicalDetailsFilters: Filter[] = []
  
  // Year range filters
  if (minYear || maxYear) {
    if (minYear) {
      technicalDetailsFilters.push({
        field: "details.year",
        operator: "gte", 
        value: parseInt(minYear, 10)
      })
    }
    
    if (maxYear) {
      technicalDetailsFilters.push({
        field: "details.year",
        operator: "lte", 
        value: parseInt(maxYear, 10)
      })
    }
  }
  
  // Transmission filter
  if (filterState.transmission) {
    technicalDetailsFilters.push({
      field: "details.transmission",
      operator: "eq",
      value: filterState.transmission
    })
  }
  
  // Fuel type filter
  if (filterState.fuelType) {
    technicalDetailsFilters.push({
      field: "details.fuelType",
      operator: "eq",
      value: filterState.fuelType
    })
  }
  
  // Body type filter
  if (filterState.bodyType) {
    technicalDetailsFilters.push({
      field: "details.bodyType",
      operator: "eq",
      value: filterState.bodyType
    })
  }
  
  if (technicalDetailsFilters.length > 0) {
    filterGroups.push({
      operator: "and",
      filters: technicalDetailsFilters
    })
  }
  
  // Price filter group
  if (minPrice || maxPrice) {
    const priceFilters: Filter[] = []
    
    if (minPrice) {
      priceFilters.push({
        field: "price",
        operator: "gte",
        value: parseInt(minPrice, 10)
      })
    }
    
    if (maxPrice) {
      priceFilters.push({
        field: "price",
        operator: "lte",
        value: parseInt(maxPrice, 10)
      })
    }
    
    if (priceFilters.length > 0) {
      filterGroups.push({
        operator: "and",
        filters: priceFilters
      })
    }
  }
  
  // Currency filter group
  if (currency) {
    const currencyFilters: Filter[] = [
      {
        field: "currency",
        operator: "eq",
        value: currency
      }
    ]
    
    filterGroups.push({
      operator: "and",
      filters: currencyFilters
    })
  }
  
  // Log the constructed query for debugging
  console.log("Filter query:", {
    filterGroups,
    searchTerm: searchText || undefined
  });
  
  // Return query with only filterGroups (no where clause)
  return {
    page: 1,
    pageSize: 8,
    sortBy: "createdAt",
    sortDirection: "desc",
    searchTerm: searchText || undefined,
    filterGroups: filterGroups.length > 0 ? filterGroups : undefined
  }
}

  
  // Apply filters
  const applyFilters = () => {
    const queryParams = buildFilterQuery()
    
    // Update URL with filter parameters
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
    if (currency) params.set("currency", currency)
    if (searchText) params.set("search", searchText)
    
    // Update the URL
    router.push(`?${params.toString()}`)
    
    // Call the onChange prop if provided
    if (onChange) {
      onChange(queryParams)
    }
  }
  
  // Reset filters
  const resetFilters = () => {
    // Reset all state variables
    setFilterState({})
    setMinPrice("")
    setMaxPrice("")
    setMinYear("")
    setMaxYear("")
    setCurrency("")
    setSearchText("")
    setSelectedBrands([])
    
    // Also reset the hook state to ensure dropdowns reset properly
    handleStepOneSelectChange("governorate", "")
    handleStepOneSelectChange("city", "")
    handleStepOneSelectChange("marka", "")
    handleStepOneSelectChange("model", "")
    handleStepOneSelectChange("trim", "")
    
    handleStepTwoSelectChange("transmission", "")
    handleStepTwoSelectChange("fuelType", "")
    handleStepTwoSelectChange("bodyType", "")
    handleStepTwoSelectChange("currency", "")
    
    // Create default query params for reset state
    const defaultParams: QueryParams = {
      page: 1,
      pageSize: 8,
      sortBy: "createdAt",
      sortDirection: "desc"
    }
    
    // Important: Call onChange first to update listings immediately
    if (onChange) {
      onChange(defaultParams)
    }
    
    // Reset URL - force removal of all query parameters
    // Get just the base path without query parameters
    const currentPath = window.location.pathname
    router.push(currentPath)
    
    // Additional forced refresh if needed
    // This is a fallback in case the onChange doesn't trigger a refresh
    setTimeout(() => {
      if (onChange) {
        onChange(defaultParams)
      }
    }, 100)
  }

  // Add this effect after your other useEffect hooks
  useEffect(() => {
    // Only run this effect for resetting (when filterState is empty)
    if (Object.keys(filterState).length === 0) {
      // Reset Dropdown selections in hooks
      if (selectedOptions.governorate) handleStepOneSelectChange("governorate", "")
      if (selectedOptions.city) handleStepOneSelectChange("city", "")
      if (selectedOptions.marka) handleStepOneSelectChange("marka", "")
      if (selectedOptions.model) handleStepOneSelectChange("model", "")
      if (selectedOptions.trim) handleStepOneSelectChange("trim", "")
      
      if (carInfo.transmission) handleStepTwoSelectChange("transmission", "")
      if (carInfo.fuelType) handleStepTwoSelectChange("fuelType", "")
      if (carInfo.bodyType) handleStepTwoSelectChange("bodyType", "")
      if (carInfo.currency) handleStepTwoSelectChange("currency", "")
    }
  }, [filterState, selectedOptions, carInfo, handleStepOneSelectChange, handleStepTwoSelectChange])

  return (
    <div
      ref={filterRef}
      className="sticky top-[80px] transition-all"
    >
      <div className="w-full bg-white rounded-t-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filter Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4 text-primary mr-2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <h2 className="text-lg font-semibold text-slate-800">{t("filter.title")}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Sliders className="h-4 w-4 text-slate-600" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              id="search"
              placeholder={t("filter.searchInput")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border border-slate-200 bg-slate-50 pl-9 h-10 rounded-lg focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Filter Body */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'h-0 overflow-hidden' : ''}`}>
          <ScrollArea className="px-4" style={{ height: scrollHeight }}>
            {/* Location Filter */}
            <Accordion type="single" collapsible defaultValue="address" className="my-2">
              <AccordionItem value="address" className="border-b border-slate-100 py-1">
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
                    placeholder={!filterState.governorate && !selectedOptions.governorate 
                      ? t("filter.filterOptions.address.selectGovernorateFirst") || "Please select a governorate first" 
                      : stepOneTitles.city}
                    onChange={handleFilterChange}
                    value={filterState.city || selectedOptions.city}
                    name="city"
                    disabled={!filterState.governorate && !selectedOptions.governorate} // Disable if no governorate selected
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Car Brand Filter - Now with Checkboxes */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="car-marka" className="border-b border-slate-100 py-1">
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
              <AccordionItem value="car-models" className="border-b border-slate-100 py-1">
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={t("filter.filterOptions.productModels.title")} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={carModel}
                    placeholder={!filterState.marka && !selectedOptions.marka 
                      ? t("filter.filterOptions.productModels.selectMarkaFirst") || "Please select a brand first" 
                      : stepOneTitles.model}
                    onChange={handleFilterChange}
                    value={filterState.model || selectedOptions.model}
                    name="model"
                    disabled={!filterState.marka && !selectedOptions.marka} 
                  />
                  <FilterOptionDropdown
                    options={carTrim}
                    placeholder={!filterState.model && !selectedOptions.model 
                      ? t("filter.filterOptions.productModels.selectModelFirst") || "Please select a model first" 
                      : stepOneTitles.trim}
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
              <AccordionItem value="car-year" className="border-b border-slate-100 py-1">
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
              <AccordionItem value="price-range" className="border-b border-slate-100 py-1">
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
                    options={stepTwoOptions.currency}
                    placeholder={stepTwoLabels.selectCurrency}
                    onChange={handleCurrencyChange}
                    value={currency || carInfo.currency}
                    name="currency"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Control Type */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem value="control-type" className="border-b border-slate-100 py-1">
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
              <AccordionItem value="fuel-type" className="border-b border-slate-100 py-1">
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
              <AccordionItem value="body-type" className="border-b border-slate-100 py-1">
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

      {/* Filter Footer */}
      <div className="p-4 border-t border-slate-100 rounded-b-lg bg-primary">
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="rounded-lg bg-primary-light text-white font-bold hover:bg-primary hover:text-white transition-colors h-10"
            onClick={applyFilters}
          >
            <SearchCheck className="mr-2 h-4 w-4" />
            {t("filter.filterOptions.search")}
          </Button>
          <Button
            variant="outline"
            className="bg-white text-slate-700 border font-bold border-slate-200 hover:bg-slate-100 hover:text-primary transition-colors rounded-lg h-10"
            onClick={resetFilters}
          >
            <ListRestart className="mr-2 h-4 w-4" />
            {t("filter.filterOptions.resetSearch")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Filter