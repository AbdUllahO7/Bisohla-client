'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getMapListingsAction, getListingCardAction } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import { ListingMapPoint, MapOfferType } from '@/core/entities/models/listings/map.dto';
import { MapFilterBar, GovernorateLocation } from './MapFilterBar';
import { MapListingPreviewCard } from './MapListingPreviewCard';
import { MapPin } from 'lucide-react';

const LeafletMapView = dynamic(() => import('./LeafletMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center text-gray-500 gap-3">
      <MapPin className="w-10 h-10 text-[#ABDE3B] animate-bounce" />
      <span className="text-sm font-bold animate-pulse font-cairo">
        جاري تحميل خريطة الإعلانات التفاعلية...
      </span>
    </div>
  ),
});

interface InteractiveMapContainerProps {
  initialTypeId?: number;
  listingTypes?: { id: number; name: string }[];
  locale: string;
}

export const InteractiveMapContainer: React.FC<InteractiveMapContainerProps> = ({
  initialTypeId,
  listingTypes = [],
  locale,
}) => {
  const isRtl = locale === 'ar';

  const [bbox, setBbox] = useState<string>('');
  const [offerType, setOfferType] = useState<MapOfferType | undefined>(undefined);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(initialTypeId);
  const [selectedGov, setSelectedGov] = useState<string | undefined>(undefined);
  const [center, setCenter] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 33.5138,
    lng: 36.2765,
    zoom: 12,
  });

  const [points, setPoints] = useState<ListingMapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ListingMapPoint | null>(null);
  const [cardDetail, setCardDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCard, setLoadingCard] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch points from backend when bbox, offerType, or selectedTypeId change
  const fetchPoints = useCallback(
    async (currentBbox: string) => {
      if (!currentBbox) return;
      setLoading(true);
      try {
        const res = await getMapListingsAction({
          bbox: currentBbox,
          offerType,
          typeId: selectedTypeId,
        });

        // unwrap data
        const data = res?.data || res || [];
        setPoints(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching map listings:', err);
      } finally {
        setLoading(false);
      }
    },
    [offerType, selectedTypeId]
  );

  // Debounced bbox handler
  const handleBoundsChange = useCallback(
    (newBbox: string) => {
      setBbox(newBbox);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        fetchPoints(newBbox);
      }, 400);
    },
    [fetchPoints]
  );

  // Re-fetch when offerType or selectedTypeId changes
  useEffect(() => {
    if (bbox) {
      fetchPoints(bbox);
    }
  }, [offerType, selectedTypeId, fetchPoints]);

  // Handle marker selection & card detail fetch
  const handleSelectPoint = async (point: ListingMapPoint) => {
    setSelectedPoint(point);
    setCardDetail(null);
    setLoadingCard(true);

    try {
      if (point.slug) {
        const cardRes = await getListingCardAction(point.slug);
        const cardData = cardRes?.data || cardRes;
        setCardDetail(cardData);
      }
    } catch (err) {
      console.error('Error fetching listing card details:', err);
    } finally {
      setLoadingCard(false);
    }
  };

  const handleSelectGov = (gov: GovernorateLocation) => {
    setSelectedGov(isRtl ? gov.nameAr : gov.nameEn);
    setCenter({
      lat: gov.lat,
      lng: gov.lng,
      zoom: gov.zoom,
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[600px] overflow-hidden bg-gray-50 dark:bg-zinc-950 font-cairo">
      {/* Top Filter Bar */}
      <MapFilterBar
        offerType={offerType}
        onOfferTypeChange={setOfferType}
        selectedGov={selectedGov}
        onSelectGov={handleSelectGov}
        listingTypes={listingTypes}
        selectedTypeId={selectedTypeId}
        onSelectTypeId={setSelectedTypeId}
        totalPoints={points.length}
        loading={loading}
        onRefresh={() => bbox && fetchPoints(bbox)}
        locale={locale}
      />

      {/* Leaflet Map View */}
      <LeafletMapView
        points={points}
        selectedPoint={selectedPoint}
        onSelectPoint={handleSelectPoint}
        onBoundsChange={handleBoundsChange}
        center={center}
        locale={locale}
      />

      {/* Bottom Listing Card Drawer */}
      <MapListingPreviewCard
        listing={selectedPoint}
        cardDetail={cardDetail}
        loadingCard={loadingCard}
        onClose={() => {
          setSelectedPoint(null);
          setCardDetail(null);
        }}
        locale={locale}
      />
    </div>
  );
};
