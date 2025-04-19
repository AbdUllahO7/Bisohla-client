"use client"
import React, { useState, useEffect } from "react"
import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { ProductCardItem } from "@/components/web/design/ProductCardItem"
import ProductSkeleton from "@/components/web/design/ProductSkeletonItem"
import Pagination from "@/components/Pagination"
import { Button } from "@/components/ui/button"
import { Car, Filter as FilterIcon, Search, SlidersHorizontal, Tag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Filter, FilterGroup, FilterOption, VehicleListing } from "@/core/entities/api/api"


export interface VehicleListingsProps {
  // Required props
  fetchListings: (params: any) => any; // Function to fetch listings with filters
  listingType: string; // Type of listing (e.g., "for_sale", "for_rent")
  translationNamespace: string; // Translation namespace to use
  
  // Optional props
  pageSize?: number;
  showTitle?: boolean;
  container?: boolean;
  icon?: React.ReactNode; // Custom icon for the header
  makeOptions?: FilterOption[]; // Available make options
  priceRangeOptions?: FilterOption[]; // Available price range options
  fuelTypeOptions?: FilterOption[]; // Available fuel type options
  additionalFilters?: React.ReactNode; // Additional filter UI elements
  customFilterBuilder?: (baseFilters: Filter[], filterStates: Record<string, string>, searchTerm: string) => FilterGroup[];
  customEmptyState?: React.ReactNode;
  customSortOptions?: FilterOption[];
  heroBackgroundClass?: string;
}

