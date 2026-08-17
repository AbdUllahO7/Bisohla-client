'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster from 'supercluster';
import { ListingMapPoint } from '@/core/entities/models/listings/map.dto';

interface LeafletMapViewProps {
  points: ListingMapPoint[];
  selectedPoint: ListingMapPoint | null;
  onSelectPoint: (point: ListingMapPoint) => void;
  onBoundsChange: (bbox: string) => void;
  center: { lat: number; lng: number; zoom: number };
  locale: string;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  points,
  selectedPoint,
  onSelectPoint,
  onBoundsChange,
  center,
  locale,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<Supercluster | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const isRtl = locale === 'ar';

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Map Instance centered at default coordinates (Damascus / Syria)
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: center.zoom,
      zoomControl: false,
    });

    // Add CartoDB Voyager tiles (smooth modern tile layer)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Add Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Map moveend listener to emit bbox
    const handleMoveEnd = () => {
      if (!mapRef.current) return;
      const bounds = mapRef.current.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bboxStr = `${sw.lng.toFixed(6)},${sw.lat.toFixed(6)},${ne.lng.toFixed(6)},${ne.lat.toFixed(6)}`;
      onBoundsChange(bboxStr);
      updateClustersAndMarkers();
    };

    map.on('moveend', handleMoveEnd);

    // Initial bbox emit
    handleMoveEnd();

    return () => {
      map.off('moveend', handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when center prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([center.lat, center.lng], center.zoom, {
        duration: 1.2,
      });
    }
  }, [center.lat, center.lng, center.zoom]);

  // Update Supercluster index & markers when points change
  useEffect(() => {
    const geojsonPoints: Supercluster.PointFeature<any>[] = points.map((p) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        listing: p,
        listingId: p.id,
      },
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
    }));

    const supercluster = new Supercluster({
      radius: 45,
      maxZoom: 16,
    });
    supercluster.load(geojsonPoints);
    clusterRef.current = supercluster;

    updateClustersAndMarkers();
  }, [points, selectedPoint]);

  const updateClustersAndMarkers = () => {
    if (!mapRef.current || !markersGroupRef.current || !clusterRef.current) return;

    markersGroupRef.current.clearLayers();

    const bounds = mapRef.current.getBounds();
    const zoom = Math.floor(mapRef.current.getZoom());
    const bbox: [number, number, number, number] = [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat,
      bounds.getNorthEast().lng,
      bounds.getNorthEast().lat,
    ];

    const clusters = clusterRef.current.getClusters(bbox, zoom);

    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const isCluster = feature.properties.cluster;

      if (isCluster) {
        const count = feature.properties.point_count;
        const clusterId = feature.properties.cluster_id;

        const clusterIcon = L.divIcon({
          html: `<div class="w-9 h-9 rounded-full bg-[#ABDE3B] text-black font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-xl transform transition-transform hover:scale-110">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([lat, lng], { icon: clusterIcon });
        marker.on('click', () => {
          if (!clusterRef.current || !mapRef.current) return;
          const expansionZoom = Math.min(clusterRef.current.getClusterExpansionZoom(clusterId), 18);
          mapRef.current.flyTo([lat, lng], expansionZoom, { duration: 0.8 });
        });
        markersGroupRef.current?.addLayer(marker);
      } else {
        const listing: ListingMapPoint = feature.properties.listing;
        const isSelected = selectedPoint?.id === listing.id;

        const pinColor =
          listing.listingOfferType === 'for_sale'
            ? '#ABDE3B'
            : listing.listingOfferType === 'for_rent'
            ? '#3B82F6'
            : '#10B981';

        const markerHtml = `
          <div class="relative group cursor-pointer">
            <div class="px-2.5 py-1 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1 border-2 transition-transform transform ${
              isSelected
                ? 'scale-125 bg-black text-white border-[#ABDE3B] z-50'
                : 'bg-white text-gray-900 border-gray-200 hover:scale-110'
            }">
              <span class="w-2 h-2 rounded-full" style="background-color: ${pinColor}"></span>
              <span class="font-extrabold line-clamp-1">${listing.price ? listing.price : (isRtl ? 'إعلان' : 'Listing')}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-listing-pin',
          iconSize: [80, 32],
          iconAnchor: [40, 16],
        });

        const marker = L.marker([lat, lng], { icon });
        marker.on('click', () => {
          onSelectPoint(listing);
        });
        markersGroupRef.current?.addLayer(marker);
      }
    });
  };

  return <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />;
};

export default LeafletMapView;
