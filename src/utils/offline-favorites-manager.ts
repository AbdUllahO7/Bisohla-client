'use client';

import { toggleListingFavorite as originalToggleAction } from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { ApiResponse } from '@/core/entities/api/success.response';
import { ToggleFavoriteListingResponse } from '@/core/entities/models/listings/users-favorites-listings.zod.dto';

export interface MinimalListingInfo {
  id: number;
  title: string;
  price: number;
  listingOfferType: string;
  makeName: string;
  imageSrc: string;
  slug?: string;
  details?: Record<string, unknown>;
}

const LISTINGS_POOL_KEY = 'bishola_listings_pool';
const SYNC_QUEUE_PREFIX = 'bishola_favorites_sync_queue_';
const CACHE_PREFIX = 'bishola_favorites_cache_';

// Save listing details to local pool
export const cacheListing = (listing: MinimalListingInfo): void => {
  if (typeof window === 'undefined') return;
  try {
    const pool = localStorage.getItem(LISTINGS_POOL_KEY);
    const listings = pool ? JSON.parse(pool) : {};
    listings[listing.id] = {
      ...listings[listing.id],
      ...listing,
      timestamp: Date.now(),
    };
    
    // Cap pool size to prevent infinite growth (e.g. max 100 listings)
    const keys = Object.keys(listings);
    if (keys.length > 100) {
      const sortedKeys = keys.sort((a, b) => listings[a].timestamp - listings[b].timestamp);
      for (let i = 0; i < sortedKeys.length - 100; i++) {
        delete listings[sortedKeys[i]];
      }
    }
    
    localStorage.setItem(LISTINGS_POOL_KEY, JSON.stringify(listings));
  } catch (error) {
    console.error('Failed to cache listing in pool', error);
  }
};

// Retrieve listing from local pool
export const getCachedListingFromPool = (listingId: number): MinimalListingInfo | null => {
  if (typeof window === 'undefined') return null;
  try {
    const pool = localStorage.getItem(LISTINGS_POOL_KEY);
    if (!pool) return null;
    const listings = JSON.parse(pool);
    return listings[listingId] || null;
  } catch {
    return null;
  }
};

// Get cached favorites list
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getOfflineFavorites = (userId: number): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

// Save favorites list to cache
export const saveOfflineFavorites = (userId: number, data: unknown): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${userId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache favorites', error);
  }
};

// Toggle favorites locally while offline
export const toggleFavoriteOffline = (userId: number, listingId: number): { isFavorited: boolean; message: string } => {
  if (typeof window === 'undefined') return { isFavorited: false, message: 'Window undefined' };

  let isFavorited = false;
  try {
    // 1. Update Favorites Cache
    const cacheKey = `${CACHE_PREFIX}${userId}`;
    const cachedDataStr = localStorage.getItem(cacheKey);
    const cachedData = cachedDataStr ? JSON.parse(cachedDataStr) : { success: true, data: { data: [], totalItems: 0 } };

    if (!cachedData.data) cachedData.data = { data: [] };
    if (!Array.isArray(cachedData.data.data)) cachedData.data.data = [];

    const existingIndex = cachedData.data.data.findIndex(
      (item: { listing?: { id: number }; listingId?: number }) => (item.listing?.id === listingId || item.listingId === listingId)
    );

    if (existingIndex > -1) {
      // Remove from favorites
      cachedData.data.data.splice(existingIndex, 1);
      cachedData.data.totalItems = Math.max(0, (cachedData.data.totalItems || 1) - 1);
      isFavorited = false;
    } else {
      // Add to favorites - get details from listings pool
      const pooledInfo = getCachedListingFromPool(listingId);
      const mockFavorite = {
        id: listingId, // mock ID
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        listingId,
        listing: pooledInfo
          ? {
              id: pooledInfo.id,
              title: pooledInfo.title,
              price: pooledInfo.price,
              listingOfferType: pooledInfo.listingOfferType,
              make: { name: pooledInfo.makeName },
              primaryImage: pooledInfo.imageSrc,
              slug: pooledInfo.slug,
              details: pooledInfo.details || {},
            }
          : { id: listingId, title: `Listing #${listingId}`, price: 0, listingOfferType: 'for_sale' },
        notes: null,
      };

      cachedData.data.data.unshift(mockFavorite);
      cachedData.data.totalItems = (cachedData.data.totalItems || 0) + 1;
      isFavorited = true;
    }

    localStorage.setItem(cacheKey, JSON.stringify(cachedData));

    // 2. Add to Pending Sync Queue
    const queueKey = `${SYNC_QUEUE_PREFIX}${userId}`;
    const queueStr = localStorage.getItem(queueKey);
    const queue: { listingId: number; timestamp: number }[] = queueStr ? JSON.parse(queueStr) : [];
    
    // Add to queue
    queue.push({ listingId, timestamp: Date.now() });
    localStorage.setItem(queueKey, JSON.stringify(queue));
  } catch (error) {
    console.error('Error toggling favorite offline:', error);
  }

  return {
    isFavorited,
    message: isFavorited ? 'Added to favorites offline' : 'Removed from favorites offline',
  };
};

