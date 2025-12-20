'use client';

import { useState, useEffect, useRef } from 'react';
import { useIncrementViewCount } from './use-carStatistics';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';
import { logger } from '@/lib/logger';

interface UseCardViewTrackingProps {
  carId: number | undefined;
  carUserId?: number;
  enabled?: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

interface UseCardViewTrackingReturn {
  hasTrackedView: boolean;
  isTracking: boolean;
}

/**
 * Custom hook for tracking card views using Intersection Observer
 * Tracks when a card is 50% visible for at least 1 second
 * Prevents tracking if the user is the car owner
 */
export const useCardViewTracking = ({
  carId,
  carUserId,
  enabled = true,
  cardRef,
}: UseCardViewTrackingProps): UseCardViewTrackingReturn => {
  // Get user session
  const session = useSession();
  const userId = session?.user?.id;
  const isSessionLoading = session?.isLoading || session?.isPending;

  // Check if user is the car owner
  // Only check ownership if session is loaded (userId > 0 means authenticated)
  const isOwner = userId && userId > 0 && carUserId && userId === carUserId;

  // Statistics tracking hook
  const incrementViewCount = useIncrementViewCount();

  // State management
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track view count using Intersection Observer for better performance
  useEffect(() => {
    // Skip if tracking is disabled, already tracked, owner, or no carId
    if (!enabled || !carId || hasTrackedView || isOwner || !cardRef.current) {
      if (isOwner && carId && !isSessionLoading) {
        logger.log(
          `⏭️ [CARD] Skipping view tracking - user is the car owner (carId: ${carId}, userId: ${userId})`,
        );
      }
      return;
    }

    // Wait for session to load before tracking
    if (isSessionLoading) {
      logger.log(`⏳ [CARD] Waiting for session to load before tracking...`);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger when at least 50% of the card is visible for at least 1 second
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Use a timeout to ensure the card is viewed for at least 1 second
          timeoutRef.current = setTimeout(() => {
            // Check if mutation is not already pending
            if (!incrementViewCount.isPending) {
              logger.log(`📊 [CARD] Tracking view for car ID: ${carId}`);

              incrementViewCount.mutate(
                { carListingId: Number(carId), userId: userId },
                {
                  onSuccess: () => {
                    setHasTrackedView(true);
                    logger.log(
                      `✅ [CARD] View tracked successfully for car ID: ${carId}`,
                    );
                  },
                  onError: (error) => {
                    console.error(
                      `❌ [CARD] Failed to track view for car ID ${carId}:`,
                      error,
                    );
                    // Still mark as tracked to prevent retry loops
                    setHasTrackedView(true);
                  },
                },
              );
            }

            // Disconnect observer after tracking
            observer.disconnect();
          }, 1000); // Wait 1 second before tracking
        } else {
          // Clear timeout if card becomes invisible before 1 second
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      {
        threshold: 0.5, // Trigger when 50% visible
        rootMargin: '0px',
      },
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    carId,
    hasTrackedView,
    incrementViewCount,
    enabled,
    isOwner,
    cardRef,
    userId,
    isSessionLoading,
  ]);

  // Fallback: Track view count on mount if Intersection Observer is not supported
  useEffect(() => {
    // Wait for session to load
    if (isSessionLoading) return;

    // Check if Intersection Observer is supported
    if (
      !window.IntersectionObserver &&
      enabled &&
      carId &&
      !hasTrackedView &&
      !isOwner
    ) {
      logger.log(`📊 [CARD FALLBACK] Tracking view for car ID: ${carId}`);

      // Small delay to ensure component is fully mounted
      const timeoutId = setTimeout(() => {
        if (!incrementViewCount.isPending) {
          incrementViewCount.mutate(
            { carListingId: Number(carId), userId: userId },
            {
              onSuccess: () => {
                setHasTrackedView(true);
                logger.log(
                  `✅ [CARD FALLBACK] View tracked successfully for car ID: ${carId}`,
                );
              },
              onError: (error) => {
                console.error(
                  `❌ [CARD FALLBACK] Failed to track view for car ID ${carId}:`,
                  error,
                );
                setHasTrackedView(true);
              },
            },
          );
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    carId,
    hasTrackedView,
    incrementViewCount,
    enabled,
    isOwner,
    userId,
    isSessionLoading,
  ]);

  return {
    hasTrackedView,
    isTracking: incrementViewCount.isPending,
  };
};
