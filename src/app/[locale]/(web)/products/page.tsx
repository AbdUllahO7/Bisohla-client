"use client"
import { useState, useCallback, useMemo, useEffect } from "react"
import Box from "@/components/box/box"
import Categories from "@/components/web/ProductsPage/Categories"
import Filter from "@/components/web/ProductsPage/Filter"
import Header from "@/components/web/ProductsPage/Header"
import AllCarListings from "./AllCarListings"
import { useSearchParams } from "next/navigation"

// Import types
import type { QueryParams, FilterGroup, Filter as FilterType } from "@/core/entities/api/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLocale } from "next-intl"

const Products = () => {
  const searchParams = useSearchParams()
  const locale = useLocale()

  // State for storing the query parameters
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 8,
    sortBy: "createdAt",
    sortDirection: "desc",
  })

  // State for total items count (to display in the header)
  const [totalItems, setTotalItems] = useState<number>(0)

  // Use a key to force remount of AllCarListings when needed
  const [listingKey, setListingKey] = useState<number>(0)

  // Current sort settings - memoized for performance
  const currentSort = useMemo(
    () => ({
      sortBy: queryParams.sortBy || "createdAt",
      sortDirection: queryParams.sortDirection || "desc",
    }),
    [queryParams.sortBy, queryParams.sortDirection],
  )

  // Effect to automatically apply filters from URL params on page load
  useEffect(() => {
    if (searchParams) {
      // Extract filter parameters from URL
      const bodyType = searchParams.get("bodyType")
      const make = searchParams.get("make")
      const model = searchParams.get("model")
      const trim = searchParams.get("trim")
      const minYear = searchParams.get("minYear")
      const maxYear = searchParams.get("maxYear")
      const minPrice = searchParams.get("minPrice")
      const maxPrice = searchParams.get("maxPrice")
      const governorate = searchParams.get("governorate")
      const city = searchParams.get("city")
      const transmission = searchParams.get("transmission")
      const fuelType = searchParams.get("fuelType")
      const search = searchParams.get("search")
      const listingType = searchParams.get("listingType")

      // Only proceed if we have at least one filter parameter
      if (
        bodyType ||
        make ||
        model ||
        trim ||
        minYear ||
        maxYear ||
        minPrice ||
        maxPrice ||
        governorate ||
        city ||
        transmission ||
        fuelType ||
        search ||
        listingType
      ) {
        // Build filter groups for API query
        const filterGroups: FilterGroup[] = []

        // Listing Type filter group
        if (listingType) {
          const listingTypeFilters: FilterType[] = [
            {
              field: "listingType",
              operator: "eq",
              value: listingType,
            },
          ]

          filterGroups.push({
            operator: "and",
            filters: listingTypeFilters,
          })
        }

        // Car details filter group
        const carDetailsFilters: FilterType[] = []
        if (make) {
          carDetailsFilters.push({
            field: "makeId",
            operator: "eq",
            value: make,
          })
        }
        if (model) {
          carDetailsFilters.push({
            field: "modelId",
            operator: "eq",
            value: model,
          })
        }
        if (trim) {
          carDetailsFilters.push({
            field: "trimId",
            operator: "eq",
            value: trim,
          })
        }
        if (carDetailsFilters.length > 0) {
          filterGroups.push({
            operator: "and",
            filters: carDetailsFilters,
          })
        }

        // Location filter group
        const locationFilters: FilterType[] = []
        if (governorate) {
          locationFilters.push({
            field: "governorate",
            operator: "eq",
            value: governorate,
          })
        }
        if (city) {
          locationFilters.push({
            field: "city",
            operator: "eq",
            value: city,
          })
        }
        if (locationFilters.length > 0) {
          filterGroups.push({
            operator: "and",
            filters: locationFilters,
          })
        }

        // Technical details filter group
        const technicalDetailsFilters: FilterType[] = []

        // Year range filters
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

        // Transmission filter
        if (transmission) {
          technicalDetailsFilters.push({
            field: "details.transmission",
            operator: "eq",
            value: transmission,
          })
        }

        // Fuel type filter
        if (fuelType) {
          technicalDetailsFilters.push({
            field: "details.fuelType",
            operator: "eq",
            value: fuelType,
          })
        }

        // Body type filter
        if (bodyType) {
          technicalDetailsFilters.push({
            field: "details.bodyType",
            operator: "eq",
            value: bodyType,
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
          const priceFilters: FilterType[] = []

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

        // Update query params with all the filters
        setQueryParams((prev) => ({
          ...prev,
          searchTerm: search || undefined,
          filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
        }))

        // Force a refresh of listings
        setListingKey((prevKey) => prevKey + 1)
      }
    }
  }, [searchParams])

  // Handle filter changes from Filter component
  const handleFilterChange = useCallback(
    (newParams: QueryParams) => {
      // Preserve current sort settings when filters change
      setQueryParams({
        ...newParams,
        sortBy: queryParams.sortBy,
        sortDirection: queryParams.sortDirection,
      });

      // Force remount of AllCarListings to fetch new data
      setListingKey((prevKey) => prevKey + 1);
    },
    [queryParams.sortBy, queryParams.sortDirection],
);

  // Handle sort change from Header component
  const handleSortChange = useCallback((sortBy: string, sortDirection: "asc" | "desc") => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      sortBy,
      sortDirection,
    }))
  }, [])

  // Callback to update total items count
const handleTotalItemsChange = useCallback((count: number) => {
  setTotalItems(count);
}, []);

  return (
    <Box variant="row" className="mt-[10px] bg-background flex-wrap overflow-hidden pb-10">
      {/* Breadcrumb Navigation - Positioned at the top */}
      <Box variant="container" className="w-full mb-2 overflow-hidden pt-5" >
        <Breadcrumb dir={locale === "ar" ? "rtl" : "ltr"}>
          <BreadcrumbList dir={locale === "ar" ? "rtl" : "ltr"}>
            <BreadcrumbItem dir={locale === "ar" ? "rtl" : "ltr"}>
              <BreadcrumbLink className="hover:text-black text-black" href="/">
                {locale === "ar" ? "الرئيسية" : "Home"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator lang={locale === "ar" ? "ar" : "en"} />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-primary hover:text-primary-light" href="#">
                {locale === "ar" ? "السيارات" : "Cars"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator lang={locale === "ar" ? "ar" : "en"} />
            <BreadcrumbItem></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Box>
        <Box  className=" w-full shadow-xl bg-white pb-3 pt-3" >
        <Header onSortChange={handleSortChange} totalItems={totalItems} currentSort={currentSort} />

      </Box>

      {/* Header Section with sort functionality */}
      <Box className="" variant="center">
      </Box>

      {/* Main Content Section */}
      <Box variant="container" className="flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Filter Section - Fixed position on desktop */}
        <div className="w-full lg:w-[300px] lg:flex-shrink-0 relative">
        
          <div className="lg:sticky lg:top-5 w-full">
            <Filter onChange={handleFilterChange} />
          </div>
        </div>

        {/* Categories and Content Section */}
        <Box className="w-full lg:w-[70%] xs:w-[100%]" variant="column">
          <Categories />
          {/* Use the AllCarListings component with queryParams and key for forced remount */}
          <AllCarListings
            key={listingKey}
            showTitle={false}
            pageSize={8}
            queryParams={queryParams}
            onTotalItemsChange={handleTotalItemsChange}
            container={false}
          />

        </Box>

      </Box>

    </Box>
  )
}

export default Products
