'use client';

import React from 'react';
import { MapPin, Filter, Tag, Layers, RefreshCw } from 'lucide-react';
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
  totalPoints,
  loading,
  onRefresh,
  locale,
}) => {
  const isRtl = locale === 'ar';

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-[1000] flex flex-col sm:flex-row items-center gap-2.5 p-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl shadow-lg transition-all">
      {/* Governorate / Location Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none py-1 px-1 w-full sm:w-auto">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0 px-1">
          <MapPin className="w-3.5 h-3.5 text-[#8CBD2A] dark:text-[#ABDE3B]" />
          <span>{isRtl ? 'المنطقة:' : 'Region:'}</span>
        </span>
        <select
          value={selectedGov || ''}
          onChange={(e) => {
            const govName = e.target.value;
            const found = SYRIA_GOVERNORATES.find((g) => g.nameAr === govName || g.nameEn === govName);
            if (found) onSelectGov(found);
          }}
          className="text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ABDE3B] cursor-pointer"
        >
          <option value="">{isRtl ? 'اختر المحافظة...' : 'Select Governorate...'}</option>
          {SYRIA_GOVERNORATES.map((g) => (
            <option key={g.nameEn} value={isRtl ? g.nameAr : g.nameEn}>
              {isRtl ? g.nameAr : g.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Offer Type Filter Pills */}
      <div className="flex items-center gap-1 shrink-0 bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl">
        <button
          onClick={() => onOfferTypeChange(undefined)}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
            offerType === undefined
              ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          {isRtl ? 'الكل' : 'All'}
        </button>
        <button
          onClick={() => onOfferTypeChange('for_sale')}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
            offerType === 'for_sale'
              ? 'bg-[#ABDE3B] text-black shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          {isRtl ? 'للبيع' : 'For Sale'}
        </button>
        <button
          onClick={() => onOfferTypeChange('for_rent')}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
            offerType === 'for_rent'
              ? 'bg-[#8CBD2A] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          {isRtl ? 'للإيجار' : 'For Rent'}
        </button>
      </div>

      {/* Category Dropdown (if available) */}
      {listingTypes.length > 0 && (
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={selectedTypeId || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onSelectTypeId(val);
            }}
            className="text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ABDE3B] cursor-pointer"
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

      {/* Marker Counter & Refresh Button */}
      <div className="ml-auto mr-auto sm:ml-auto sm:mr-0 flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#ABDE3B]" />
          <span>{totalPoints} {isRtl ? 'إعلان عل الخريطة' : 'on map'}</span>
        </span>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          title={isRtl ? 'تحديث الخريطة' : 'Refresh Map'}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
