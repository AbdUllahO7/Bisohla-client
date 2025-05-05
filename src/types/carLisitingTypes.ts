// Define interfaces for the data structure
interface CarImage {
  isPrimary: boolean;
  url: string;
}

interface CarMake {
  name: string;
}

interface CarListing {
  id: number;
  title: string;
  make?: CarMake;
  marka?: string;
  price: number;
  listingType: string;
  images?: CarImage[];
  imageSrc?: string;
  gaz?: string;
  type?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}

interface ApiResponse {
  data?: CarListing[] | {
    data: CarListing[];
    currentPage?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    totalItems?: number;
  };
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  totalItems?: number;
  meta?: {
    currentPage?: number;
    totalPages?: number;
    total?: number;
  };
}

interface AllCarListingsProps {
  pageSize?: number;
  showTitle?: boolean;
  container?: boolean;
}

// Define sort option mapping type
interface SortOption {
  sortBy: string;
  sortDirection: "asc" | "desc";
}

// Define price range type
interface PriceRange {
  min: number | null;
  max: number | null;
}