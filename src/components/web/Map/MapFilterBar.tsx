'use client';

import React from 'react';
import { MapPin, Navigation, Layers, RefreshCw, Compass } from 'lucide-react';
import { MapOfferType } from '@/core/entities/models/listings/map.dto';

export interface GovernorateLocation {
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const SYRIA_GOVERNORATES: GovernorateLocation[] = [
  { nameAr: 'دمشق', nameEn: 'Damascus', lat: 33.5138, lng: 36.2765, zoom: 12 },
  { nameAr: 'ريف دمشق', nameEn: 'Rif Dimashq', lat: 33.585, lng: 36.4, zoom: 11 },
  { nameAr: 'حلب', nameEn: 'Aleppo', lat: 36.2021, lng: 37.1343, zoom: 12 },
  { nameAr: 'حمص', nameEn: 'Homs', lat: 34.7324, lng: 36.7137, zoom: 12 },
  { nameAr: 'حماة', nameEn: 'Hama', lat: 35.1318, lng: 36.7578, zoom: 12 },
  { nameAr: 'اللاذقية', nameEn: 'Lattakia', lat: 35.5317, lng: 35.7916, zoom: 12 },
  { nameAr: 'طرطوس', nameEn: 'Tartous', lat: 34.889, lng: 35.8866, zoom: 12 },
  { nameAr: 'درعا', nameEn: 'Daraa', lat: 32.6256, lng: 36.1053, zoom: 12 },
  { nameAr: 'السويداء', nameEn: 'Sweida', lat: 32.7088, lng: 36.5694, zoom: 12 },
  { nameAr: 'الحسكة', nameEn: 'Hasakah', lat: 36.5024, lng: 40.7477, zoom: 12 },
  { nameAr: 'دير الزور', nameEn: 'Deir ez-Zor', lat: 35.3347, lng: 40.1444, zoom: 12 },
  { nameAr: 'الرقة', nameEn: 'Raqqa', lat: 35.9524, lng: 39.0079, zoom: 12 },
  { nameAr: 'إدلب', nameEn: 'Idlib', lat: 35.9306, lng: 36.6339, zoom: 12 },
  { nameAr: 'القنيطرة', nameEn: 'Quneitra', lat: 33.1256, lng: 35.8247, zoom: 12 },
];

interface MapFilterBarProps {
  offerType: MapOfferType | undefined;
  onOfferTypeChange: (type: MapOfferType | undefined) => void;
  selectedGov: string | undefined;
  onSelectGov: (gov: GovernorateLocation) => void;
  listingTypes?: { id: number; name: string }[];
  selectedTypeId: number | undefined;
  onSelectTypeId: (typeId: number | undefined) => void;
  onLocateUser: () => void;
  isLocating: boolean;
  totalPoints: number;
  loading: boolean;
  onRefresh: () => void;
  locale: string;
}

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  offerType,
  onOfferTypeChange,
  selectedGov,
  onSelectGov,
  listingTypes = [],
  selectedTypeId,
  onSelectTypeId,
  onLocateUser,
  isLocating,
  totalPoints,
  loading,
  onRefresh,
  locale,
}) => {
  const isRtl = locale === 'ar';

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-[1000] flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-xl transition-all">
      {/* Left / Top Row: Near Me + Governorate + Category */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* GPS Near Me Button */}
        <button
          type="button"
          onClick={onLocateUser}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#198341]/10 dark:bg-[#198341]/20 border border-[#198341]/30 text-[#198341] dark:text-[#ABDE3B] text-xs font-bold hover:bg-[#198341]/20 transition-all shadow-sm shrink-0"
        >
          <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
          <span>{isRtl ? 'بالقرب مني' : 'Near Me'}</span>
        </button>

        {/* Governorate / Region Selector */}
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-2xl px-2.5 py-1 shrink-0">
          <MapPin size={14} className="text-[#198341]" />
          <select
            value={selectedGov || ''}
            onChange={(e) => {
              const govName = e.target.value;
              const found = SYRIA_GOVERNORATES.find(
                (g) => g.nameAr === govName || g.nameEn === govName,
              );
              if (found) onSelectGov(found);
            }}
            className="text-xs font-bold bg-transparent text-gray-800 dark:text-zinc-200 focus:outline-none cursor-pointer py-1"
          >
            <option value="">{isRtl ? 'اختر المحافظة...' : 'Select Governorate...'}</option>
            {SYRIA_GOVERNORATES.map((g) => (
              <option key={g.nameEn} value={isRtl ? g.nameAr : g.nameEn}>
                {isRtl ? g.nameAr : g.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        {listingTypes.length > 0 && (
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-2xl px-2.5 py-1 shrink-0">
            <Compass size={14} className="text-[#198341]" />
            <select
              value={selectedTypeId || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                onSelectTypeId(val);
              }}
              className="text-xs font-bold bg-transparent text-gray-800 dark:text-zinc-200 focus:outline-none cursor-pointer py-1"
            >
              <option value="">{isRtl ? 'جميع الأقسام' : 'All Categories'}</option>
              {listingTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right / Bottom Row: Offer Type Filter Pills + Counter & Refresh */}
      <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
        {/* Offer Type Filter Pills */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl">
          {[
            { key: undefined, label: isRtl ? 'الكل' : 'All' },
            { key: 'for_sale' as MapOfferType, label: isRtl ? 'للبيع' : 'For Sale' },
            { key: 'for_rent' as MapOfferType, label: isRtl ? 'للإيجار' : 'For Rent' },
          ].map((item) => {
            const isSelected = offerType === item.key;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onOfferTypeChange(item.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[#198341] text-white shadow-sm'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Counter Badge */}
        <span className="text-xs font-bold px-3 py-1.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5 shrink-0">
          <Layers size={13} className="text-[#198341]" />
          <span>
            {totalPoints} {isRtl ? 'إعلان' : 'listings'}
          </span>
        </span>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 shrink-0"
          title={isRtl ? 'تحديث الخريطة' : 'Refresh Map'}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};
