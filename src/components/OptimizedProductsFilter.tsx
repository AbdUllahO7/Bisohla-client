// components/OptimizedProductsFilter.tsx - Main filter using TanStack Query approach
import React, { useCallback, useMemo } from 'react';
import { ListRestart } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import OptimizedSearchInput from './OptimizedSearchInput';
import SelectDropdown from '@/components/SelectDropdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Import your existing hooks and data
import { useProductStepOne } from '@/components/web/ProductsPage/addProducts/StepOne/hooks';
import { useAddProductStepTwo } from '@/components/web/ProductsPage/addProducts/stepTow/hooks';
import { getPriceRanges, getMileageRanges } from '@/constants/filterData';
import { getCurrencyOptions } from '@/core/entities/enums/currency.enum';
import { FilterState } from '@/hooks/useOptimizedFilters';

interface OptimizedProductsFilterProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | undefined) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

// Reusable Filter Section Component
const FilterSection: React.FC<{
  title: string;
  value: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = React.memo(({ title, value, children, defaultOpen = false }) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? value : undefined}
      className="my-2"
    >
      <AccordionItem
        value={value}
        className="border-b border-slate-100 py-1"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <AccordionTrigger className="!no-underline py-2 px-2 rounded-md transition-colors hover:bg-slate-50">
          <span className="text-slate-800 font-bold">{title}</span>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-3 px-2">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

FilterSection.displayName = 'FilterSection';

const OptimizedProductsFilter: React.FC<OptimizedProductsFilterProps> =
  React.memo(
    ({
      filters,
      onFilterChange,
      onResetFilters,
      hasActiveFilters,
      className = '',
    }) => {
      const t = useTranslations('productsPage');
      const locale = useLocale();
      const isRTL = locale === 'ar';

      // Get options from your existing hooks
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
      } = useProductStepOne(() => {});

      const {
        options: stepTwoOptions,
        labels: stepTwoLabels,
        handleSelectChange: handleStepTwoSelectChange,
      } = useAddProductStepTwo(() => {});

      const priceOptions = getPriceRanges;
      const mileageOptions = getMileageRanges;
      const currencyOptions = getCurrencyOptions(t);

      // Handle different types of filter changes
      const handleLocationChange = useCallback(
        (name: string, value: string) => {
          onFilterChange(name as keyof FilterState, value || undefined);
          handleStepOneSelectChange(name, value);
        },
        [onFilterChange, handleStepOneSelectChange],
      );

      const handleCarDetailsChange = useCallback(
        (name: string, value: string) => {
          onFilterChange(name as keyof FilterState, value || undefined);
          handleStepOneSelectChange(name, value);
        },
        [onFilterChange, handleStepOneSelectChange],
      );

      const handleTechnicalChange = useCallback(
        (name: string, value: string) => {
          onFilterChange(name as keyof FilterState, value || undefined);
          handleStepTwoSelectChange(name, value);
        },
        [onFilterChange, handleStepTwoSelectChange],
      );

      const handleSimpleChange = useCallback(
        (name: string, value: string) => {
          onFilterChange(name as keyof FilterState, value || undefined);
        },
        [onFilterChange],
      );

      const handleSearchChange = useCallback(
        (value: string) => {
          onFilterChange('searchTerm', value || undefined);
        },
        [onFilterChange],
      );

      const handleBrandChange = useCallback(
        (brandId: string, checked: boolean) => {
          if (checked) {
            onFilterChange('make', brandId);
            handleStepOneSelectChange('marka', brandId);
          } else {
            onFilterChange('make', undefined);
            handleStepOneSelectChange('marka', '');
          }
        },
        [onFilterChange, handleStepOneSelectChange],
      );

      // Memoized brand selection
      const selectedBrands = useMemo(() => {
        return filters.make ? [filters.make] : [];
      }, [filters.make]);

      return (
        <div
          className={`w-full bg-white rounded-xl shadow-sm border border-slate-100 ${className}`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">
              {t('filter.title')}
            </h2>
            {hasActiveFilters && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                {t('filter.active', { defaultValue: 'Active' })}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <OptimizedSearchInput
              value={filters.searchTerm || ''}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filters */}
          <ScrollArea className="h-[70vh] px-4">
            <div className="space-y-2 py-2">
              {/* Location Filter */}
              <FilterSection
                title={t('filter.filterOptions.address.filterOptionsTitle')}
                value="address"
              >
                <div className="space-y-3">
                  <SelectDropdown
                    options={governorateOptions}
                    placeholder={stepOneTitles.governorate}
                    onChange={handleLocationChange}
                    value={filters.governorate || ''}
                    name="governorate"
                    className="w-full"
                  />
                  <SelectDropdown
                    options={cityOptions}
                    placeholder={
                      !filters.governorate
                        ? t(
                            'filter.filterOptions.address.selectGovernorateFirst',
                          )
                        : stepOneTitles.city
                    }
                    onChange={handleLocationChange}
                    value={filters.city || ''}
                    name="city"
                    disabled={!filters.governorate}
                    className="w-full"
                  />
                </div>
              </FilterSection>

              {/* Car Brand Filter */}
              <FilterSection
                title={t(
                  'filter.filterOptions.productMarka.filterOptionsTitle',
                )}
                value="car-brands"
              >
                <ScrollArea className="max-h-64 pr-1">
                  <div className="space-y-1">
                    {carMarka.map((brand) => (
                      <div
                        key={brand.value}
                        className="flex items-center p-2 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <Checkbox
                          id={`brand-${brand.value}`}
                          checked={selectedBrands.includes(brand.value)}
                          onCheckedChange={(checked) =>
                            handleBrandChange(brand.value, checked as boolean)
                          }
                          className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`brand-${brand.value}`}
                          className="ml-2 flex items-center cursor-pointer w-full text-sm"
                        >
                          {brand.logoUrl && (
                            <Image
                              src={brand.logoUrl}
                              alt={brand.label}
                              width={24}
                              height={24}
                              className="mr-2"
                            />
                          )}
                          {brand.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </FilterSection>

              {/* Car Model/Trim Filter */}
              <FilterSection
                title={t('filter.filterOptions.productModels.title')}
                value="car-models"
              >
                <div className="space-y-3">
                  <SelectDropdown
                    options={carModel}
                    placeholder={
                      !filters.make
                        ? t(
                            'filter.filterOptions.productModels.selectMarkaFirst',
                          )
                        : stepOneTitles.model
                    }
                    onChange={handleCarDetailsChange}
                    value={filters.model || ''}
                    name="model"
                    disabled={!filters.make}
                    className="w-full"
                  />
                  <SelectDropdown
                    options={carTrim}
                    placeholder={
                      !filters.model
                        ? t(
                            'filter.filterOptions.productModels.selectModelFirst',
                          )
                        : stepOneTitles.trim
                    }
                    onChange={handleCarDetailsChange}
                    value={filters.trim || ''}
                    name="trim"
                    disabled={!filters.model}
                    className="w-full"
                  />
                </div>
              </FilterSection>

              {/* Year Range Filter */}
              <FilterSection
                title={t('filter.filterOptions.year.title', {
                  defaultValue: 'Year',
                })}
                value="year-range"
              >
                <div className="grid grid-cols-2 gap-3">
                  <SelectDropdown
                    options={madeYear}
                    placeholder={t('filter.filterOptions.year.minYear')}
                    onChange={handleSimpleChange}
                    value={filters.minYear || ''}
                    name="minYear"
                    className="w-full"
                  />
                  <SelectDropdown
                    options={madeYear}
                    placeholder={t('filter.filterOptions.year.maxYear')}
                    onChange={handleSimpleChange}
                    value={filters.maxYear || ''}
                    name="maxYear"
                    className="w-full"
                  />
                </div>
              </FilterSection>

              {/* Price Range & Currency Filter */}
              <FilterSection
                title={t('filter.filterOptions.productPrice.title')}
                value="price-range"
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <SelectDropdown
                      options={priceOptions}
                      placeholder={t(
                        'filter.filterOptions.productPrice.lessPrice',
                      )}
                      onChange={handleSimpleChange}
                      value={filters.minPrice || ''}
                      name="minPrice"
                      className="w-full"
                    />
                    <SelectDropdown
                      options={priceOptions}
                      placeholder={t(
                        'filter.filterOptions.productPrice.highestPrice',
                      )}
                      onChange={handleSimpleChange}
                      value={filters.maxPrice || ''}
                      name="maxPrice"
                      className="w-full"
                    />
                  </div>
                  <SelectDropdown
                    options={currencyOptions}
                    placeholder={t('filter.filterOptions.currency.title')}
                    onChange={handleSimpleChange}
                    value={filters.currency || ''}
                    name="currency"
                    className="w-full"
                  />
                </div>
              </FilterSection>

              {/* Mileage Range Filter */}
              <FilterSection
                title={t('filter.filterOptions.mileage.title', {
                  defaultValue: 'Mileage',
                })}
                value="mileage-range"
              >
                <div className="grid grid-cols-2 gap-3">
                  <SelectDropdown
                    options={mileageOptions}
                    placeholder={t('filter.filterOptions.mileage.minMileage')}
                    onChange={handleSimpleChange}
                    value={filters.minMileage || ''}
                    name="minMileage"
                    className="w-full"
                  />
                  <SelectDropdown
                    options={mileageOptions}
                    placeholder={t('filter.filterOptions.mileage.maxMileage')}
                    onChange={handleSimpleChange}
                    value={filters.maxMileage || ''}
                    name="maxMileage"
                    className="w-full"
                  />
                </div>
              </FilterSection>

              {/* Technical Specifications */}
              <FilterSection
                title={t('filter.filterOptions.ControlType.title')}
                value="transmission"
              >
                <SelectDropdown
                  options={stepTwoOptions.transmission}
                  placeholder={stepTwoLabels.selectTransmission}
                  onChange={handleTechnicalChange}
                  value={filters.transmission || ''}
                  name="transmission"
                  className="w-full"
                />
              </FilterSection>

              <FilterSection
                title={t('filter.filterOptions.FuelType.title')}
                value="fuel-type"
              >
                <SelectDropdown
                  options={stepTwoOptions.fuelType}
                  placeholder={stepTwoLabels.selectFuelType}
                  onChange={handleTechnicalChange}
                  value={filters.fuelType || ''}
                  name="fuelType"
                  className="w-full"
                />
              </FilterSection>

              <FilterSection title={stepTwoLabels.bodyType} value="body-type">
                <SelectDropdown
                  options={stepTwoOptions.bodyType}
                  placeholder={stepTwoLabels.selectBodyType}
                  onChange={handleTechnicalChange}
                  value={filters.bodyType || ''}
                  name="bodyType"
                  className="w-full"
                />
              </FilterSection>
            </div>
          </ScrollArea>

          {/* Reset Button */}
          <div className="p-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border-slate-200 transition-all duration-200"
            >
              <ListRestart className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
              {t('filter.filterOptions.resetSearch')}
            </Button>
          </div>
        </div>
      );
    },
  );

OptimizedProductsFilter.displayName = 'OptimizedProductsFilter';

export default OptimizedProductsFilter;
