'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import Image from 'next/image';
import { RotateCcw, Images, ZoomIn, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Hotspot {
  id: string;
  /** Short label shown in the pulse ring and popup header */
  label: string;
  /** Optional longer description shown in the popup body */
  description?: string;
  /** Percentage from left edge (0–100) */
  x: number;
  /** Percentage from top edge (0–100) */
  y: number;
  /** Optional close-up image URL shown inside the popup */
  zoomImageUrl?: string;
}

export interface ProductImageViewerProps {
  /** Ordered list of all image URLs (used as 360° frames when ≥ 2) */
  images: string[];
  /** Index of the image to show first in Photo mode (default 0) */
  primaryIndex?: number;
  /** Optional interactive hotspot annotations */
  hotspots?: Hotspot[];
  /** Alt text prefix for accessibility */
  altPrefix?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap an index so it loops around the frame array */
function wrapIndex(i: number, len: number) {
  return ((i % len) + len) % len;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ProductImageViewer: React.FC<ProductImageViewerProps> = ({
  images,
  primaryIndex = 0,
  hotspots = [],
  altPrefix = 'Vehicle',
}) => {
  type ViewMode = 'photo' | '360';

  const [mode, setMode] = useState<ViewMode>('photo');
  const [frameIndex, setFrameIndex] = useState(primaryIndex);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // 360° drag state
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);
  const [isDraggingState, setIsDraggingState] = useState(false); // for cursor style

  const has360 = images.length >= 2;
  const currentSrc = images[wrapIndex(frameIndex, images.length)] ?? images[0] ?? '/placeholder.svg';
  const activeHotspotData = hotspots.find((h) => h.id === activeHotspot) ?? null;

  // Sync primaryIndex changes (e.g. thumbnail click from parent)
  useEffect(() => {
    setFrameIndex(primaryIndex);
  }, [primaryIndex]);

  // Reset to photo mode if images change
  useEffect(() => {
    if (images.length < 2) setMode('photo');
  }, [images.length]);

  // -------------------------------------------------------------------------
  // 360° drag handlers
  // -------------------------------------------------------------------------

  const computeFrame = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const deltaX = clientX - dragStartX.current;
      // Sensitivity: one full drag across the container = one full revolution
      const frameDelta = Math.round((deltaX / width) * images.length);
      setFrameIndex(wrapIndex(dragStartFrame.current - frameDelta, images.length));
    },
    [images.length],
  );

  const onMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (mode !== '360') return;
      isDragging.current = true;
      setIsDraggingState(true);
      dragStartX.current = e.clientX;
      dragStartFrame.current = frameIndex;
    },
    [mode, frameIndex],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      computeFrame(e.clientX);
    },
    [computeFrame],
  );

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    setIsDraggingState(false);
  }, []);

  const onTouchStart = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (mode !== '360') return;
      isDragging.current = true;
      dragStartX.current = e.touches[0].clientX;
      dragStartFrame.current = frameIndex;
    },
    [mode, frameIndex],
  );

  const onTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      computeFrame(e.touches[0].clientX);
    },
    [computeFrame],
  );

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // -------------------------------------------------------------------------
  // Hotspot popup position logic (flip if too close to right/bottom edge)
  // -------------------------------------------------------------------------

  function popupPlacement(hotspot: Hotspot): string {
    const right = hotspot.x > 55;
    const bottom = hotspot.y > 60;
    if (right && bottom) return 'right-6 bottom-6 origin-bottom-right';
    if (right) return 'right-6 top-6 origin-top-right';
    if (bottom) return 'left-6 bottom-6 origin-bottom-left';
    return 'left-6 top-6 origin-top-left';
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="relative w-full select-none group/viewer">
      {/* ------------------------------------------------------------------ */}
      {/* Mode toggle bar                                                     */}
      {/* ------------------------------------------------------------------ */}
      {has360 && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-xl p-1">
          <button
            title="Photo mode"
            onClick={() => setMode('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === 'photo'
                ? 'bg-white text-gray-900 shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Images size={13} />
            Photos
          </button>
          <button
            title="360° spin mode"
            onClick={() => setMode('360')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === '360'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <RotateCcw size={13} />
            360°
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Image container                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-xl ${
          mode === '360'
            ? isDraggingState
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Main image */}
        <Image
          src={currentSrc}
          alt={`${altPrefix} – frame ${frameIndex + 1}`}
          width={700}
          height={500}
          draggable={false}
          className={`w-full object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[520px] transition-opacity duration-150 ${
            isDraggingState ? 'opacity-90' : 'opacity-100'
          }`}
          priority
        />

        {/* 360° overlay hint (fades after pointer enters) */}
        {mode === '360' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover/viewer:opacity-0 animate-[fadeOut_2s_ease-in-out_forwards] flex flex-col items-center gap-2">
              {/* shown only initially */}
            </div>
            {/* Persistent frame counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
              <RotateCcw size={11} className="animate-spin-slow" />
              {frameIndex + 1} / {images.length}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Hotspot layer (only in photo mode)                               */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'photo' &&
          hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="absolute z-10"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />

              {/* Hotspot button */}
              <button
                title={hotspot.label}
                onClick={() =>
                  setActiveHotspot((prev) =>
                    prev === hotspot.id ? null : hotspot.id,
                  )
                }
                className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-200 ${
                  activeHotspot === hotspot.id
                    ? 'bg-emerald-500 border-white scale-110'
                    : 'bg-black/60 border-emerald-400 hover:bg-emerald-500 hover:border-white hover:scale-110 backdrop-blur-sm'
                }`}
              >
                <ZoomIn size={13} className="text-white" />
              </button>

              {/* Popup */}
              {activeHotspot === hotspot.id && (
                <div
                  className={`absolute z-30 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden animate-in zoom-in-95 fade-in duration-200 ${popupPlacement(hotspot)}`}
                >
                  {/* Close */}
                  <button
                    title="Close hotspot"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors z-10"
                  >
                    <X size={13} />
                  </button>

                  {/* Optional zoom image */}
                  {hotspot.zoomImageUrl && (
                    <div className="relative h-32 w-full">
                      <Image
                        src={hotspot.zoomImageUrl}
                        alt={hotspot.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Text body */}
                  <div className="p-3 pr-7">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
                      {hotspot.label}
                    </p>
                    {hotspot.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {hotspot.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 360° drag instruction strip (below image)                          */}
      {/* ------------------------------------------------------------------ */}
      {mode === '360' && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
          <RotateCcw size={12} />
          <span>Drag left or right to rotate the vehicle</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Frame scrubber (360° mode)                                         */}
      {/* ------------------------------------------------------------------ */}
      {mode === '360' && images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1 flex-wrap px-2">
          {images.map((_, i) => (
            <button
              key={i}
              title={`Frame ${i + 1}`}
              onClick={() => setFrameIndex(i)}
              className={`h-1 rounded-full transition-all duration-200 ${
                i === frameIndex
                  ? 'bg-emerald-500 w-5'
                  : 'bg-gray-300 dark:bg-zinc-600 hover:bg-emerald-300 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageViewer;
