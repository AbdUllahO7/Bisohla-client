'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';

import { ListRestart } from 'lucide-react';
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

// Custom Components
import OptimizedSearchInput from '@/components/optimized-search-input';

// Hooks and Data
import { useProductStepOne } from './addProducts/StepOne/hooksv2';
import { useAddProductStepTwo } from './addProducts/stepTow/hooks';
import { getPriceRanges, getMileageRanges } from '@/constants/filterData';
import { getCurrencyOptions } from '@/core/entities/enums/currency.enum';
import { useFilters } from '@/providers/filters.provider';
import NestedCarFilter from './nested-car-filter';

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
}

// Components with React.memo for performance optimization
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
      <div className="mb-3 w-full">
        {title && (
          <Label className="text-sm font-medium text-slate-700 mb-1.5">
            {title}
          </Label>
        )}
        <SelectDropdown
          options={options}
          placeholder={placeholder}
          SelectTriggerStyle={`border border-[#EFEFEF] rounded-lg p-2.5 shadow-sm ${
            disabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white relatable hover:bg-slate-50'
          } transition-colors w-full text-slate-800`}
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

const AccordionHeader = React.memo(({ title }: AccordionHeaderProps) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-slate-800 font-bold">{title}</span>
  </div>
));

AccordionHeader.displayName = 'AccordionHeader';

