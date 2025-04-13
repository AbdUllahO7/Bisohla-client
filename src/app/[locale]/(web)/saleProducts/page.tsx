"use client"
import React from "react"
import { useCarListings } from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions"
import { Car } from "lucide-react"
import VehicleListings from "@/components/web/Pordıcts/VehicleListings";
import { Filter, FilterGroup, FilterOption, FilterState } from "@/core/entities/api/api";





const SaleProducts: React.FC<AllCarListingsProps> = ({ 
  pageSize = 8, 
  showTitle = true, 
  container = true 
}) => {
  // Define custom filter options that match your data structure
  const makeOptions: FilterOption[] = [
    { id: "all", label: "All Makes", value: "all" },
    { id: "toyota", label: "Toyota", value: "toyota" },
    { id: "honda", label: "Honda", value: "honda" },
    { id: "bmw", label: "BMW", value: "bmw" },
    { id: "mercedes", label: "Mercedes", value: "mercedes" }
  ];

  const priceRangeOptions: FilterOption[] = [
    { id: "any", label: "Any Price", value: "any" },
    { id: "0-10000", label: "$0 - $10,000", value: "0-10000" },
    { id: "10000-20000", label: "$10,000 - $20,000", value: "10000-20000" },
    { id: "20000-30000", label: "$20,000 - $30,000", value: "20000-30000" },
    { id: "30000+", label: "$30,000+", value: "30000+" }
  ];

  const fuelTypeOptions: FilterOption[] = [
    { id: "all", label: "All Fuel Types", value: "all" },
    { id: "gasoline", label: "Gasoline", value: "gasoline" },
    { id: "diesel", label: "Diesel", value: "diesel" },
    { id: "electric", label: "Electric", value: "electric" },
    { id: "hybrid", label: "Hybrid", value: "hybrid" }
  ];

  // Custom filter builder to handle the structure of your API
  const customFilterBuilder = (
    baseFilters: Filter[],
    filterStates: FilterState, 
    searchTerm: string
  ): FilterGroup[] => {
    const filters: Filter[] = [
      {
        field: "listingType",
        operator: "eq",
        value: "for_sale",
      }
    ];
    
    // Add make filter
    if (filterStates.make && filterStates.make !== "all") {
      filters.push({
        field: "make.name",
        operator: "eq",
        value: filterStates.make.charAt(0).toUpperCase() + filterStates.make.slice(1),
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
        field: "carDetails",
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
              field: "carMarka",
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
    
    return [
      {
        operator: "and",
        filters: filters,
      },
    ];
  };

  return (
    <VehicleListings
        fetchListings={useCarListings}
        listingType="for_sale"
        translationNamespace="saleProduct"
        pageSize={pageSize}
        showTitle={showTitle}
        container={container}
        icon={<Car className="w-16 h-16 mb-4 text-primary-foreground" />}
        heroBackgroundClass="bg-primary"
        makeOptions={makeOptions}
        priceRangeOptions={priceRangeOptions}
        fuelTypeOptions={fuelTypeOptions}
        customFilterBuilder={customFilterBuilder}
    />
  )
}

export default SaleProducts