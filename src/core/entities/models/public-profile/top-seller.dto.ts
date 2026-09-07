/**
 * Single seller row returned by `GET /public/profile/v2/top-sellers`.
 *
 * `listingsCount` is the user's count of publicly-visible listings
 * (approved + published + not expired + not deleted; sold NOT counted).
 * Users with <= top_sellers_min_listings listings are excluded from the response.
 */
export interface SellerSummary {
  id: number;
  name: string;
  profileUrl: string | null;
  listingsCount: number;
}

export type TopSellerSummaryDto = SellerSummary;