// Main Filter Component with React.memo for performance
const ProductsFilter: React.FC = React.memo(() => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('productsPage');
  const filterRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(80);

  // Enhanced accordion state management - keep car brands open when selections are made
  const [carMarkaAccordionValue, setCarMarkaAccordionValue] =
    useState<string>('car-marka');
  const [hasCarSelections, setHasCarSelections] = useState(false);

  // Use filter context
  const { filters, updateFilter, resetFilters, toggleBrand } = useFilters();

  // Get data from hooks (for options)
  const handleValidationChangeStepOne = (isValid: boolean) => {};
  const handleValidationChangeStepTwo = (isValid: boolean) => {};

  const {
    selectedOptions,
    governorateOptions,
    cityOptions,
    carMakesConfig, // For nested filter
    carModelsConfig, // For nested filter
    carTrimsConfig, // For nested filter
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

  // Monitor car selections to determine if accordion should stay open
  useEffect(() => {
    const hasSelections =
      filters.selectedBrands.length > 0 || !!filters.model || !!filters.trim;
    setHasCarSelections(Boolean(hasSelections));

    // Keep accordion open if there are car selections
    if (hasSelections && carMarkaAccordionValue !== 'car-marka') {
      setCarMarkaAccordionValue('car-marka');
    }
  }, [
    filters.selectedBrands,
    filters.model,
    filters.trim,
    carMarkaAccordionValue,
  ]);

  // Calculate header height
  useEffect(() => {
    const header = document.querySelector('.mt-\\[50px\\]');
    if (header) {
      const headerRect = header.getBoundingClientRect();
      setHeaderHeight(headerRect.height + headerRect.top);
    }
  }, []);

  // Sync external hook state with filter context
  useEffect(() => {
    handleStepOneSelectChange('governorate', filters.governorate);
    handleStepOneSelectChange('city', filters.city);
    handleStepTwoSelectChange('transmission', filters.transmission);
    handleStepTwoSelectChange('fuelType', filters.fuelType);
    handleStepTwoSelectChange('bodyType', filters.bodyType);
    handleStepTwoSelectChange('currency', filters.currency);
  }, [filters, handleStepOneSelectChange, handleStepTwoSelectChange]);

  const scrollHeight = `calc(100vh - ${headerHeight + 170}px)`;

  // Handle filter changes - these now apply immediately
  const handleFilterChange = (name: string, value: string) => {
    updateFilter(name as keyof typeof filters, value);
    // Also update the external hooks for dependent data (like cities based on governorate)
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

  // Enhanced nested car filter handlers
  const handleBrandToggle = (brandId: string) => {
    toggleBrand(brandId);
    // Keep accordion open when brand is toggled
    if (carMarkaAccordionValue !== 'car-marka') {
      setCarMarkaAccordionValue('car-marka');
    }
  };

  const handleModelSelect = (modelId: string) => {
    updateFilter('model', modelId);
    updateFilter('trim', ''); // Reset trim when model changes
    handleStepOneSelectChange('model', modelId);
    // Keep accordion open when model is selected
    if (carMarkaAccordionValue !== 'car-marka') {
      setCarMarkaAccordionValue('car-marka');
    }
  };

  const handleTrimSelect = (trimId: string) => {
    updateFilter('trim', trimId);
    handleStepOneSelectChange('trim', trimId);
    // Keep accordion open when trim is selected
    if (carMarkaAccordionValue !== 'car-marka') {
      setCarMarkaAccordionValue('car-marka');
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setCarMarkaAccordionValue('car-marka');
    setHasCarSelections(false);

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
  };

  // Enhanced accordion change handler
  const handleCarMarkaAccordionChange = (value: string) => {
    // Don't allow closing if there are car selections (better UX)
    if (hasCarSelections && value === '') {
      return; // Keep it open
    }
    setCarMarkaAccordionValue(value);
  };

  return (
    <div
      ref={filterRef}
      className="sticky top-[80px] transition-all min-h-[50vh]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full bg-white rounded-t-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filter Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-slate-800">
              {t('filter.title')}
            </h2>
          </div>
        </div>

        {/* Search Input - Optimized to prevent re-renders */}
        <OptimizedSearchInput />

        {/* Filter Body */}
        <div className="transition-all duration-300">
          <ScrollArea
            className="px-4"
            style={{ height: scrollHeight, minHeight: '70vh' }}
          >
            {/* Location Filter */}
            <Accordion
              type="single"
              collapsible
              defaultValue="address"
              className="my-2"
            >
              <AccordionItem
                value="address"
                className="border-b border-[#EFEFEF] py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader
                    title={t('filter.filterOptions.address.filterOptionsTitle')}
                  />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Enhanced Nested Car Brand/Model/Trim Filter */}
            <Accordion
              type="single"
              collapsible
              className="my-2"
              value={carMarkaAccordionValue}
              onValueChange={handleCarMarkaAccordionChange}
            >
              <AccordionItem
                value="car-marka"
                className="border-b border-slate-100 py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader
                    title={`${t(
                      'filter.filterOptions.productMarka.filterOptionsTitle',
                    )} ${hasCarSelections ? '(Selected)' : ''}`}
                  />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
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
                    loadingMessage={t('filter.loadingBrands', {
                      defaultValue: 'Loading brands...',
                    })}
                    className="w-full"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Car Year Range */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem
                value="car-year"
                className="border-b border-slate-100 py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={stepOneTitles.year} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FilterOptionDropdown
                      options={madeYear}
                      placeholder={t(
                        'filter.filterOptions.productModels.minYear',
                        { defaultValue: 'Min Year' },
                      )}
                      onChange={(name, value) => handleYearChange('min', value)}
                      value={filters.minYear}
                      name="minYear"
                    />
                    <FilterOptionDropdown
                      options={madeYear}
                      placeholder={t(
                        'filter.filterOptions.productModels.maxYear',
                        { defaultValue: 'Max Year' },
                      )}
                      onChange={(name, value) => handleYearChange('max', value)}
                      value={filters.maxYear}
                      name="maxYear"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Price Range */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem
                value="price-range"
                className="border-b border-slate-100 py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader
                    title={t('filter.filterOptions.productPrice.title')}
                  />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Mileage Range */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem
                value="mileage-range"
                className="border-b border-slate-100 py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader
                    title={t('filter.filterOptions.mileage.title', {
                      defaultValue: 'Mileage Range',
                    })}
                  />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
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
            </Accordion>

            {/* Control Type */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem
                value="control-type"
                className="border-b border-slate-100 py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader
                    title={t('filter.filterOptions.ControlType.title')}
                  />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={stepTwoOptions.transmission}
                    placeholder={stepTwoLabels.selectTransmission}
                    onChange={handleTransmissionChange}
                    value={filters.transmission}
                    name="transmission"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Fuel Type */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem
                value="fuel-type"
                className="border-b border-slate-100 py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader
                    title={t('filter.filterOptions.FuelType.title')}
                  />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
                  <FilterOptionDropdown
                    options={stepTwoOptions.fuelType}
                    placeholder={stepTwoLabels.selectFuelType}
                    onChange={handleTransmissionChange}
                    value={filters.fuelType}
                    name="fuelType"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Body Type */}
            <Accordion type="single" collapsible className="my-2">
              <AccordionItem
                value="body-type"
                className="border-b border-slate-100 py-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50 group">
                  <AccordionHeader title={stepTwoLabels.bodyType} />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3 px-2">
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
          </ScrollArea>
        </div>
      </div>

      {/* Reset Button */}
      <div className="p-4 border-t border-slate-100 rounded-b-lg shadow-lg bg-white mt-5 rounded-md">
        <div className="flex flex-col items-center space-y-3">
          <Button
            variant="outline"
            className="bg-white shadow-none hover:bg-transparent hover:text-black text-black border-none font-medium transition-colors rounded-lg h-10 w-full"
            onClick={handleResetFilters}
          >
            <ListRestart className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
            {t('filter.filterOptions.resetSearch')}
          </Button>
        </div>
      </div>
    </div>
  );
});

ProductsFilter.displayName = 'ProductsFilter';

export default ProductsFilter;