const VehicleListings: React.FC<VehicleListingsProps> = ({
  fetchListings,
  listingType,
  translationNamespace,
  pageSize = 8,
  showTitle = true,
  container = true,
  icon = <Car className="w-16 h-16 mb-4" />,
  makeOptions,
  priceRangeOptions,
  fuelTypeOptions,
  additionalFilters,
  customFilterBuilder,
  customEmptyState,
  customSortOptions,
  heroBackgroundClass = "bg-gradient-to-r from-primary to-primary-light"
}) => {
  const t = useTranslations(translationNamespace)
  const locale = useLocale()
  const isRTL = locale === 'ar'
  
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [sortOption, setSortOption] = useState<string>("newest")
  
  // Changed to use a single state object for all filters
  const [filterStates, setFilterStates] = useState<Record<string, string>>({
    make: "all",
    price: "any",
    fuelType: "all"
  })

  // Update a specific filter value
  const updateFilterState = (key: string, value: string) => {
    setFilterStates(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Default sort options mapping
  const defaultSortMapping: Record<string, SortOption> = {
    newest: { sortBy: "createdAt", sortDirection: "desc" },
    oldest: { sortBy: "createdAt", sortDirection: "asc" },
    "price-low": { sortBy: "price", sortDirection: "asc" },
    "price-high": { sortBy: "price", sortDirection: "desc" }
  }

  // Use custom sort options if provided, otherwise use defaults
  const sortMapping = customSortOptions 
    ? customSortOptions.reduce((acc, option) => {
        if (option.value === "newest") acc[option.value] = { sortBy: "createdAt", sortDirection: "desc" };
        else if (option.value === "oldest") acc[option.value] = { sortBy: "createdAt", sortDirection: "asc" };
        else if (option.value === "price-low") acc[option.value] = { sortBy: "price", sortDirection: "asc" };
        else if (option.value === "price-high") acc[option.value] = { sortBy: "price", sortDirection: "desc" };
        else acc[option.value] = { sortBy: option.id, sortDirection: option.id.includes("desc") ? "desc" : "asc" };
        return acc;
      }, {} as Record<string, SortOption>)
    : defaultSortMapping;

  // Build filter groups - use custom builder if provided, otherwise use default
  const buildFilterGroups = (): FilterGroup[] => {
    if (customFilterBuilder) {
      return customFilterBuilder([], filterStates, searchTerm);
    }
    
    // Default implementation if no custom builder provided
    const filters: Filter[] = [
      {
        field: "listingType",
        operator: "eq",
        value: listingType,
      }
    ];
    
    // Add make filter
    if (filterStates.make && filterStates.make !== "all") {
      filters.push({
        field: "carMake",
        operator: "eq",
        value: filterStates.make.toUpperCase() 
      });
    }
    
    // Add price range filter
    if (filterStates.price && filterStates.price !== "any") {
      const priceRange = filterStates.price.split("-");
      if (priceRange.length === 2) {
        filters.push({
          field: "price",
          operator: "gte",
          value: parseInt(priceRange[0]),
        });
        filters.push({
          field: "price",
          operator: "lte",
          value: parseInt(priceRange[1]),
        });
      } else if (filterStates.price.includes("+")) {
        const minPrice = parseInt(filterStates.price.replace("+", ""));
        filters.push({
          field: "price",
          operator: "gte",
          value: minPrice,
        });
      }
    }
    
    // Add fuel type filter
    if (filterStates.fuelType && filterStates.fuelType !== "all") {
      filters.push({
        field: "fuelType",
        operator: "eq",
        value: filterStates.fuelType,
      });
    }
    
    // Handle search term
    if (searchTerm && searchTerm.trim()) {
      return [
        {
          operator: "and",
          filters: filters,
        },
        {
          operator: "or",
          filters: [
            {
              field: "name",
              operator: "like",
              value: `%${searchTerm}%`,
            },
            {
              field: "name",
              operator: "like",
              value: `%${searchTerm}%`,
            },
            {
              field: "marka",
              operator: "like",
              value: `%${searchTerm}%`,
            },
          ],
        },
      ];
    }
    
    return [{
      operator: "and",
      filters: filters,
    }];
  };

  // Create query parameters
  const queryParams = {
    page: currentPage,
    pageSize: pageSize,
    sortBy: sortMapping[sortOption].sortBy,
    sortDirection: sortMapping[sortOption].sortDirection,
    filterGroups: buildFilterGroups(),
  };

  // Fetch listings with all the filters applied
  const { data, isLoading, error, refetch } = fetchListings(queryParams);

  // Effect to refetch when filters or search change
  useEffect(() => {
    refetch();
  }, [sortOption, searchTerm, refetch]);

  // Extract listings array safely
  const listings = React.useMemo<VehicleListing[]>(() => {
    if (!data) return [];
    
    // Handle different API response structures
    if (Array.isArray(data.data)) {
      return data.data;
    } else if (data.data && typeof data.data === 'object' && 'data' in data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    return [];
  }, [data]);

  // Get pagination information
  const paginationInfo = React.useMemo<PaginationInfo>(() => {
    if (!data) {
      return {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        totalItems: 0,
      };
    }
    
    // Handle different API response structures
    if (data.currentPage !== undefined) {
      return {
        currentPage: data.currentPage,
        totalPages: data.totalPages || 1,
        hasNextPage: data.hasNextPage || false,
        hasPreviousPage: data.hasPreviousPage || false,
        totalItems: data.totalItems || listings.length,
      };
    } else if (data.data && typeof data.data === 'object' && 'currentPage' in data.data) {
      const nestedData = data.data;
      return {
        currentPage: nestedData.currentPage,
        totalPages: nestedData.totalPages || 1,
        hasNextPage: nestedData.hasNextPage || false,
        hasPreviousPage: nestedData.hasPreviousPage || false,
        totalItems: nestedData.totalItems || listings.length,
      };
    } else if (data.meta) {
      return {
        currentPage: data.meta.currentPage || 1,
        totalPages: data.meta.totalPages || 1,
        hasNextPage: (data.meta.currentPage || 1) < (data.meta.totalPages || 1),
        hasPreviousPage: (data.meta.currentPage || 1) > 1,
        totalItems: data.meta.total || listings.length,
      };
    }
    
    return {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: listings.length,
    };
  }, [data, listings]);

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Apply filters
  const applyFilters = (): void => {
    setCurrentPage(1); // Reset to first page when applying filters
    refetch();
    setShowFilters(false); // Hide filter panel after applying
  };

  // Reset filters
  const resetFilters = (): void => {
    setFilterStates({
      make: "all",
      price: "any",
      fuelType: "all"
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Execute search on enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      refetch();
    }
  };

  // Default make options if not provided
  const defaultMakeOptions: FilterOption[] = [
    { id: "all", label: t("filters.allMakes"), value: "all" },
    { id: "toyota", label: "Toyota", value: "toyota" },
    { id: "honda", label: "Honda", value: "honda" },
    { id: "bmw", label: "BMW", value: "bmw" },
    { id: "mercedes", label: "Mercedes", value: "mercedes" }
  ];

  // Default price range options if not provided
  const defaultPriceRangeOptions: FilterOption[] = [
    { id: "any", label: t("filters.anyPrice"), value: "any" },
    { id: "0-10000", label: "$0 - $10,000", value: "0-10000" },
    { id: "10000-20000", label: "$10,000 - $20,000", value: "10000-20000" },
    { id: "20000-30000", label: "$20,000 - $30,000", value: "20000-30000" },
    { id: "30000+", label: "$30,000+", value: "30000+" }
  ];

  // Default fuel type options if not provided
  const defaultFuelTypeOptions: FilterOption[] = [
    { id: "all", label: t("filters.allTypes"), value: "all" },
    { id: "gasoline", label: "Gasoline", value: "gasoline" },
    { id: "diesel", label: "Diesel", value: "diesel" },
    { id: "electric", label: "Electric", value: "electric" },
    { id: "hybrid", label: "Hybrid", value: "hybrid" }
  ];

  // Default sort options if not provided
  const defaultSortOptions: FilterOption[] = [
    { id: "newest", label: t("sort.newest"), value: "newest" },
    { id: "oldest", label: t("sort.oldest"), value: "oldest" },
    { id: "price-low", label: t("sort.priceLow"), value: "price-low" },
    { id: "price-high", label: t("sort.priceHigh"), value: "price-high" }
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`${isRTL ? "font-cairo" : ""} mt-[30px] w-full`}>
      {/* Hero Section */}
      <div className={`relative w-full h-[300px] ${heroBackgroundClass} mb-8`}>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto h-full flex flex-col justify-center items-center text-white relative z-10 px-4">
          {icon}
          <h1 className="text-4xl font-bold mb-2">{t("hero.title")}</h1>
          <p className="text-xl opacity-90 text-center max-w-2xl">
            {t("hero.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="mt-8 w-full max-w-2xl flex gap-2">
            <div className="relative flex-grow">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
              <Input
                type="text"
                placeholder={t("search.placeholder")}
                className={`${isRTL ? 'pr-10' : 'pl-10'} h-12 bg-white/90 text-black w-full rounded-lg`}
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
            <Button
              className="h-12 px-6 bg-white text-primary hover:bg-gray-100"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              {t("filters.button")}
            </Button>
          </div>
        </div>
      </div>

      <Box variant={container ? "container" : "center"} className="mb-12">
        <Box variant="column" className="w-full">
          {/* Filter Section */}
          {showFilters && (
            <div className="w-full bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Text variant="h4" className="font-bold flex items-center">
                  <SlidersHorizontal className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                  {t("filters.title")}
                </Text>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                  {t("filters.close")}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Text variant="small" className="font-medium mb-1">
                    {t("filters.make")}
                  </Text>
                  <Select 
                    value={filterStates.make} 
                    onValueChange={(value) => updateFilterState("make", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("filters.allMakes")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(makeOptions || defaultMakeOptions).map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Text variant="small" className="font-medium mb-1">
                    {t("filters.priceRange")}
                  </Text>
                  <Select 
                    value={filterStates.price} 
                    onValueChange={(value) => updateFilterState("price", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("filters.anyPrice")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(priceRangeOptions || defaultPriceRangeOptions).map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Text variant="small" className="font-medium mb-1">
                    {t("filters.fuelType")}
                  </Text>
                  <Select 
                    value={filterStates.fuelType} 
                    onValueChange={(value) => updateFilterState("fuelType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("filters.allTypes")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(fuelTypeOptions || defaultFuelTypeOptions).map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Render additional filters if provided */}
                {additionalFilters}
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" className={`${isRTL ? 'ml-2' : 'mr-2'}`} onClick={resetFilters}>
                  {t("filters.reset")}
                </Button>
                <Button onClick={applyFilters}>{t("filters.apply")}</Button>
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <Text variant="h3" className="font-bold text-2xl">
                {t("results.title")}
              </Text>
              <Text variant="small" className="text-gray-500">
                {paginationInfo.totalItems} {t("results.found")}
              </Text>
            </div>

            <div className="flex items-center mt-3 sm:mt-0">
              <Text variant="small" className={`${isRTL ? 'ml-2' : 'mr-2'} text-gray-600`}>
                {t("sort.label")}
              </Text>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(customSortOptions || defaultSortOptions).map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Show loading skeleton */}
          {isLoading && (
            <div className="w-full">
              <ProductSkeleton count={pageSize} showTitle={false} />
            </div>
          )}

          {/* Show error state */}
          {error && (
            <Box className="w-full py-12 bg-red-50 rounded-lg" variant="center">
              <div className="text-center">
                <FilterIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <Text variant="h4" className="text-red-600 mb-2">
                  {t("error.title")}
                </Text>
                <Text className="text-red-500 max-w-md mx-auto">
                  {t("error.message")}
                </Text>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                  {t("error.retry")}
                </Button>
              </div>
            </Box>
          )}

          {/* Show empty state */}
          {!isLoading && !error && listings.length === 0 && (
            customEmptyState || (
              <Box className="w-full py-16 bg-gray-50 rounded-lg" variant="center">
                <div className="text-center">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <Text variant="h3" className="text-gray-700 mb-2">
                    {t("empty.title")}
                  </Text>
                  <Text className="text-gray-500 max-w-md mx-auto">
                    {searchTerm || filterStates.make !== "all" || filterStates.price !== "any" || filterStates.fuelType !== "all"
                      ? t("empty.searchMessage")
                      : t("empty.message")}
                  </Text>
                  {(searchTerm || filterStates.make !== "all" || filterStates.price !== "any" || filterStates.fuelType !== "all") && (
                    <Button variant="outline" className="mt-4" onClick={resetFilters}>
                      {t("empty.clearSearch")}
                    </Button>
                  )}
                </div>
              </Box>
            )
          )}

          {/* Display Cards */}
          {!isLoading && !error && listings.length > 0 && (
            <>
              <Box
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
                variant="center"
              >
                {listings.map((card, index) => (
                  <div
                    key={card.id || index}
                    className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <ProductCardItem
                      title={card.title}
                      marka={card.make?.name || card.marka || ""}
                      price={card.price}
                      type={card.listingType}
                      imageSrc={
                        card.images?.find((img: CarImage) => img.isPrimary)?.url ||
                        card.images?.[0]?.url ||
                        card.imageSrc ||
                        ""
                      }
                      ProductId={Number(card.id)}
                      priceWord={t("price")}
                      isFavorites={true}
                      details={
                        card.gaz
                          ? {
                              gaz: card.gaz,
                              type: card.type || "",
                            }
                          : undefined
                      }
                    />

                    {/* Additional details badge */}
                    {card.gaz && (
                      <div className="flex mt-2 gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Tag className={`${isRTL ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                          {card.gaz}
                        </span>
                        {card.type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {card.type}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </Box>

              {/* Use the reusable Pagination component */}
              <Pagination
                currentPage={paginationInfo.currentPage}
                totalPages={paginationInfo.totalPages}
                hasNextPage={paginationInfo.hasNextPage}
                hasPreviousPage={paginationInfo.hasPreviousPage}
                totalItems={paginationInfo.totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                showItemsInfo={true}
                className="mt-8"
              />
            </>
          )}
        </Box>
      </Box>
    </div>
  )
}

export default VehicleListings