// Client wrapper for toggle favorite with offline capability
export const toggleFavorite = async (
  arg: number | { listingId: number }
): Promise<ApiResponse<ToggleFavoriteListingResponse & { isFavorite?: boolean }>> => {
  const listingId = typeof arg === 'number' ? arg : arg.listingId;

  if (typeof window !== 'undefined' && !navigator.onLine) {
    const userId = Number(localStorage.getItem('bishola_current_user_id') || 0);
    if (userId) {
      const result = toggleFavoriteOffline(userId, listingId);
      
      // Dispatch offline toast event
      window.dispatchEvent(new CustomEvent('offline-favorite-toggled', {
        detail: { isFavorited: result.isFavorited }
      }));

      return {
        success: true,
        message: result.message,
        data: {
          isFavorited: result.isFavorited,
          isFavorite: result.isFavorited, // support both fields
          message: result.message
        }
      };
    }
  }

  // If online, call the server action
  const response = await originalToggleAction({ listingId });
  
  // Cache the update on successful online toggle
  if (typeof window !== 'undefined' && response.success && response.data) {
    const userId = Number(localStorage.getItem('bishola_current_user_id') || 0);
    if (userId) {
      const isFavorited = response.data.isFavorited;
      
      // Update cached favorites list by removing/constructing mock
      const cacheKey = `${CACHE_PREFIX}${userId}`;
      const cachedDataStr = localStorage.getItem(cacheKey);
      if (cachedDataStr) {
        try {
          const cachedData = JSON.parse(cachedDataStr);
          if (cachedData && cachedData.data && Array.isArray(cachedData.data.data)) {
            const existingIndex = cachedData.data.data.findIndex(
              (item: { listing?: { id: number }; listingId?: number }) => (item.listing?.id === listingId || item.listingId === listingId)
            );
            
            if (isFavorited && existingIndex === -1) {
              const pooledInfo = getCachedListingFromPool(listingId);
              const mockFavorite = {
                id: listingId,
                userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                listingId,
                listing: pooledInfo
                  ? {
                      id: pooledInfo.id,
                      title: pooledInfo.title,
                      price: pooledInfo.price,
                      listingOfferType: pooledInfo.listingOfferType,
                      make: { name: pooledInfo.makeName },
                      primaryImage: pooledInfo.imageSrc,
                      slug: pooledInfo.slug,
                      details: pooledInfo.details || {},
                    }
                  : { id: listingId, title: `Listing #${listingId}`, price: 0, listingOfferType: 'for_sale' },
                notes: null,
              };
              cachedData.data.data.unshift(mockFavorite);
              cachedData.data.totalItems = (cachedData.data.totalItems || 0) + 1;
            } else if (!isFavorited && existingIndex > -1) {
              cachedData.data.data.splice(existingIndex, 1);
              cachedData.data.totalItems = Math.max(0, (cachedData.data.totalItems || 1) - 1);
            }
            localStorage.setItem(cacheKey, JSON.stringify(cachedData));
          }
        } catch (e) {
          console.error('Error updating cache on online toggle', e);
        }
      }
    }
  }

  return response;
};

// Sync queue with backend
export const syncPendingFavorites = async (userId: number): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.onLine) return false;

  const queueKey = `${SYNC_QUEUE_PREFIX}${userId}`;
  const queueStr = localStorage.getItem(queueKey);
  if (!queueStr) return false;

  try {
    const queue: { listingId: number; timestamp: number }[] = JSON.parse(queueStr);
    if (queue.length === 0) return false;

    const counts: Record<number, number> = {};
    queue.forEach((item) => {
      counts[item.listingId] = (counts[item.listingId] || 0) + 1;
    });

    const pendingActions = Object.entries(counts)
      .filter(([, count]) => count % 2 !== 0)
      .map(([id]) => Number(id));

    if (pendingActions.length === 0) {
      localStorage.removeItem(queueKey);
      return true;
    }

    console.log(`Syncing ${pendingActions.length} offline favorites changes...`);
    
    for (const listingId of pendingActions) {
      await originalToggleAction({ listingId });
    }

    localStorage.removeItem(queueKey);

    window.dispatchEvent(new CustomEvent('offline-favorites-synced'));
    
    return true;
  } catch (error) {
    console.error('Failed to sync pending offline favorites:', error);
    return false;
  }
};

// Listeners to trigger sync when coming online
export const setupSyncListeners = (userId: number): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    syncPendingFavorites(userId).then((synced) => {
      if (synced) {
        window.dispatchEvent(new CustomEvent('offline-favorites-sync-success'));
      }
    });
  };

  window.addEventListener('online', handleOnline);
  
  // Immediately sync if online
  if (navigator.onLine) {
    handleOnline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};
