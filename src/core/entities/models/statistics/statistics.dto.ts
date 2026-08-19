/**
 * Listing and User Statistics DTOs and Trend response models.
 * Mirrors bishola-nest-server statistics services and endpoints.
 */

export interface ListingStatisticsData {
  id: number;
  listingId: number;
  viewsCount: number;
  contactCount: number;
  favoritesCount: number;
  sharesCount: number;
  detailsViewedCount: number;
  /** Cumulative seconds across the listing's lifetime. */
  viewDuration: number;
  /** ISO timestamp string. null if never viewed. */
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatisticsOverview {
  totalViews: number;
  totalContacts: number;
  /** Favorites RECEIVED on the user's own listings. */
  totalFavorites: number;
  totalShares: number;
  totalDetailsViewed: number;
  /** Average view duration in seconds. */
  avgViewDuration: number;
  totalListings: number;
}

export interface MostViewedListing {
  id: number;
  title: string;
  viewsCount: number;
  slug?: string;
}

export interface TrendingListing {
  id: number;
  title: string;
  viewsCount: number;
  /** ISO timestamp string. null if never viewed. */
  lastViewedAt: string | null;
  slug?: string;
}

export interface RecentActivity {
  last7Days: number;
  last30Days: number;
}

export interface UserStatisticsHighlights {
  mostViewed: MostViewedListing | null;
  trending: TrendingListing | null;
  recentActivity: RecentActivity;
}

export interface TrendSummary {
  currentTotal: number;
  previousTotal: number;
  growthPercent: number;
}

export interface ViewsTrendBucket {
  name: string;
  viewsCount: number;
  viewsGrowth: number;
}

export interface ContactsTrendBucket {
  name: string;
  contactCount: number;
  contactsGrowth: number;
}

export interface SharesTrendBucket {
  name: string;
  sharesCount: number;
  sharesGrowth: number;
}

export interface DetailsViewedTrendBucket {
  name: string;
  detailsViewedCount: number;
  detailsViewedGrowth: number;
}

export interface DurationTrendBucket {
  name: string;
  viewDurationSum: number;
  durationGrowth: number;
}

export interface ViewsTrendResponse {
  daily: ViewsTrendBucket[];
  weekly: ViewsTrendBucket[];
  monthly: ViewsTrendBucket[];
  summary: TrendSummary;
}

export interface ContactsTrendResponse {
  daily: ContactsTrendBucket[];
  weekly: ContactsTrendBucket[];
  monthly: ContactsTrendBucket[];
  summary: TrendSummary;
}

export interface SharesTrendResponse {
  daily: SharesTrendBucket[];
  weekly: SharesTrendBucket[];
  monthly: SharesTrendBucket[];
  summary: TrendSummary;
}

export interface DetailsViewedTrendResponse {
  daily: DetailsViewedTrendBucket[];
  weekly: DetailsViewedTrendBucket[];
  monthly: DetailsViewedTrendBucket[];
  summary: TrendSummary;
}

export interface DurationTrendResponse {
  daily: DurationTrendBucket[];
  weekly: DurationTrendBucket[];
  monthly: DurationTrendBucket[];
  summary: TrendSummary;
}

export type AnyTrendBucket =
  | ViewsTrendBucket
  | ContactsTrendBucket
  | SharesTrendBucket
  | DetailsViewedTrendBucket
  | DurationTrendBucket;

export type AnyTrendResponse =
  | ViewsTrendResponse
  | ContactsTrendResponse
  | SharesTrendResponse
  | DetailsViewedTrendResponse
  | DurationTrendResponse;

export type MetricKey = 'views' | 'contacts' | 'shares' | 'detailsViewed' | 'duration';
export type TrendGranularity = 'daily' | 'weekly' | 'monthly';

export interface TrendsFilter {
  days?: number;
  startDate?: string;
  endDate?: string;
  listingTypeId?: number;
  [key: string]: unknown;
}

export interface ListingTrendsFilter {
  days?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}
