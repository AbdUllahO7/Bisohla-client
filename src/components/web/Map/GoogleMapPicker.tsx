'use client';

/**
 * GoogleMapPicker — Web port of the mobile MapLocationPicker.
 *
 * Exactly mirrors the mobile UX:
 *  • Fixed centre-pin (map pans under it, pin tip points at the exact coord).
 *  • "Confirm Location" → calls POST /geo/reverse-geocode → shows review step.
 *  • Review step shows governorate / city / address / coordinates.
 *  • "Change" returns to map; "Confirm" calls onConfirm with the result.
 *  • "Use My Location" button re-centres to the device position.
 *
 * Falls back to Leaflet + OpenStreetMap tiles when no Google API key is configured,
 * but geocoding always uses the backend endpoint regardless.
 *
 * Designed to be loaded with next/dynamic (ssr: false).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Loader2, AlertCircle, RotateCcw, Check } from 'lucide-react';
import { reverseGeocode, ReverseGeocodeResult } from '@/utils/reverseGeocode';
import {
  SyriaGovernorate,
  SyriaCity,
  SyriaGovernorate_ARABIC_NAMES,
  SyriaCity_ARABIC_NAMES,
} from '@/core/entities/enums/syria.enums';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LocationPickerResult {
  latitude: number;
  longitude: number;
  governorate: string | null;
  city: string | null;
  address: string | null;
}

interface GoogleMapPickerProps {
  apiKey?: string | null;
  initialLat?: number | null;
  initialLng?: number | null;
  /** Called once the user has reviewed and confirmed the location. */
  onConfirm: (result: LocationPickerResult) => void;
  locale?: 'ar' | 'en';
  height?: string;
}

// Geographic centre of Syria (matches mobile DEFAULT_CENTER_LAT/LNG)
const SYRIA_CENTER = { lat: 34.8021, lng: 38.9968 };
const ZOOM_DEFAULT = 6; // Show whole country
const ZOOM_STREET = 14; // Street level when we have a known point

// ─── Region-change tracker & Pan Controller (Google Maps) ─────────────────────

const GoogleMapController: React.FC<{
  targetLocation?: { lat: number; lng: number; zoom?: number; key: number } | null;
  onCentreChange: (lat: number, lng: number) => void;
}> = ({ targetLocation, onCentreChange }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = (map as any).addListener('center_changed', () => {
      const centre = (map as any).getCenter();
      if (centre) onCentreChange(centre.lat(), centre.lng());
    });
    const clickListener = (map as any).addListener('click', (e: any) => {
      if (e.latLng) {
        (map as any).panTo(e.latLng);
        onCentreChange(e.latLng.lat(), e.latLng.lng());
      }
    });
    return () => {
      if (listener && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(listener);
      }
      if (clickListener && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(clickListener);
      }
    };
  }, [map, onCentreChange]);

  useEffect(() => {
    if (!map || !targetLocation) return;
    map.panTo({ lat: targetLocation.lat, lng: targetLocation.lng });
    const targetZoom = targetLocation.zoom ?? ZOOM_STREET;
    const currentZoom = map.getZoom() ?? ZOOM_DEFAULT;
    if (currentZoom < targetZoom) {
      map.setZoom(targetZoom);
    }
  }, [map, targetLocation]);

  return null;
};

// ─── Leaflet fallback ─────────────────────────────────────────────────────────

