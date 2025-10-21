'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import React from 'react';

import {
  ListRestart,
  ChevronDown,
  Filter as FilterIcon,
  X,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

// UI Components
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SelectDropdown from '@/components/SelectDropdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

// Custom Components
import OptimizedSearchInput from '@/components/optimized-search-input';

// Hooks and Data
import { useProductStepOne } from './addProducts/StepOne/hooksv2';
import { useAddProductStepTwo } from './addProducts/stepTow/hooks';
import { getPriceRanges, getMileageRanges } from '@/constants/filterData';
import { getCurrencyOptions } from '@/core/entities/enums/currency.enum';
import { useFilters } from '@/providers/filters.provider';
import NestedCarFilter from './nested-car-filter';
import { getListingTypeOptions } from '@/core/entities/enums/cars.enums';

// Types for components
interface FilterOptionDropdownProps {
  title?: string;
  options: { value: string; label: string; logoUrl?: string }[];
  placeholder: string;
  onChange?: (name: string, value: string) => void;
  name?: string;
  value?: string;
  disabled?: boolean;
}

interface AccordionHeaderProps {
  title: string;
  hasActiveFilters?: boolean;
  activeCount?: number;
}

// Enhanced FilterOptionDropdown
const FilterOptionDropdown = React.memo(
  ({
    title,
    options,
    placeholder,
    onChange,
    value,
    name,
    disabled = false,
  }: FilterOptionDropdownProps) => {
    return (
      <div className="mb-4 w-full">
        {title && (
          <Label className="text-sm font-medium text-[#2C3C39] mb-2 block">
            {title}
          </Label>
        )}
        <div className="relative group">
          {/* Subtle hover glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-lg opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
          
          <SelectDropdown
            options={options}
            placeholder={placeholder}
            SelectTriggerStyle={`relative border border-slate-200 rounded-lg p-3 shadow-sm ${
              disabled
                ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                : `bg-white hover:bg-slate-50 hover:border-[#198341] ${
                    value ? 'border-[#198341] bg-[#ABDE3B]/5' : ''
                  }`
            } transition-all duration-200 w-full text-[#2C3C39] text-sm font-medium`}
            className="w-full"
            onChange={onChange}
            value={value || ''}
            name={name || ''}
            disabled={disabled}
          />
        </div>
      </div>
    );
  },
);

FilterOptionDropdown.displayName = 'FilterOptionDropdown';

// Enhanced AccordionHeader
const AccordionHeader = React.memo(
  ({ title, hasActiveFilters, activeCount }: AccordionHeaderProps) => (
    <div className="flex items-center justify-between w-full py-1">
      <div className="flex items-center gap-3">
        {/* Active indicator dot */}
        {hasActiveFilters && (
          <div className="w-2 h-2 rounded-full bg-[#ABDE3B] animate-pulse"></div>
        )}
        <span
          className={`text-[#2C3C39] font-semibold text-sm ${
            hasActiveFilters ? 'text-[#198341]' : ''
          }`}
        >
          {title}
        </span>
        {hasActiveFilters && activeCount && (
          <span className="bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
            {activeCount}
          </span>
        )}
      </div>
      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${hasActiveFilters ? 'text-[#198341]' : 'text-slate-600'}`} />
    </div>
  ),
);

AccordionHeader.displayName = 'AccordionHeader';

// Active filters summary component
const ActiveFiltersSummary = React.memo(({ filters, onClearAll }: any) => {
  const t = useTranslations('productsPage');
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'selectedBrands')
      return Array.isArray(value) && value.length > 0;
    return value && value !== '';
  }).length;

  if (activeFiltersCount === 0) return null;

  return (
    <div className="px-4 py-3 bg-gradient-to-r from-[#198341]/10 via-[#ABDE3B]/10 to-[#198341]/10 border-b border-[#198341]/20 relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ABDE3B]/5 to-transparent animate-pulse"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-[#198341]" />
          <span className="text-sm font-medium text-[#198341]">
            {activeFiltersCount}{' '}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-[#2C3C39] hover:text-[#198341] hover:bg-[#ABDE3B]/20 p-1 h-auto"
        >
          {t('filter.clearAll')}
        </Button>
      </div>
    </div>
  );
});

ActiveFiltersSummary.displayName = 'ActiveFiltersSummary';

// Mobile Filter Button Component
const MobileFilterButton = React.memo(({ activeFiltersCount, onOpen }: any) => {
  const t = useTranslations('productsPage');

  return (
    <Button
      onClick={onOpen}
      size="icon"
      style={{ zIndex: 10000000 }}
      className="fixed bottom-4 left-4 bg-gradient-to-r from-[#198341] to-[#ABDE3B] hover:from-[#2C3C39] hover:to-[#198341] text-white shadow-xl rounded-xl h-12 w-12 font-semibold text-base xl:hidden flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-110"
    >
      <div className="relative">
        <SlidersHorizontal className="h-5 w-5" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
            {activeFiltersCount}
          </span>
        )}
      </div>
    </Button>
  );
});

MobileFilterButton.displayName = 'MobileFilterButton';

// Filter Content Component (shared between desktop and mobile)
const FilterContent = React.memo(
  ({
    filters,
    updateFilter,
    resetFilters,
    toggleBrand,
    governorateOptions,
    cityOptions,
    carMakesConfig,
    carModelsConfig,
    carTrimsConfig,
    madeYear,
    stepOneTitles,
    stepTwoOptions,
    stepTwoLabels,
    currencyOptions,
    priceRanges,
    mileageRanges,
    handleFilterChange,
    handleTransmissionChange,
    handleYearChange,
    handlePriceChange,
    handleMileageChange,
    handleCurrencyChange,
    handleBrandToggle,
    handleModelSelect,
    handleTrimSelect,
    openAccordions,
    handleAccordionChange,
    getActiveFiltersCount,
    t,
    isMobile = false,
  }: any) => {
    const trans = useTranslations('addProduct.enteredData');

    return (
      <>
        {/* Search Input */}
        {!isMobile && (
          <div className="border-b border-slate-100 relative overflow-hidden">
            {/* Decorative bottom line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#198341] to-transparent"></div>
            <OptimizedSearchInput />
          </div>
        )}

        {/* Active Filters Summary */}
        <ActiveFiltersSummary filters={filters} onClearAll={resetFilters} />

        {/* Filter Body */}
        <div className="flex-1 overflow-auto">
          <ScrollArea
            className={`px-0 ${isMobile ? 'h-[calc(100vh-200px)]' : ''}`}
          >
            <div className="px-4 py-2">
              <Accordion
                type="multiple"
                value={openAccordions}
                onValueChange={handleAccordionChange}
                className="space-y-2"
              >
                {/* Listing Type Filter */}
                <AccordionItem
                  value="listing-type"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  {/* Subtle gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={t('filter.listingTypeSelect', {
                        defaultValue: 'Listing Type',
                      })}
                      hasActiveFilters={
                        getActiveFiltersCount('listing-type') > 0
                      }
                      activeCount={getActiveFiltersCount('listing-type')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <div className="space-y-3">
                      <FilterOptionDropdown
                        options={getListingTypeOptions(trans)}
                        placeholder={t('filter.listingTypeSelect', {
                          defaultValue: 'Select listing type',
                        })}
                        onChange={handleFilterChange}
                        value={filters.listingType}
                        name="listingType"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Location Filter */}
                <AccordionItem
                  value="address"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={t(
                        'filter.filterOptions.address.filterOptionsTitle',
                      )}
                      hasActiveFilters={getActiveFiltersCount('address') > 0}
                      activeCount={getActiveFiltersCount('address')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <div className="space-y-3">
                      <FilterOptionDropdown
                        options={governorateOptions}
                        placeholder={stepOneTitles.governorate}
                        onChange={handleFilterChange}
                        value={filters.governorate}
                        name="governorate"
                      />
                      <FilterOptionDropdown
                        options={cityOptions}
                        placeholder={
                          !filters.governorate
                            ? t(
                                'filter.filterOptions.address.selectGovernorateFirst',
                              ) || 'Please select a governorate first'
                            : stepOneTitles.city
                        }
                        onChange={handleFilterChange}
                        value={filters.city}
                        name="city"
                        disabled={!filters.governorate}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Car Brand/Model/Trim Filter */}
                <AccordionItem
                  value="car-marka"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={t(
                        'filter.filterOptions.productMarka.filterOptionsTitle',
                      )}
                      hasActiveFilters={getActiveFiltersCount('car-marka') > 0}
                      activeCount={getActiveFiltersCount('car-marka')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <NestedCarFilter
                      carMakesConfig={carMakesConfig}
                      carModelsConfig={carModelsConfig}
                      carTrimsConfig={carTrimsConfig}
                      selectedBrands={filters.selectedBrands}
                      selectedModel={filters.model}
                      selectedTrim={filters.trim}
                      onBrandToggle={handleBrandToggle}
                      onModelSelect={handleModelSelect}
                      onTrimSelect={handleTrimSelect}
                      searchPlaceholder={t('filter.search.brands', {
                        defaultValue: 'Search brands...',
                      })}
                      noOptionsMessage={t('filter.noBrands', {
                        defaultValue: 'No brands found',
                      })}
                      className="w-full"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Car Year Range */}
                <AccordionItem
                  value="car-year"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={stepOneTitles.year}
                      hasActiveFilters={getActiveFiltersCount('car-year') > 0}
                      activeCount={getActiveFiltersCount('car-year')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <div className="grid grid-cols-2 gap-3">
                      <FilterOptionDropdown
                        options={madeYear}
                        placeholder={t(
                          'filter.filterOptions.productModels.minYear',
                          { defaultValue: 'Min Year' },
                        )}
                        onChange={(name, value) =>
                          handleYearChange('min', value)
                        }
                        value={filters.minYear}
                        name="minYear"
                      />
                      <FilterOptionDropdown
                        options={madeYear}
                        placeholder={t(
                          'filter.filterOptions.productModels.maxYear',
                          { defaultValue: 'Max Year' },
                        )}
                        onChange={(name, value) =>
                          handleYearChange('max', value)
                        }
                        value={filters.maxYear}
                        name="maxYear"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Price Range */}
                <AccordionItem
                  value="price-range"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={t('filter.filterOptions.productPrice.title')}
                      hasActiveFilters={
                        getActiveFiltersCount('price-range') > 0
                      }
                      activeCount={getActiveFiltersCount('price-range')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FilterOptionDropdown
                          options={priceRanges}
                          placeholder={t(
                            'filter.filterOptions.productPrice.lessPrice',
                          )}
                          onChange={(name, value) =>
                            handlePriceChange('min', value)
                          }
                          value={filters.minPrice}
                          name="minPrice"
                        />
                        <FilterOptionDropdown
                          options={priceRanges}
                          placeholder={t(
                            'filter.filterOptions.productPrice.highestPrice',
                          )}
                          onChange={(name, value) =>
                            handlePriceChange('max', value)
                          }
                          value={filters.maxPrice}
                          name="maxPrice"
                        />
                      </div>
                      <FilterOptionDropdown
                        options={currencyOptions}
                        placeholder={t('filter.filterOptions.currency.title')}
                        onChange={handleCurrencyChange}
                        value={filters.currency}
                        name="currency"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Mileage Range */}
                <AccordionItem
                  value="mileage-range"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={t('filter.filterOptions.mileage.title', {
                        defaultValue: 'Mileage Range',
                      })}
                      hasActiveFilters={
                        getActiveFiltersCount('mileage-range') > 0
                      }
                      activeCount={getActiveFiltersCount('mileage-range')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <div className="grid grid-cols-2 gap-3">
                      <FilterOptionDropdown
                        options={mileageRanges}
                        placeholder={t(
                          'filter.filterOptions.mileage.minMileage',
                          { defaultValue: 'Min Mileage' },
                        )}
                        onChange={(name, value) =>
                          handleMileageChange('min', value)
                        }
                        value={filters.minMileage}
                        name="minMileage"
                      />
                      <FilterOptionDropdown
                        options={mileageRanges}
                        placeholder={t(
                          'filter.filterOptions.mileage.maxMileage',
                          { defaultValue: 'Max Mileage' },
                        )}
                        onChange={(name, value) =>
                          handleMileageChange('max', value)
                        }
                        value={filters.maxMileage}
                        name="maxMileage"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Control Type */}
                <AccordionItem
                  value="control-type"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={t('filter.filterOptions.ControlType.title')}
                      hasActiveFilters={
                        getActiveFiltersCount('control-type') > 0
                      }
                      activeCount={getActiveFiltersCount('control-type')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <FilterOptionDropdown
                      options={stepTwoOptions.transmission}
                      placeholder={stepTwoLabels.selectTransmission}
                      onChange={handleTransmissionChange}
                      value={filters.transmission}
                      name="transmission"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Fuel Type */}
                <AccordionItem
                  value="fuel-type"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={t('filter.filterOptions.FuelType.title')}
                      hasActiveFilters={getActiveFiltersCount('fuel-type') > 0}
                      activeCount={getActiveFiltersCount('fuel-type')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <FilterOptionDropdown
                      options={stepTwoOptions.fuelType}
                      placeholder={stepTwoLabels.selectFuelType}
                      onChange={handleTransmissionChange}
                      value={filters.fuelType}
                      name="fuelType"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Body Type */}
                <AccordionItem
                  value="body-type"
                  className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md hover:border-[#198341] transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 via-transparent to-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200 relative z-10">
                    <AccordionHeader
                      title={stepTwoLabels.bodyType}
                      hasActiveFilters={getActiveFiltersCount('body-type') > 0}
                      activeCount={getActiveFiltersCount('body-type')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
                    <FilterOptionDropdown
                      options={stepTwoOptions.bodyType}
                      placeholder={stepTwoLabels.selectBodyType}
                      onChange={handleTransmissionChange}
                      value={filters.bodyType}
                      name="bodyType"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </div>

        {/* Reset Button */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-white via-[#ABDE3B]/5 to-white relative overflow-hidden">
          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341]"></div>
          
          <Button
            variant="outline"
            className="relative w-full bg-white hover:bg-gradient-to-r hover:from-[#198341] hover:to-[#ABDE3B] hover:text-white text-[#2C3C39] border-2 border-[#2C3C39] hover:border-[#198341] font-medium transition-all duration-300 rounded-lg h-11 shadow-sm hover:shadow-lg group overflow-hidden"
            onClick={resetFilters}
          >
            {/* Animated background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <ListRestart className="mr-2 h-4 w-4 relative z-10" />
            <span className="relative z-10">{t('filter.filterOptions.resetSearch')}</span>
          </Button>
        </div>
      </>
    );
  },
);

FilterContent.displayName = 'FilterContent';

// Main Filter Component with mobile drawer
const ProductsFilter: React.FC = React.memo(() => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('productsPage');
  const filterRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(80);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Smart accordion state management
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  // Use filter context
  const { filters, updateFilter, resetFilters, toggleBrand } = useFilters();

  // Get data from hooks
  const handleValidationChangeStepOne = (isValid: boolean) => {};
  const handleValidationChangeStepTwo = (isValid: boolean) => {};

  const {
    selectedOptions,
    governorateOptions,
    cityOptions,
    carMakesConfig,
    carModelsConfig,
    carTrimsConfig,
    madeYear,
    handleSelectChange: handleStepOneSelectChange,
    titles: stepOneTitles,
  } = useProductStepOne(handleValidationChangeStepOne);

  const {
    carInfo,
    options: stepTwoOptions,
    labels: stepTwoLabels,
    handleSelectChange: handleStepTwoSelectChange,
  } = useAddProductStepTwo(handleValidationChangeStepTwo);

  const currencyOptions = getCurrencyOptions(t);
  const priceRanges = getPriceRanges;
  const mileageRanges = getMileageRanges;

  // Auto-manage accordion states based on active filters including listing type
  useEffect(() => {
    const newOpenAccordions: string[] = [];

    if (filters.listingType) newOpenAccordions.push('listing-type');
    if (filters.governorate || filters.city) newOpenAccordions.push('address');
    if (filters.selectedBrands.length > 0 || filters.model || filters.trim)
      newOpenAccordions.push('car-marka');
    if (filters.minYear || filters.maxYear) newOpenAccordions.push('car-year');
    if (filters.minPrice || filters.maxPrice || filters.currency)
      newOpenAccordions.push('price-range');
    if (filters.minMileage || filters.maxMileage)
      newOpenAccordions.push('mileage-range');
    if (filters.transmission) newOpenAccordions.push('control-type');
    if (filters.fuelType) newOpenAccordions.push('fuel-type');
    if (filters.bodyType) newOpenAccordions.push('body-type');

    setOpenAccordions(newOpenAccordions);
  }, [filters]);

  // Calculate header height
  useEffect(() => {
    const calculateHeaderHeight = () => {
      const header =
        document.querySelector('header') ||
        document.querySelector('.header') ||
        document.querySelector('[data-header]');
      if (header) {
        const headerRect = header.getBoundingClientRect();
        setHeaderHeight(headerRect.height + 20);
      }
    };

    calculateHeaderHeight();
    window.addEventListener('resize', calculateHeaderHeight);
    return () => window.removeEventListener('resize', calculateHeaderHeight);
  }, []);

  // Sync external hook state with filter context
  useEffect(() => {
    handleStepOneSelectChange('governorate', filters.governorate);
    handleStepOneSelectChange('city', filters.city);
    handleStepTwoSelectChange('transmission', filters.transmission);
    handleStepTwoSelectChange('fuelType', filters.fuelType);
    handleStepTwoSelectChange('bodyType', filters.bodyType);
    handleStepTwoSelectChange('currency', filters.currency);
    handleStepOneSelectChange('listingType', filters.listingType);
  }, [filters, handleStepOneSelectChange, handleStepTwoSelectChange]);

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'selectedBrands')
      return Array.isArray(value) && value.length > 0;
    return value && value !== '';
  }).length;

  // Enhanced filter change handlers
  const handleFilterChange = (name: string, value: string) => {
    updateFilter(name as keyof typeof filters, value);
    handleStepOneSelectChange(name, value);
  };

  const handleTransmissionChange = (name: string, value: string) => {
    updateFilter(name as keyof typeof filters, value);
    handleStepTwoSelectChange(name, value);
  };

  const handleYearChange = (type: 'min' | 'max', value: string) => {
    const key = type === 'min' ? 'minYear' : 'maxYear';
    updateFilter(key, value);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const key = type === 'min' ? 'minPrice' : 'maxPrice';
    updateFilter(key, value);
  };

  const handleMileageChange = (type: 'min' | 'max', value: string) => {
    const key = type === 'min' ? 'minMileage' : 'maxMileage';
    updateFilter(key, value);
  };

  const handleCurrencyChange = (name: string, value: string) => {
    updateFilter('currency', value);
    handleStepTwoSelectChange(name, value);
  };

  const handleBrandToggle = (brandId: string) => {
    toggleBrand(brandId);
  };

  const handleModelSelect = (modelId: string) => {
    updateFilter('model', modelId);
    updateFilter('trim', '');
    handleStepOneSelectChange('model', modelId);
  };

  const handleTrimSelect = (trimId: string) => {
    updateFilter('trim', trimId);
    handleStepOneSelectChange('trim', trimId);
  };

  const handleResetFilters = () => {
    resetFilters();
    setOpenAccordions([]);

    // Reset external hooks
    handleStepOneSelectChange('governorate', '');
    handleStepOneSelectChange('city', '');
    handleStepOneSelectChange('marka', '');
    handleStepOneSelectChange('model', '');
    handleStepOneSelectChange('trim', '');
    handleStepTwoSelectChange('transmission', '');
    handleStepTwoSelectChange('fuelType', '');
    handleStepTwoSelectChange('bodyType', '');
    handleStepTwoSelectChange('currency', '');
    handleStepOneSelectChange('listingType', '');
  };

  const handleAccordionChange = (value: string[]) => {
    setOpenAccordions(value);
  };

  // Helper function to count active filters per section
  const getActiveFiltersCount = (section: string) => {
    switch (section) {
      case 'listing-type':
        return filters.listingType ? 1 : 0;
      case 'address':
        return [filters.governorate, filters.city].filter(Boolean).length;
      case 'car-marka':
        return [
          filters.selectedBrands.length > 0,
          filters.model,
          filters.trim,
        ].filter(Boolean).length;
      case 'car-year':
        return [filters.minYear, filters.maxYear].filter(Boolean).length;
      case 'price-range':
        return [filters.minPrice, filters.maxPrice, filters.currency].filter(
          Boolean,
        ).length;
      case 'mileage-range':
        return [filters.minMileage, filters.maxMileage].filter(Boolean).length;
      case 'control-type':
        return filters.transmission ? 1 : 0;
      case 'fuel-type':
        return filters.fuelType ? 1 : 0;
      case 'body-type':
        return filters.bodyType ? 1 : 0;
      default:
        return 0;
    }
  };

  // Props for FilterContent component
  const filterContentProps = {
    filters,
    updateFilter,
    resetFilters: handleResetFilters,
    toggleBrand,
    governorateOptions,
    cityOptions,
    carMakesConfig,
    carModelsConfig,
    carTrimsConfig,
    madeYear,
    stepOneTitles,
    stepTwoOptions,
    stepTwoLabels,
    currencyOptions,
    priceRanges,
    mileageRanges,
    handleFilterChange,
    handleTransmissionChange,
    handleYearChange,
    handlePriceChange,
    handleMileageChange,
    handleCurrencyChange,
    handleBrandToggle,
    handleModelSelect,
    handleTrimSelect,
    openAccordions,
    handleAccordionChange,
    getActiveFiltersCount,
    t,
  };

  return (
    <>
      {/* Desktop Filter - Hidden on mobile */}
      <div
        ref={filterRef}
        className="hidden xl:block sticky transition-all duration-300"
        style={{ top: `${headerHeight}px` }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full bg-white rounded-xl shadow-xl border-2 border-slate-200 overflow-hidden relative">
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#ABDE3B]/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#198341]/10 to-transparent rounded-tr-full pointer-events-none"></div>
          
          {/* Desktop Header */}
          <div className="p-4 border-b-2 border-slate-200 bg-gradient-to-r from-white via-[#ABDE3B]/5 to-white relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341]"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                {/* Pulsing indicator */}
                <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#ABDE3B] to-[#198341] shadow-lg"></div>
                
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-5 w-5 text-[#198341]" />
                  <h2 className="text-lg font-bold text-[#2C3C39]">
                    {t('filter.title')}
                  </h2>
                </div>
              </div>
              
             
            </div>
          </div>

          {/* Desktop Filter Content */}
          <div
            className="flex flex-col relative z-10"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <FilterContent {...filterContentProps} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Button - Only visible on mobile */}
      <MobileFilterButton
        activeFiltersCount={activeFiltersCount}
        onOpen={() => setIsMobileDrawerOpen(true)}
      />

      {/* Mobile Filter Drawer */}
      <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="w-full sm:w-[400px] p-0 flex flex-col bg-gradient-to-b from-white to-slate-50"
          style={{ zIndex: 10000 }}
        >
          {/* Top gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] z-50"></div>
          
          {/* Mobile Header */}
          <SheetHeader className="px-4 py-4 border-b-2 border-slate-200 bg-gradient-to-r from-white via-[#ABDE3B]/5 to-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Pulsing indicator */}
                <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#ABDE3B] to-[#198341]"></div>
                
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-5 w-5 text-[#198341]" />
                  <SheetTitle className="text-lg font-bold text-[#2C3C39]">
                    {t('filter.title')}
                  </SheetTitle>
                </div>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#ABDE3B]/20">
                  <X className="h-4 w-4 text-[#2C3C39]" />
                </Button>
              </SheetClose>
            </div>
            <SheetDescription className="text-left text-sm text-slate-600">
              {t('filter.mobileDescription')}
            </SheetDescription>
          </SheetHeader>

          {/* Mobile Search Input */}
          <div className="border-b border-slate-100 relative">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#198341] to-transparent"></div>
            <OptimizedSearchInput />
          </div>

          {/* Mobile Filter Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <FilterContent {...filterContentProps} isMobile={true} />
          </div>

          {/* Mobile Footer with Apply Button */}
          <div className="p-4 border-t-2 border-slate-200 bg-gradient-to-r from-white via-[#ABDE3B]/5 to-white space-y-3 relative">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341]"></div>
            
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span className="text-[#2C3C39] font-medium">
                {activeFiltersCount > 0
                  ? t('filter.filtersApplied', {
                      count: String(activeFiltersCount),
                    })
                  : t('filter.noFiltersApplied')}
              </span>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-[#2C3C39] hover:text-[#198341] hover:bg-[#ABDE3B]/20 p-1 h-auto"
                >
                  {t('filter.clearAll')}
                </Button>
              )}
            </div>
            <SheetClose asChild>
              <Button className="w-full bg-gradient-to-r from-[#198341] to-[#ABDE3B] hover:from-[#2C3C39] hover:to-[#198341] text-white font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <Check className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">{t('filter.applyFilters')}</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-white text-[#198341] px-2 py-0.5 rounded-full text-sm font-bold relative z-10">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});

ProductsFilter.displayName = 'ProductsFilter';

export default ProductsFilter;