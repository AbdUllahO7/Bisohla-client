'use client';

import { useState, useEffect, useRef } from 'react';
import { useBatchIncrementViewCount } from './use-carStatistics';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';
import { logger } from '@/lib/logger';

// ─── Module-level batch queue ────────────────────────────────────────────────
// Shared across all card instances so a single debounced flush collects every
// visible car ID and sends them in one network request.

type PendingView = { carId: number; userId?: number };
type FlushCallback = (views: PendingView[]) => void;

let pendingQueue: Map<number, PendingView> = new Map();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let registeredFlush: FlushCallback | null = null;

const DEBOUNCE_MS = 1000; // Wait 1s after the last card becomes visible

/**
 * Register a car ID into the shared queue and (re-)arm the debounce timer.
 * When the timer fires every collected ID is sent in a single batch request.
 */
function enqueueView(view: PendingView, flush: FlushCallback) {
  // Always keep the latest flush function (all hook instances share the same
  // mutation, so any of them can flush – we just pick the most recent one).
  registeredFlush = flush;

  // De-duplicate: same car ID is only sent once per page session
  if (!pendingQueue.has(view.carId)) {
    pendingQueue.set(view.carId, view);
    logger.log(`📥 [BATCH] Queued car ID: ${view.carId} (queue size: ${pendingQueue.size})`);
  }

  // Re-arm the debounce timer
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (pendingQueue.size > 0 && registeredFlush) {
      const views = Array.from(pendingQueue.values());
      pendingQueue = new Map(); // Clear before sending to avoid duplicates on retry
      debounceTimer = null;
      registeredFlush(views);
    }
  }, DEBOUNCE_MS);
}
// ─────────────────────────────────────────────────────────────────────────────

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
 * Custom hook for tracking card views using Intersection Observer.
 *
 * Instead of firing one HTTP request per card, each hook instance registers
 * its car ID into a shared module-level queue. After a 2-second debounce (i.e.
 * 2 seconds after the last card enters the viewport) the entire queue is
 * flushed in a single `batchIncrementViewCount` call.
 *
 * Individual card conditions still apply:
 *  - Card must be ≥ 50 % visible for at least 1 second
 *  - Owner's own listings are skipped
 *  - Session must be loaded before tracking
 */
export const useCardViewTracking = ({
  carId,
  carUserId,
  enabled = true,
  cardRef,
}: UseCardViewTrackingProps): UseCardViewTrackingReturn => {
  // ── Session ────────────────────────────────────────────────────────────────
  const session = useSession();
  const userId = session?.user?.id;
  const isSessionLoading = session?.isLoading || session?.isPending;

  // Skip tracking for the car owner
  const isOwner = !!(userId && userId > 0 && carUserId && userId === carUserId);

  // ── Batch mutation (one per component instance, but flush is shared) ───────
  const batchIncrementViewCount = useBatchIncrementViewCount();

  // ── Local state ────────────────────────────────────────────────────────────
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stable reference to the flush function so the effect dependency array stays
  // clean while still calling the latest mutation instance.
  const flushRef = useRef<FlushCallback>(() => { });
  flushRef.current = (views: PendingView[]) => {
    if (batchIncrementViewCount.isPending) return;

    const carListingIds = views.map((v) => v.carId);
    const flushUserId = views[0]?.userId; // userId is the same for all cards

    logger.log(`🚀 [BATCH] Flushing ${carListingIds.length} car IDs:`, carListingIds);

    batchIncrementViewCount.mutate(
      { carListingIds, userId: flushUserId },
      {
        onSuccess: () => {
          logger.log(`✅ [BATCH] Views tracked for car IDs:`, carListingIds);
          // Mark this specific card as tracked
          setHasTrackedView(true);
        },
        onError: (error) => {
          console.error(`❌ [BATCH] Failed to track views:`, error);
          // Still mark as tracked to prevent retry loops
          setHasTrackedView(true);
        },
      },
    );
  };

  // ── Intersection Observer ──────────────────────────────────────────────────
  useEffect(() => {
    // Guard conditions
    if (!enabled || !carId || hasTrackedView || isOwner || !cardRef.current) {
      if (isOwner && carId && !isSessionLoading) {
        logger.log(
          `⏭️ [BATCH] Skipping view tracking – user is the car owner (carId: ${carId}, userId: ${userId})`,
        );
      }
      return;
    }

    if (isSessionLoading) {
      logger.log(`⏳ [BATCH] Waiting for session to load before tracking...`);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // The card must stay visible for at least 0.5 seconds before being queued
          timeoutRef.current = setTimeout(() => {
            logger.log(`📊 [BATCH] Card visible – queuing car ID: ${carId}`);
            enqueueView({ carId, userId }, (views) => flushRef.current(views));

            // Mark as queued immediately so re-renders don't re-observe
            setHasTrackedView(true);
            observer.disconnect();
          }, 500);
        } else {
          // User scrolled away before 1 second – cancel
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      { threshold: 0.5, rootMargin: '0px' },
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [carId, hasTrackedView, enabled, isOwner, cardRef, userId, isSessionLoading]);

  // ── Fallback: no Intersection Observer support ─────────────────────────────
  useEffect(() => {
    if (isSessionLoading) return;

    if (
      typeof window !== 'undefined' &&
      !window.IntersectionObserver &&
      enabled &&
      carId &&
      !hasTrackedView &&
      !isOwner
    ) {
      logger.log(`📊 [BATCH FALLBACK] Queuing car ID: ${carId}`);

      const timeoutId = setTimeout(() => {
        enqueueView({ carId, userId }, (views) => flushRef.current(views));
        setHasTrackedView(true);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [carId, hasTrackedView, enabled, isOwner, userId, isSessionLoading]);

  return {
    hasTrackedView,
    isTracking: batchIncrementViewCount.isPending,
  };
};
