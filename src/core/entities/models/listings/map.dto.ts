export interface ListingMapPoint {
  id: number;
  slug: string;
  title: string;
  price: string | null;
  currency: string | null;
  latitude: number;
  longitude: number;
  listingTypeId: number;
  listingOfferType: string | null;
  governorate: string | null;
  city: string | null;
  primaryImage: string | null;
}

export type MapOfferType = 'for_sale' | 'for_rent';

export interface MapListingsQueryArgs {
  bbox: string; // minLng,minLat,maxLng,maxLat
  typeId?: number;
  offerType?: MapOfferType;
  where?: Record<string, unknown>;
  filterGroups?: Record<string, unknown>;
}

export interface MapGovernorateCount {
  governorate: string;
  totalCount: number;
}
