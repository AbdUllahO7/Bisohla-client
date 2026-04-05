'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

interface CompareContextType {
  compareIds: number[];
  addToCompare: (id: number | string) => void;
  removeFromCompare: (id: number | string) => void;
  clearCompare: () => void;
  isInCompare: (id: number | string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE = 3;
const STORAGE_KEY = 'bishola-compare-ids';

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const t = useTranslations('compare');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompareIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load compare IDs', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
    }
  }, [compareIds, isLoaded]);

  const addToCompare = useCallback((id: number | string) => {
    const numericId = Number(id);
    setCompareIds((prev) => {
      if (prev.includes(numericId)) return prev;
      if (prev.length >= MAX_COMPARE) {
        toast({
          title: t('limitReachedTitle'),
          description: t('limitReachedDesc', { max: MAX_COMPARE }),
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, numericId];
    });
  }, [t]);

  const removeFromCompare = useCallback((id: number | string) => {
    const numericId = Number(id);
    setCompareIds((prev) => prev.filter((item) => item !== numericId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const isInCompare = useCallback((id: number | string) => {
    return compareIds.includes(Number(id));
  }, [compareIds]);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
