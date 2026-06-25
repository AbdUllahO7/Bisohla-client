'use client';

import React from 'react';
import { useCompare } from '@/providers/CompareProvider';
import { useTranslations } from 'next-intl';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const CompareBar = () => {
  const t = useTranslations('compare');
  const { compareIds, removeFromCompare, clearCompare, maxCompare } = useCompare();

  const { data, isLoading } = useCarListings({
    id: compareIds.length > 0 ? compareIds : [-1],
    page: 1,
    pageSize: 10,
  });

  const selectedCars = React.useMemo(() => {
    const listings = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.data)
        ? data.data.data
        : [];
    return compareIds
      .map((id) => listings.find((c: any) => c.id === id))
      .filter(Boolean);
  }, [data, compareIds]);

  if (compareIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-0 right-0 z-[90] px-4 lg:bottom-8"
      >
        <div className="max-w-4xl mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-2xl border border-emerald-100 dark:border-zinc-700 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <div className="hidden sm:flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-2 rounded-xl mr-2">
              <Scale size={20} />
              <span className="font-bold whitespace-nowrap">
                {compareIds.length} / {maxCompare}
              </span>
            </div>

            {selectedCars.map((car: any) => (
              <div
                key={car.id}
                className="relative flex-shrink-0 group animate-in zoom-in duration-300"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                  <Image
                    src={car.images?.[0]?.url || '/placeholder-car.jpg'}
                    alt={car.title}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  onClick={() => removeFromCompare(car.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg scale-0 group-hover:scale-100 transition-transform duration-200"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {/* Skeletons while loading */}
            {isLoading && compareIds.length > selectedCars.length && 
              Array.from({ length: compareIds.length - selectedCars.length }).map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              ))
            }
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="hidden md:flex text-gray-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
            >
              {t('clearAll')}
            </Button>
            
            <Link href="/compare">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 group">
                <span className="font-bold">{t('compareNow')}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareBar;
