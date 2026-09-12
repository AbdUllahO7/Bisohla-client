'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  getMapListingsAction,
  getListingCardAction,
} from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import { ListingMapPoint, MapOfferType } from '@/core/entities/models/listings/map.dto';
import { MapFilterBar, GovernorateLocation } from './MapFilterBar';
import { MapListingPreviewCard } from './MapListingPreviewCard';
import { MapPin, MapPinOff } from 'lucide-react';
import { getInjection } from '@/di/container';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/providers/settings.provider';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

const LeafletMapView = dynamic(() => import('./LeafletMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center text-gray-500 gap-3">
      <MapPin className="w-10 h-10 text-[#198341] animate-bounce" />
      <span className="text-sm font-bold animate-pulse">
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
  listingTypes: initialListingTypes = [],
  locale,
}) => {
  const isRtl = locale === 'ar';
  const { toast } = useToast();
  const { isMapEnabled, getMapSettings, getGoogleMapsApiKey, getGoogleGeocodingApiKey, isLoading: isSettingsLoading } = useSettings();
  const mapEnabled = isMapEnabled();
  const mapSettings = getMapSettings();
  const mapApiKey = getGoogleGeocodingApiKey() || getGoogleMapsApiKey();

  const [availableTypes, setAvailableTypes] = useState<{ id: number; name: string }[]>(
    initialListingTypes,
  );
  const [bbox, setBbox] = useState<string>('');
  const [offerType, setOfferType] = useState<MapOfferType | undefined>(undefined);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(initialTypeId);
  const [selectedGov, setSelectedGov] = useState<string | undefined>(undefined);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [center, setCenter] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: mapSettings?.default_center_lat ?? 33.5138,
    lng: mapSettings?.default_center_lng ?? 36.2765,
    zoom: mapSettings?.default_zoom ?? 12,
  });

  // Sync center from settings once available
  useEffect(() => {
    if (mapSettings?.default_center_lat && mapSettings?.default_center_lng) {
      setCenter((prev) => ({
        ...prev,
        lat: mapSettings.default_center_lat!,
        lng: mapSettings.default_center_lng!,
        zoom: mapSettings.default_zoom || prev.zoom,
      }));
    }
  }, [mapSettings?.default_center_lat, mapSettings?.default_center_lng, mapSettings?.default_zoom]);

  const [points, setPoints] = useState<ListingMapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ListingMapPoint | null>(null);
  const [cardDetail, setCardDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCard, setLoadingCard] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch listing types if not provided
  useEffect(() => {
    if (availableTypes.length === 0) {
      const fetchTypes = async () => {
        try {
          const controller = getInjection('IListingTypesRepoController');
          const res = await controller.getListingTypes(1, 100);
          if (res.success && res.data) {
            setAvailableTypes(
              res.data.data
                .filter((t: any) => t.isActive)
                .map((t: any) => ({
                  id: t.id,
                  name:
                    t.translations?.find((tr: any) => tr.locale === locale)?.name || t.name,
                })),
            );
          }
        } catch {
          // silently ignore
        }
      };
      fetchTypes();
    }
  }, [availableTypes.length, locale]);

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

        const data = res?.data || res || [];
        setPoints(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching map listings:', err);
      } finally {
        setLoading(false);
      }
    },
    [offerType, selectedTypeId],
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
    [fetchPoints],
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

  // GPS Locate User
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      toast({
        title: isRtl ? 'الموقع غير مدعوم' : 'Geolocation Unsupported',
        description: isRtl
          ? 'المتصفح الخاص بك لا يدعم تحديد الموقع'
          : 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setCenter({
          lat: latitude,
          lng: longitude,
          zoom: 14,
        });
        setSelectedGov(undefined);
        toast({
          title: isRtl ? 'تم تحديد موقعك' : 'Location Found',
          description: isRtl ? 'تم تحريك الخريطة إلى موقعك الحالي' : 'Centered map on your current location.',
        });
      },
      () => {
        setIsLocating(false);
        toast({
          title: isRtl ? 'تعذر تحديد الموقع' : 'Location Error',
          description: isRtl
            ? 'يرجى التأكد من تفعيل إذن الموقع في متصفحك'
            : 'Please ensure location permissions are enabled in your browser.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  if (!isSettingsLoading && !mapEnabled) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-cairo">
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm border border-emerald-100 dark:border-zinc-800">
          <MapPinOff className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
          {isRtl ? 'الخريطة التفاعلية غير مفعلة حالياً' : 'Interactive Map is Currently Disabled'}
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 max-w-md mb-6 text-sm sm:text-base leading-relaxed">
          {isRtl
            ? 'تم تعطيل خدمة استعراض الإعلانات عبر الخريطة من قبل إدارة الموقع. يمكنك استعراض كافة الإعلانات عبر صفحة المنتجات.'
            : 'Interactive map listing exploration is currently turned off in the settings. You can still browse all listings on the products page.'}
        </p>
        <Link href="/products">
          <Button className="bg-[#198341] hover:bg-[#156e36] text-white rounded-xl px-6 py-2.5 font-semibold shadow-md">
            {isRtl ? 'تصفح الإعلانات' : 'Browse Listings'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[600px] overflow-hidden bg-gray-50 dark:bg-zinc-950 font-cairo">
      {/* Top Filter Bar */}
      <MapFilterBar
        offerType={offerType}
        onOfferTypeChange={setOfferType}
        selectedGov={selectedGov}
        onSelectGov={handleSelectGov}
        listingTypes={availableTypes}
        selectedTypeId={selectedTypeId}
        onSelectTypeId={setSelectedTypeId}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
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
        apiKey={mapApiKey}
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