const LeafletMap: React.FC<{
  initialLat: number;
  initialLng: number;
  zoom: number;
  targetLocation?: { lat: number; lng: number; zoom?: number; key: number } | null;
  onCentreChange: (lat: number, lng: number) => void;
}> = ({ initialLat, initialLng, zoom, targetLocation, onCentreChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!containerRef.current || mapRef.current) return;
      const L = await import('leaflet');
      if (!mounted || !containerRef.current) return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;

      map.on('move', () => {
        const c = map.getCenter();
        onCentreChange(c.lat, c.lng);
      });

      map.on('click', (e: any) => {
        map.panTo(e.latlng, { animate: true });
        onCentreChange(e.latlng.lat, e.latlng.lng);
      });

      if (targetLocation) {
        const targetZoom = targetLocation.zoom ?? (zoom < ZOOM_STREET ? ZOOM_STREET : zoom);
        map.setView([targetLocation.lat, targetLocation.lng], targetZoom);
      }

      setTimeout(() => {
        if (mounted && mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
    };

    init();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current && targetLocation) {
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = targetLocation.zoom ?? (currentZoom < ZOOM_STREET ? ZOOM_STREET : currentZoom);
      mapRef.current.flyTo([targetLocation.lat, targetLocation.lng], targetZoom, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [targetLocation]);

  return <div ref={containerRef} className="w-full h-full" />;
};

// ─── Confirm Panel (mirrors mobile LocationConfirmPanel) ──────────────────────

const ConfirmPanel: React.FC<{
  result: LocationPickerResult;
  geocodingFailed: boolean;
  onChangeLocation: () => void;
  onFinalConfirm: () => void;
  locale: 'ar' | 'en';
}> = ({ result, geocodingFailed, onChangeLocation, onFinalConfirm, locale }) => {
  const isRtl = locale === 'ar';

  const notDetected = isRtl ? 'غير محدد' : 'Not detected';
  const govLabel = result.governorate
    ? isRtl
      ? SyriaGovernorate_ARABIC_NAMES[result.governorate as SyriaGovernorate] || result.governorate
      : result.governorate
    : notDetected;
  const cityLabel = result.city
    ? isRtl
      ? SyriaCity_ARABIC_NAMES[result.city as SyriaCity] || result.city
      : result.city
    : notDetected;
  const addressLabel = result.address ?? notDetected;
  const coordsLabel = `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`;

  return (
    <div className="flex flex-col h-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          {isRtl ? 'مراجعة الموقع' : 'Review Location'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          {isRtl
            ? 'تأكد من صحة المعلومات قبل الحفظ'
            : 'Verify the details before saving'}
        </p>
      </div>

      {/* Geocoding failed banner */}
      {geocodingFailed && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            {isRtl
              ? 'تعذّر تحديد المنطقة تلقائياً — يمكنك اختيار المحافظة والمدينة يدوياً'
              : "Couldn't auto-detect the area — you can set the governorate and city manually"}
          </p>
        </div>
      )}

      {/* Details rows */}
      <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
        {[
          { label: isRtl ? 'المحافظة' : 'Governorate', value: govLabel, highlight: !geocodingFailed && !!result.governorate },
          { label: isRtl ? 'المدينة' : 'City', value: cityLabel, highlight: !geocodingFailed && !!result.city },
          { label: isRtl ? 'العنوان' : 'Address', value: addressLabel, highlight: false },
          { label: isRtl ? 'الإحداثيات' : 'Coordinates', value: coordsLabel, highlight: false },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className={`flex items-start justify-between gap-3 py-3 px-4 rounded-xl border ${
              highlight
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                : 'bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800'
            }`}
          >
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex-shrink-0 pt-0.5">
              {label}
            </span>
            <span className={`text-sm font-bold text-right ${highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer buttons */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex gap-3">
        <button
          type="button"
          onClick={onChangeLocation}
          className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isRtl ? 'تغيير' : 'Change'}</span>
        </button>
        <button
          type="button"
          onClick={onFinalConfirm}
          className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Check className="w-4 h-4" />
          <span>{isRtl ? 'تأكيد' : 'Confirm'}</span>
        </button>
      </div>
    </div>
  );
};

// ─── Map body (mirrors mobile MapPickerBody) ──────────────────────────────────

const MapBody: React.FC<{
  apiKey?: string | null;
  initialLat: number;
  initialLng: number;
  initialZoom: number;
  targetLocation?: { lat: number; lng: number; zoom?: number; key: number } | null;
  onCentreChange: (lat: number, lng: number) => void;
  onConfirmLocation: () => void;
  onUseMyLocation: () => void;
  isConfirming: boolean;
  isLocating: boolean;
  permissionDenied: boolean;
  locale: 'ar' | 'en';
}> = ({
  apiKey,
  initialLat,
  initialLng,
  initialZoom,
  targetLocation,
  onCentreChange,
  onConfirmLocation,
  onUseMyLocation,
  isConfirming,
  isLocating,
  permissionDenied,
  locale,
}) => {
  const isRtl = locale === 'ar';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          {isRtl ? 'تحديد الموقع' : 'Pick Location'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          {isRtl ? 'حرّك الخريطة لتضع الدبوس على موقعك الدقيق' : 'Pan the map to place the pin on your exact location'}
        </p>
      </div>

      {/* Map area with fixed centre-pin overlay */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map */}
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={{ lat: initialLat, lng: initialLng }}
              defaultZoom={initialZoom}
              mapId="bishola-picker"
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              <GoogleMapController
                targetLocation={targetLocation}
                onCentreChange={onCentreChange}
              />
            </Map>
          </APIProvider>
        ) : (
          <LeafletMap
            initialLat={initialLat}
            initialLng={initialLng}
            zoom={initialZoom}
            targetLocation={targetLocation}
            onCentreChange={onCentreChange}
          />
        )}

        {/* Fixed centre pin — placed above all map tiles & controls */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 1200 }}
        >
          <div className="relative flex flex-col items-center select-none" style={{ transform: 'translateY(-50%)' }}>
            {/* Drop shadow / target dot below pin */}
            <div className="w-6 h-2 rounded-full bg-black/40 blur-[1px] mt-0.5 order-2" />
            <div className="relative order-1">
              <MapPin
                className="w-11 h-11 text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] fill-primary stroke-white stroke-[2]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Permission denied banner */}
      {permissionDenied && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            {isRtl ? 'تعذّر الوصول إلى موقعك — يُرجى السماح بالوصول في إعدادات المتصفح' : 'Location access denied — please allow it in browser settings'}
          </p>
        </div>
      )}

      {/* Footer buttons */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={isLocating}
          className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{isRtl ? 'موقعي الحالي' : 'My Location'}</span>
        </button>
        <button
          type="button"
          onClick={onConfirmLocation}
          disabled={isConfirming}
          className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isConfirming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{isRtl ? 'تأكيد الموقع' : 'Confirm Location'}</span>
        </button>
      </div>
    </div>
  );
};

// ─── Main exported component ──────────────────────────────────────────────────

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  apiKey,
  initialLat,
  initialLng,
  onConfirm,
  locale = 'ar',
  height = '420px',
}) => {
  const hasInitialPoint = initialLat != null && initialLng != null;
  const startLat = hasInitialPoint ? initialLat! : SYRIA_CENTER.lat;
  const startLng = hasInitialPoint ? initialLng! : SYRIA_CENTER.lng;
  const startZoom = hasInitialPoint ? ZOOM_STREET : ZOOM_DEFAULT;

  // Current map centre — updates as the map pans
  const centreRef = useRef({ lat: startLat, lng: startLng });
  const [targetLocation, setTargetLocation] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
    key: number;
  } | null>(null);

  // Step: 'map' | 'confirm' — mirrors mobile step state
  const [step, setStep] = useState<'map' | 'confirm'>('map');
  const [pendingResult, setPendingResult] = useState<LocationPickerResult | null>(null);
  const [geocodingFailed, setGeocodingFailed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Re-seed when edit mode supplies new coords
  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      centreRef.current = { lat: initialLat, lng: initialLng };
      setTargetLocation({ lat: initialLat, lng: initialLng, zoom: ZOOM_STREET, key: Date.now() });
    }
  }, [initialLat, initialLng]);

  const handleCentreChange = useCallback((lat: number, lng: number) => {
    centreRef.current = { lat, lng };
  }, []);

  // "Confirm Location" — reverse geocode and move to review step
  const handleConfirmLocation = useCallback(async () => {
    const { lat, lng } = centreRef.current;
    setIsConfirming(true);
    let result: LocationPickerResult;
    try {
      const geo = await reverseGeocode(lat, lng, locale);
      result = {
        latitude: lat,
        longitude: lng,
        governorate: geo.governorate,
        city: geo.city,
        address: geo.address,
      };
    } catch {
      result = { latitude: lat, longitude: lng, governorate: null, city: null, address: null };
    }
    setIsConfirming(false);
    setPendingResult(result);
    setGeocodingFailed(result.governorate == null);
    setStep('confirm');
  }, [locale]);

  // "Change" — go back to map
  const handleChangeLocation = useCallback(() => {
    setStep('map');
    setPendingResult(null);
  }, []);

  // "Confirm" on the review panel — commit to form
  const handleFinalConfirm = useCallback(() => {
    if (!pendingResult) return;
    onConfirm(pendingResult);
    // Keep on confirm step (parent will close/hide the picker)
  }, [onConfirm, pendingResult]);

  // "Use My Location"
  const handleUseMyLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        centreRef.current = { lat, lng };
        setTargetLocation({ lat, lng, zoom: ZOOM_STREET, key: Date.now() });
      },
      () => {
        setIsLocating(false);
        setPermissionDenied(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 relative isolate z-0"
      style={{ height }}
    >
      <MapBody
        apiKey={apiKey}
        initialLat={startLat}
        initialLng={startLng}
        initialZoom={startZoom}
        targetLocation={targetLocation}
        onCentreChange={handleCentreChange}
        onConfirmLocation={handleConfirmLocation}
        onUseMyLocation={handleUseMyLocation}
        isConfirming={isConfirming}
        isLocating={isLocating}
        permissionDenied={permissionDenied}
        locale={locale}
      />
      {step === 'confirm' && pendingResult && (
        <div className="absolute inset-0 z-20 bg-white dark:bg-zinc-900 flex flex-col">
          <ConfirmPanel
            result={pendingResult}
            geocodingFailed={geocodingFailed}
            onChangeLocation={handleChangeLocation}
            onFinalConfirm={handleFinalConfirm}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker;
