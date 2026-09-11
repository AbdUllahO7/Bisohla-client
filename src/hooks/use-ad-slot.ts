'use client';

import { useQuery } from '@tanstack/react-query';
import { AdContentDto } from '@/core/entities/models/ads/ads.dto';
import { resolveBySlotKeyAction } from '@/core/infrastructure-adapters/actions/visitors/ads.actions';

export interface AdSlotResult {
  adsData: AdContentDto[];
  allowPlaceholders?: boolean;
  dismissable?: boolean;
  rotationStrategy?: 'priority' | 'round_robin' | 'random';
}

interface QueuedSlotRequest {
  slotKey: string;
  resolve: (data: AdSlotResult) => void;
  reject: (err: unknown) => void;
}

// Global batch queue keyed by platform
const batchQueues = new Map<
  string,
  {
    timer: ReturnType<typeof setTimeout> | null;
    requests: QueuedSlotRequest[];
  }
>();

function extractSlotData(data: unknown, slotKey: string): AdSlotResult {
  let extractedAds: AdContentDto[] = [];
  let parsedAllowPlaceholders: boolean | undefined = undefined;
  let parsedDismissable: boolean | undefined = undefined;
  let parsedRotationStrategy: 'priority' | 'round_robin' | 'random' | undefined = undefined;

  if (data && typeof data === 'object' && !Array.isArray(data) && slotKey in data) {
    const slotObj = (data as Record<string, unknown>)[slotKey];
    if (slotObj && typeof slotObj === 'object' && 'ads' in slotObj) {
      const typedObj = slotObj as {
        ads?: AdContentDto[];
        allowPlaceholders?: boolean;
        dismissable?: boolean;
        rotationStrategy?: 'priority' | 'round_robin' | 'random';
      };
      extractedAds = typedObj.ads || [];
      parsedAllowPlaceholders = typedObj.allowPlaceholders;
      parsedDismissable = typedObj.dismissable;
      parsedRotationStrategy = typedObj.rotationStrategy;
    } else {
      extractedAds = Array.isArray(slotObj) ? (slotObj as AdContentDto[]) : [];
    }
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !('id' in data[0])) {
    const slotObj = (data[0] as Record<string, unknown>)[slotKey];
    if (slotObj && typeof slotObj === 'object' && 'ads' in slotObj) {
      const typedObj = slotObj as {
        ads?: AdContentDto[];
        allowPlaceholders?: boolean;
        dismissable?: boolean;
        rotationStrategy?: 'priority' | 'round_robin' | 'random';
      };
      extractedAds = typedObj.ads || [];
      parsedAllowPlaceholders = typedObj.allowPlaceholders;
      parsedDismissable = typedObj.dismissable;
      parsedRotationStrategy = typedObj.rotationStrategy;
    } else {
      extractedAds = Array.isArray(slotObj) ? (slotObj as AdContentDto[]) : [];
    }
  } else if (data) {
    extractedAds = Array.isArray(data) ? (data as AdContentDto[]) : ([data] as AdContentDto[]);
  }

  const validAds = extractedAds.filter((ad) => ad && ad.id !== undefined);

  return {
    adsData: validAds,
    allowPlaceholders: parsedAllowPlaceholders,
    dismissable: parsedDismissable,
    rotationStrategy: parsedRotationStrategy,
  };
}

function fetchBatchAdSlot(slotKey: string, platform: string): Promise<AdSlotResult> {
  const normalizedPlatform = platform || 'web';

  return new Promise((resolve, reject) => {
    let queueEntry = batchQueues.get(normalizedPlatform);
    if (!queueEntry) {
      queueEntry = { timer: null, requests: [] };
      batchQueues.set(normalizedPlatform, queueEntry);
    }

    queueEntry.requests.push({ slotKey, resolve, reject });

    if (!queueEntry.timer) {
      queueEntry.timer = setTimeout(async () => {
        const currentRequests = queueEntry!.requests;
        batchQueues.delete(normalizedPlatform);

        if (currentRequests.length === 0) return;

        const uniqueKeys = Array.from(new Set(currentRequests.map((r) => r.slotKey)));
        const batchedKeysParam = uniqueKeys.join(',');

        try {
          const response = await resolveBySlotKeyAction(batchedKeysParam, normalizedPlatform);

          if (response.success && response.data) {
            currentRequests.forEach(({ slotKey: key, resolve: res }) => {
              const result = extractSlotData(response.data, key);
              res(result);
            });
          } else {
            const err = new Error(response.message || 'No ads returned');
            currentRequests.forEach(({ reject: rej }) => rej(err));
          }
        } catch (error) {
          currentRequests.forEach(({ reject: rej }) => rej(error));
        }
      }, 20);
    }
  });
}

export const useAdSlot = (slotKey: string, platform: string = 'web') => {
  const {
    data,
    isLoading,
    isPending,
    error,
  } = useQuery<AdSlotResult>({
    queryKey: ['ad-slot', slotKey, platform],
    queryFn: () => fetchBatchAdSlot(slotKey, platform),
    enabled: Boolean(slotKey),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const isLoadingAds = Boolean(slotKey) && (isLoading || isPending);
  const errorMessage = error ? (error instanceof Error ? error.message : 'An error occurred during fetch') : null;

  return {
    adsData: data?.adsData ?? [],
    isLoadingAds,
    error: errorMessage,
    allowPlaceholders: data?.allowPlaceholders,
    dismissable: data?.dismissable,
    rotationStrategy: data?.rotationStrategy,
  };
};

