"use client"

import { useState, useEffect, useMemo } from "react"
import Box from "@/components/ui/box"
import { Button } from "@/components/ui/button"
import { SearchIcon, ListRestart, Bell } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import Text from "@/components/ui/text"
import { Input } from "@/components/ui/input"
import SelectDropdown from "@/components/forms/SelectDropdown"
import { getGovernorateOptions, getCityOptions } from "../ProductsPage/addProducts/StepOne/utils"
import CarAlertModal from "../ProductsPage/CarAlertModal"
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions'
import { getInjection } from "@/di/container"
import { useFilters } from "@/providers/filters.provider"

// Types for filtering
interface FilterState {
  [key: string]: string | undefined
}

const Filter = () => {
  const t = useTranslations("homePage")
  const tProducts = useTranslations("productsPage")
  const locale = useLocale()
  const isArabic = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeButton, setActiveButton] = useState<"buy" | "hire">("buy")
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Use global filters context
  const { 
    filters, 
    updateFilter, 
    updateAttribute, 
    resetFilters: resetGlobalFilters, 
    toggleBrand,
    filterSchema, 
    listingTypes,
    dynamicOptions 
  } = useFilters();

  const listingTypeId = String(filters.listingTypeId || "1");
  const minPrice = filters.minPrice;
  const maxPrice = filters.maxPrice;
  const currency = filters.currency;

  // Helper to check if attribute exists in current schema
  const hasAttribute = (slug: string) => {
    if (!filterSchema) return true;
    const normalizedSlug = slug.toLowerCase().replace(/_/g, '');
    return filterSchema.compiledSchema.attributes && Object.keys(filterSchema.compiledSchema.attributes).some(s =>
      s.toLowerCase().replace(/_/g, '') === normalizedSlug
    );
  };

  // Helper to get translated attribute name from schema
  const getAttributeName = (slug: string, defaultName: string) => {
    if (!filterSchema) return defaultName;
    const normalizedSlug = slug.toLowerCase().replace(/_/g, '');
    for (const section of filterSchema.sections) {
      const attr = section.attributes.find((a: any) => a.slug.toLowerCase().replace(/_/g, '') === normalizedSlug);
      if (attr) {
        return attr.translations?.find((tr: any) => tr.locale === locale)?.name || attr.name || defaultName;
      }
    }
    return defaultName;
  };

  // Helper to get options for an attribute
  const getOptionsForAttribute = (attr: any) => {
    const slug = attr.slug.toLowerCase().replace(/_/g, '');
    
    // Check dynamic options first (for reference types)
    if (dynamicOptions[attr.slug]) return dynamicOptions[attr.slug];

    // Governorate options (constant for all categories)
    if (slug === 'governorate' || slug === 'state') return governorateOptions;

    // Default options for common fields if not in dynamicOptions
    if (slug === 'transmission' || slug === 'controltype') {
      return [
        { value: 'automatic', label: isArabic ? 'أوتوماتيك' : 'Automatic' },
        { value: 'manual', label: isArabic ? 'يدوي' : 'Manual' }
      ];
    }
    
    if (slug === 'fuel_type') {
      return [
        { value: 'gasoline', label: isArabic ? 'بنزين' : 'Gasoline' },
        { value: 'diesel', label: isArabic ? 'ديزل' : 'Diesel' }
      ];
    }
    
    // Dynamic select options from schema
    if (attr.options && Array.isArray(attr.options)) {
      return attr.options.map((opt: any) => ({
        value: String(opt.id),
        label: typeof opt.label === 'object' 
          ? (opt.label[locale] || opt.label['en'] || opt.label['ar'] || String(opt.id)) 
          : (opt.label || String(opt.id))
      }));
    }

    // Default options for number types (e.g. rooms count)
    if (attr.type === 'number') {
      const min = attr.validationRules?.min || 1;
      const max = attr.validationRules?.max || 10;
      return Array.from({ length: max - min + 1 }, (_, i) => ({
        value: String(min + i),
        label: String(min + i)
      }));
    }
    
    return [];
  };

  const dynamicFilterAttributes = useMemo(() => {
    if (!filterSchema) return [];
    // Flatten attributes from all sections and filter for filterable ones
    const all = filterSchema.sections
      .flatMap((s: any) => s.attributes)
      .filter((a: any) => a.isFilterable && a.isActive)
      // Exclude attributes that are handled elsewhere (like price, and NOW governorate which is constant)
      .filter((a: any) => !['price', 'minPrice', 'maxPrice', 'currency', 'governorate', 'state'].includes(a.slug.toLowerCase()));
    
    // Prioritize Make and Model for the hero row
    return all.sort((a: any, b: any) => {
      const slugA = a.slug.toLowerCase();
      const slugB = b.slug.toLowerCase();
      const priority = (slug: string) => {
        if (slug === 'make' || slug === 'marka') return 1;
        if (slug === 'model') return 2;
        return 99;
      };
      return priority(slugA) - priority(slugB);
    }).slice(0, 2); // Take top 2 (usually Make + Model)
  }, [filterSchema]);

  // Listing types are handled by FiltersProvider now
  useEffect(() => {
    // Sync active button with listingType from context
    if (filters.listingType === "for_rent") {
      setActiveButton("hire")
    } else {
      setActiveButton("buy")
    }
  }, [filters.listingType]);

  // Get governorate options
  const governorateOptions = useMemo(() => getGovernorateOptions(locale === 'ar'), [locale]);

  // Handle button click to toggle active state
  const handleButtonClick = (button: "buy" | "hire") => {
    setActiveButton(button)
    updateFilter("listingType", button === "hire" ? "for_rent" : "for_sale")
  }

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    if (name === "listingTypeId") {
      updateFilter("listingTypeId", Number(value))
      return
    }

    if (name === "state") {
      updateFilter("governorate", value)
      return
    }

    // Special handling for Make/Marka to support single-selection and dependency reset
    if (name === "make" || name === "marka") {
      // For Hero dropdown, we want to REPLACE the brand, not toggle it
      updateFilter("selectedBrands", [value]);
      updateFilter("marka", value);
      updateFilter("model", "");
      updateFilter("trim", "");
      return;
    }

    // Check if it's a dynamic attribute or core filter
    const coreFilters = ["minPrice", "maxPrice", "currency", "transmission", "bodyType", "fuelType", "model", "trim"];
    if (coreFilters.includes(name)) {
      updateFilter(name as any, value);
    } else {
      updateAttribute(name, value);
    }
  }

  // Handle price change
  const handlePriceChange = (type: "min" | "max", value: string) => {
    updateFilter(type === "min" ? "minPrice" : "maxPrice", value);
  }

  // Handle currency change
  const handleCurrencyChange = (name: string, value: string) => {
    updateFilter("currency", value)
  }

  // Build query params for navigation


  // Apply filters and navigate to products page
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // Core search params
    if (filters.listingTypeId) params.set('listingTypeId', String(filters.listingTypeId));
    if (filters.listingType) params.set('listingOfferType', filters.listingType);
    
    // Brand/Make
    if (filters.selectedBrands.length > 0) {
      if (filters.selectedBrands.length === 1) {
        params.set('make', filters.selectedBrands[0]);
      } else {
        filters.selectedBrands.forEach(b => params.append('makes', b));
      }
    }
    
    // Model/Trim
    if (filters.model) params.set('model', filters.model);
    if (filters.trim) params.set('trim', filters.trim);
    
    // Location
    if (filters.governorate) params.set('governorate', filters.governorate);
    if (filters.city) params.set('city', filters.city);
    
    // Price
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.currency) params.set('currency', filters.currency);

    // Dynamic Attributes
    Object.entries(filters.attributes).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });

    router.push(`/products?${params.toString()}`);
  }

  // Reset filters
  const resetFilters = () => {
    resetGlobalFilters();
  }

  // Check authentication
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const auth = await checkAuth();
        setIsAuthenticated(!!auth?.success);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkUserAuth();
  }, []);

  return (
    <Box
      variant="column"
      className="mx-auto container relative top-[-50px] xs:mt-10 xs:mb-10 z-10 w-full justify-center items-center gap-0"
    >
      {/* TOP */}
      <Box variant="row" className="gap-0 w-full mx-auto">
        <Button
          className={`h-[50px] ${activeButton === "hire" ? "bg-primary-foreground" : "bg-background"
            } rounded-none w-full sm:w-[155px]`}
          onClick={() => handleButtonClick("hire")}
        >
          <span className="text-[20px] text-primary font-cairo font-[800]">{t("filter.Hire")}</span>
        </Button>
        <Button
          className={`h-[50px] ${activeButton === "buy" ? "bg-primary-foreground" : "bg-background"
            } rounded-none w-full sm:w-[155px]`}
          onClick={() => handleButtonClick("buy")}
        >
          <span className="text-[20px] text-primary font-cairo font-[800]">{t("filter.Buy")}</span>
        </Button>
      </Box>

      <Box
        variant="rowBetween"
        className="pb-10 w-full bg-background pt-10 shadow-2xl rounded-b-md flex 2xs:flex-wrap sm:flex-wrap lg:flex-nowrap mx-auto"
      >
        {/* Filter Fields */}
        <Box className="grid gap-5 pl-5 pr-5 md:grid-cols-1 lg:grid-cols-4 w-full">
          {/* Listing Type (Category) */}
          <Box className="w-full">
            <SelectDropdown
              label={t("filter.listingType") || "Category"}
              options={listingTypes.map(t => ({
                value: String(t.id),
                label: t.translations?.find((tr: any) => tr.locale === locale)?.name || t.name || String(t.id)
              }))}
              placeholder={t("filter.listingTypeSelect") || "Select Category"}
              SelectTriggerStyle="border-0 outline-none shadow-none"
              onChange={(name, value) => handleFilterChange("listingTypeId", value)}
              value={listingTypeId}
              name="listingTypeId"
              disabled={false}
            />
          </Box>
          
          {/* Dynamic Filter Fields from Schema */}
          {dynamicFilterAttributes.map((attr: any) => {
            const attrName = attr.translations?.find((tr: any) => tr.locale === locale)?.name || attr.name;
            const options = getOptionsForAttribute(attr);
            
            return (
              <Box key={attr.id} className="w-full">
                <SelectDropdown
                  label={attrName}
                  options={options}
                  placeholder={attrName}
                  SelectTriggerStyle="border-0 outline-none shadow-none"
                  onChange={(name, value) => handleFilterChange(attr.slug, value)}
                  value={
                    filters.attributes[attr.slug] || 
                    ((attr.slug === 'make' || attr.slug === 'marka') ? (filters.marka || filters.selectedBrands[0] || "") : "") ||
                    (attr.slug === 'model' ? (filters.model || "") : "") ||
                    ""
                  }
                  name={attr.slug}
                  disabled={options.length === 0}
                />
              </Box>
            );
          })}
          
          {/* Fallback empty boxes to maintain grid layout if less than 2 dynamic attributes */}
          {Array.from({ length: Math.max(0, 2 - dynamicFilterAttributes.length) }).map((_, i) => (
            <Box key={`empty-${i}`} className="hidden lg:block w-full" />
          ))}

          {/* Governorate (Constant) - Column 4 */}
          <Box className="w-full">
            <SelectDropdown
              label={t("filter.state")}
              options={governorateOptions}
              placeholder={t("filter.state") || "Select Governorate"}
              SelectTriggerStyle="border-0 outline-none shadow-none"
              onChange={(name, value) => handleFilterChange("state", value)}
              value={filters.governorate || ""}
              name="state"
              disabled={false}
            />
          </Box>
        </Box>

        {/* Price Range and Search Button */}
        <Box className="flex flex-col md:flex-row items-center gap-5 pl-5 pr-5 w-full lg:w-auto">
          {/* Price Range */}
          <Box variant="column" className="w-full md:w-auto text-start justify-between items-start gap-0">
            <Text className="mb-1 text-sm text-gray-700 font-cairo font-[700]">{t("filter.selectPrice")}</Text>
            <Box className="grid grid-cols-2 gap-2 mb-2 justify-center items-center w-full md:w-[250px]">
              <Input
                type="number"
                placeholder={t("filter.productPrice.lessPrice") || "Min Price"}
                className="border-0 outline-none shadow-none"
                onChange={(e) => handlePriceChange("min", e.target.value)}
                value={minPrice || ""}
              />
              <Input
                type="number"
                placeholder={t("filter.productPrice.highestPrice") || "Max Price"}
                className="border-0 outline-none shadow-none"
                onChange={(e) => handlePriceChange("max", e.target.value)}
                value={maxPrice || ""}
              />
            </Box>
          </Box>

          {/* Search, Reset, and Notify Me Buttons */}
          <Box className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Button className="bg-primary-foreground h-[55px] w-full md:w-auto" onClick={applyFilters}>
              <SearchIcon className="text-primary mr-2" />
              <span className="text-primary">{t("filter.search")}</span>
            </Button>

            <Button
              variant="outline"
              className="h-[55px] border border-primary hover:bg-primary-foreground w-full md:w-auto"
              onClick={resetFilters}
            >
              <ListRestart className="text-primary mr-2 h-4 w-4" />
              <span className="text-primary">{t("filter.reset") || "Reset"}</span>
            </Button>

            {isAuthenticated && (
              <Button
                onClick={() => setIsAlertModalOpen(true)}
                className="bg-primary-light hover:opacity-90 text-white font-semibold h-[55px] rounded-xl shadow-md hover:shadow-lg transition-all w-full md:w-auto"
              >
                <Bell className="h-4 w-4 mr-2" />
                {isArabic ? 'خبرني' : 'Notify Me'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Car Alert Modal */}
      <CarAlertModal
        open={isAlertModalOpen}
        onOpenChange={setIsAlertModalOpen}
        initialData={{
          makeId: filters.selectedBrands[0] ? Number(filters.selectedBrands[0]) : 0,
          modelId: filters.model ? Number(filters.model) : 0,
          trimId: filters.trim ? Number(filters.trim) : 0,
          minPrice: filters.minPrice ? Number(filters.minPrice) : 0,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : 0,
          governorate: filters.governorate || '',
          city: filters.city || '',
        }}
        governorateOptions={getGovernorateOptions(isArabic)}
        getCityOptions={(gov) => getCityOptions(gov, isArabic)}
        isArabic={isArabic}
        t={tProducts}
      />
    </Box>
  )
}

export default Filter
