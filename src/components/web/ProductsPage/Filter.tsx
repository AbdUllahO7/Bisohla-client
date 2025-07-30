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
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            {title}
          </Label>
        )}
        <SelectDropdown
          options={options}
          placeholder={placeholder}
          SelectTriggerStyle={`border border-slate-200 rounded-lg p-3 shadow-sm ${
            disabled
              ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
              : `bg-white hover:bg-slate-50 ${
                  value ? 'border-primary/50 bg-primary/5' : ''
                }`
          } transition-all duration-200 w-full text-slate-800 text-sm font-medium`}
          className="w-full"
          onChange={onChange}
          value={value || ''}
          name={name || ''}
          disabled={disabled}
        />
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
        <span
          className={`text-slate-800 font-semibold text-sm ${
            hasActiveFilters ? 'text-primary' : ''
          }`}
        >
          {title}
        </span>
        {hasActiveFilters && activeCount && (
          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {activeCount}
          </span>
        )}
      </div>
      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
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
    <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {activeFiltersCount}{' '}
            {t('filter.activeFilters', { count: activeFiltersCount })}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-slate-600 hover:text-primary p-1 h-auto"
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
      className="fixed bottom-4 left-4 right-4 bg-primary hover:bg-primary/90 text-white shadow-lg rounded-xl h-12 w-12 font-semibold text-base xl:hidden flex items-center justify-center"
    >
      <div className="relative">
        <SlidersHorizontal className="h-5 w-5" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
          <div className="border-b border-slate-100">
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
                {/* Listing Type Filter - FIXED: Changed value to "listing-type" */}
                <AccordionItem
                  value="listing-type"
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
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
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <AccordionHeader
                      title={t(
                        'filter.filterOptions.address.filterOptionsTitle',
                      )}
                      hasActiveFilters={getActiveFiltersCount('address') > 0}
                      activeCount={getActiveFiltersCount('address')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <AccordionHeader
                      title={t(
                        'filter.filterOptions.productMarka.filterOptionsTitle',
                      )}
                      hasActiveFilters={getActiveFiltersCount('car-marka') > 0}
                      activeCount={getActiveFiltersCount('car-marka')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <AccordionHeader
                      title={stepOneTitles.year}
                      hasActiveFilters={getActiveFiltersCount('car-year') > 0}
                      activeCount={getActiveFiltersCount('car-year')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <AccordionHeader
                      title={t('filter.filterOptions.productPrice.title')}
                      hasActiveFilters={
                        getActiveFiltersCount('price-range') > 0
                      }
                      activeCount={getActiveFiltersCount('price-range')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
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
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <AccordionHeader
                      title={t('filter.filterOptions.ControlType.title')}
                      hasActiveFilters={
                        getActiveFiltersCount('control-type') > 0
                      }
                      activeCount={getActiveFiltersCount('control-type')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <AccordionHeader
                      title={t('filter.filterOptions.FuelType.title')}
                      hasActiveFilters={getActiveFiltersCount('fuel-type') > 0}
                      activeCount={getActiveFiltersCount('fuel-type')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <AccordionHeader
                      title={stepTwoLabels.bodyType}
                      hasActiveFilters={getActiveFiltersCount('body-type') > 0}
                      activeCount={getActiveFiltersCount('body-type')}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50">
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
        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-slate-50 hover:text-primary text-slate-700 border-slate-300 hover:border-primary font-medium transition-all duration-200 rounded-lg h-11 shadow-sm hover:shadow"
            onClick={resetFilters}
          >
            <ListRestart className="mr-2 h-4 w-4" />
            {t('filter.filterOptions.resetSearch')}
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

  // FIXED: Auto-manage accordion states based on active filters including listing type
  useEffect(() => {
    const newOpenAccordions: string[] = [];

    if (filters.listingType) newOpenAccordions.push('listing-type'); // ADDED
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
    // ADDED: Sync listing type
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
    // ADDED: Reset listing type
    handleStepOneSelectChange('listingType', '');
  };

  const handleAccordionChange = (value: string[]) => {
    setOpenAccordions(value);
  };

  // FIXED: Helper function to count active filters per section - added listing-type case
  const getActiveFiltersCount = (section: string) => {
    switch (section) {
      case 'listing-type':
        return filters.listingType ? 1 : 0; // ADDED
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
        <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Desktop Header */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-800">
                  {t('filter.title')}
                </h2>
              </div>
            </div>
          </div>

          {/* Desktop Filter Content */}
          <div
            className="flex flex-col"
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
          className="w-full sm:w-[400px] p-0 flex flex-col"
          style={{ zIndex: 10000 }}
        >
          {/* Mobile Header */}
          <SheetHeader className="px-4 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-primary" />
                <SheetTitle className="text-lg font-bold text-slate-800">
                  {t('filter.title')}
                </SheetTitle>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            <SheetDescription className="text-left text-sm text-slate-600">
              {t('filter.mobileDescription')}
            </SheetDescription>
          </SheetHeader>

          {/* Mobile Search Input */}
          <div className="border-b border-slate-100">
            <OptimizedSearchInput />
          </div>

          {/* Mobile Filter Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <FilterContent {...filterContentProps} isMobile={true} />
          </div>

          {/* Mobile Footer with Apply Button */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
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
                  className="text-xs text-slate-600 hover:text-primary p-1 h-auto"
                >
                  {t('filter.clearAll')}
                </Button>
              )}
            </div>
            <SheetClose asChild>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 rounded-xl">
                <Check className="mr-2 h-4 w-4" />
                {t('filter.applyFilters')}
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-white text-primary px-2 py-0.5 rounded-full text-sm font-bold">
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
