'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useIncrementContactCount,
  useIncrementDetailsViewedCount,
  useUpdateViewDuration,
  useIncrementSharesCount,
} from './use-carStatistics';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';
import { logger } from '@/lib/logger';

interface UseProductStatisticsProps {
  carId: number | undefined;
  carUserId?: number;
  componentType?: 'desktop' | 'mobile';
}

interface UseProductStatisticsReturn {
  handleContactClick: () => void;
  handleShareClick: () => void;
  hasTrackedView: boolean;
  hasTrackedContact: boolean;
  hasTrackedDetailsViewed: boolean;
  isSharePending: boolean;
}

const MAX_TRACKING_DURATION = 600; // 10 minutes in seconds

// Global tracking map to prevent duplicate tracking across desktop/mobile components
const globalTrackingState = new Map<
  number,
  {
    detailsViewed: boolean;
    contact: boolean;
    viewStartTime: number | null;
  }
>();

export const useProductStatistics = ({
  carId,
  carUserId,
  componentType = 'desktop',
}: UseProductStatisticsProps): UseProductStatisticsReturn => {
  // get user id
  const session = useSession();
  const userId = session.user?.id;
  const isSessionLoading = session.isLoading || session.isPending;

  // Skip tracking if the current user is the car owner
  // Only check ownership if session is loaded (userId > 0 means authenticated)
  const isOwner = userId && userId > 0 && carUserId && userId === carUserId;

  // Statistics tracking hooks
  const incrementContactCount = useIncrementContactCount();
  const incrementDetailsViewedCount = useIncrementDetailsViewedCount();
  const updateViewDuration = useUpdateViewDuration();
  const incrementSharesCount = useIncrementSharesCount();

  // Local state for UI feedback
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasTrackedContact, setHasTrackedContact] = useState(false);
  const [hasTrackedDetailsViewed, setHasTrackedDetailsViewed] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [totalViewDuration, setTotalViewDuration] = useState(0);

  // Use ref to track if this hook instance initiated the tracking
  const isTrackingInitiator = useRef(false);

  const logPrefix = componentType === 'mobile' ? '[MOBILE]' : '[DESKTOP]';

  // 📊 TRACKING: Track view count on mount using batch endpoint (once per visit across all components)
  useEffect(() => {
    if (!carId) return;

    // Wait for session to load before tracking
    if (isSessionLoading) {
      logger.log(
        `⏳ ${logPrefix} Waiting for session to load before tracking...`,
      );
      return;
    }

    // Skip tracking if user is the car owner
    if (isOwner) {
      logger.log(
        `⏭️ ${logPrefix} Skipping tracking - user is the car owner (userId: ${userId})`,
      );
      return;
    }

    // Get or create global tracking state for this car
    let globalState = globalTrackingState.get(carId);
    if (!globalState) {
      globalState = {
        detailsViewed: false,
        contact: false,
        viewStartTime: null,
      };
      globalTrackingState.set(carId, globalState);
    }

    // Check if already tracked globally
    if (globalState.detailsViewed) {
      setHasTrackedDetailsViewed(true);
      return;
    }

    // Only the first component to reach here will track
    if (!incrementDetailsViewedCount.isPending) {
      globalState.detailsViewed = true; // Mark immediately to prevent race conditions
      isTrackingInitiator.current = true;

      logger.log(
        `📊 ${logPrefix} Tracking view count for car ID: ${carId}`,
      );

      incrementDetailsViewedCount.mutate(
        { carListingId: carId, userId: userId },
        {
          onSuccess: () => {
            setHasTrackedDetailsViewed(true);
            logger.log(`✅ ${logPrefix} View count tracked successfully`);
          },
          onError: (error: any) => {
            console.error(
              `❌ ${logPrefix} Failed to track view count:`,
              error,
            );
            setHasTrackedDetailsViewed(true);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId, isOwner, isSessionLoading]);

  // Initialize view start time for the first component that mounts
  useEffect(() => {
    if (!carId || isOwner) return;

    // Wait for session to load before starting view duration tracking
    if (isSessionLoading) return;

    const globalState = globalTrackingState.get(carId);
    if (!globalState) return;

    // Only start timer if not already started globally
    if (!globalState.viewStartTime && isTrackingInitiator.current) {
      globalState.viewStartTime = Date.now();
      setViewStartTime(Date.now());
      logger.log(`⏱️ ${logPrefix} Started view duration timer`);
    } else if (globalState.viewStartTime) {
      // Use existing global start time
      setViewStartTime(globalState.viewStartTime);
    }
  }, [carId, isOwner, isSessionLoading, logPrefix, isTrackingInitiator]);

  // 📊 TRACKING: Track view duration periodically and on unmount
  useEffect(() => {
    if (!viewStartTime || !carId || !isTrackingInitiator.current) return;

    // Don't start tracking if session is still loading
    if (isSessionLoading) {
      logger.log(
        `⏳ ${logPrefix} View duration tracking waiting for session...`,
      );
      return;
    }

    // Send duration every 30 seconds
    const interval = setInterval(() => {
      // Check if we've already reached max tracking duration
      if (totalViewDuration >= MAX_TRACKING_DURATION) {
        logger.log(
          `✅ ${logPrefix} Max tracking duration reached (10 minutes), stopping requests`,
        );
        return;
      }

      const durationInSeconds = Math.floor((Date.now() - viewStartTime) / 1000);
      if (durationInSeconds > 0) {
        // Calculate new total duration
        const newTotalDuration = totalViewDuration + durationInSeconds;

        // Only send if we haven't exceeded the max duration
        if (newTotalDuration <= MAX_TRACKING_DURATION) {
          updateViewDuration.mutate(
            { carListingId: carId, durationInSeconds, userId: userId },
            {
              onSuccess: () => {
                // Update total accumulated duration
                setTotalViewDuration(newTotalDuration);
                // Reset timer to 0 after sending request
                setViewStartTime(Date.now());
                logger.log(
                  `📊 ${logPrefix} Updated view duration. Total: ${newTotalDuration}s / ${MAX_TRACKING_DURATION}s`,
                );
              },
              onError: (error) => {
                console.error(
                  `❌ ${logPrefix} Failed to update view duration:`,
                  error,
                );
                // Still update total duration even on error to prevent infinite retries
                setTotalViewDuration(newTotalDuration);
                setViewStartTime(Date.now());
              },
            },
          );
        } else {
          logger.log(
            `🛑 ${logPrefix} Reached max duration (${newTotalDuration}s). No more requests will be sent.`,
          );
          setTotalViewDuration(MAX_TRACKING_DURATION);
        }
      }
    }, 30000);

    // Send final duration on unmount
    return () => {
      clearInterval(interval);

      // Only send final duration if we haven't reached max duration
      if (totalViewDuration < MAX_TRACKING_DURATION) {
        const finalDuration = Math.floor((Date.now() - viewStartTime) / 1000);
        if (finalDuration > 0) {
          const newTotalDuration = totalViewDuration + finalDuration;

          // Cap at max duration
          const cappedDuration = Math.min(
            finalDuration,
            MAX_TRACKING_DURATION - totalViewDuration,
          );

          if (cappedDuration > 0) {
            updateViewDuration.mutate({
              carListingId: carId,
              durationInSeconds: cappedDuration,
              userId: userId,
            });
            logger.log(
              `📊 ${logPrefix} Final duration sent: ${cappedDuration}s. Total: ${newTotalDuration}s`,
            );
          }
        }
      } else {
        logger.log(
          `✅ ${logPrefix} Max duration already reached, skipping final duration update`,
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStartTime, carId, totalViewDuration, userId, isSessionLoading]);

  // 🔄 RESET: Reset all tracking states on unmount
  useEffect(() => {
    return () => {
      setHasTrackedView(false);
      setHasTrackedContact(false);
      setHasTrackedDetailsViewed(false);
      setViewStartTime(null);
      setTotalViewDuration(0);
    };
  }, []);

  // 📊 TRACKING: Track contact button clicks (once per visit across all components)
  const handleContactClick = () => {
    if (!carId) return;

    // Wait for session to load before tracking (in case user clicks very quickly)
    if (isSessionLoading) {
      logger.log(
        `⏳ ${logPrefix} Contact clicked but waiting for session to load...`,
      );
      return;
    }

    // Skip tracking if user is the car owner
    if (isOwner) {
      logger.log(
        `⏭️ ${logPrefix} Skipping contact tracking - user is the car owner`,
      );
      return;
    }

    const globalState = globalTrackingState.get(carId);
    if (!globalState) return;

    // Check if already tracked globally
    if (globalState.contact) {
      logger.log(`⏭️ ${logPrefix} Contact already tracked, skipping`);
      return;
    }

    logger.log('🔔 Contact button clicked');
    globalState.contact = true; // Mark immediately to prevent race conditions

    logger.log(`📊 ${logPrefix} Tracking contact count for car ID: ${carId}`);

    incrementContactCount.mutate(
      { carListingId: carId, userId: userId },
      {
        onSuccess: () => {
          setHasTrackedContact(true);
          logger.log(`✅ ${logPrefix} Contact tracked successfully`);
        },
        onError: (error) => {
          console.error(
            `❌ ${logPrefix} Failed to track contact count:`,
            error,
          );
          setHasTrackedContact(true);
        },
      },
    );
  };

  // 📊 TRACKING: Track share button clicks
  const handleShareClick = () => {
    if (!carId) return;

    // Wait for session to load before tracking (in case user clicks very quickly)
    if (isSessionLoading) {
      logger.log(
        `⏳ ${logPrefix} Share clicked but waiting for session to load...`,
      );
      return;
    }

    // Skip tracking if user is the car owner
    if (isOwner) {
      logger.log(
        `⏭️ ${logPrefix} Skipping share tracking - user is the car owner`,
      );
      return;
    }

    logger.log(`📊 ${logPrefix} Tracking share count for car ID: ${carId}`);

    incrementSharesCount.mutate(
      { carListingId: carId, userId: userId },
      {
        onSuccess: () => {
          logger.log(`✅ ${logPrefix} Share tracked successfully`);
        },
        onError: (error) => {
          console.error(`❌ ${logPrefix} Failed to track share count:`, error);
        },
      },
    );
  };

  return {
    handleContactClick,
    handleShareClick,
    hasTrackedView,
    hasTrackedContact,
    hasTrackedDetailsViewed,
    isSharePending: incrementSharesCount.isPending,
  };
};
