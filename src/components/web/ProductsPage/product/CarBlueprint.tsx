'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

// Helper to normalize zone strings for mapping
export const normalizeZone = (zone: string | undefined | null) => {
  return zone ? zone.toString().toLowerCase().replace(/[\s_-]/g, '') : '';
};

// Returns an inline style object for damage fill colors
export const getDamageStyle = (typeId: string | undefined | null): { fill?: string; opacity?: number } => {
  if (!typeId) return {};
  const id = typeId.toLowerCase();

  if (id.includes('paint') || id.includes('طلاء')) {
    return { fill: '#10b981', opacity: 0.55 }; // Emerald semi-transparent
  }
  if (id.includes('scratch') || id.includes('خدش')) {
    return { fill: '#ef4444', opacity: 0.55 }; // Red semi-transparent
  }
  if (id.includes('replacement') || id.includes('استبدال')) {
    return { fill: '#a855f7', opacity: 0.55 }; // Purple semi-transparent
  }
  return { fill: '#f59e0b', opacity: 0.55 }; // Amber fallback
};

// Helper to get fill colors for damage types (kept for backward compat)
export const getDamageColorClass = (typeId: string | undefined | null) => {
  if (!typeId) return 'fill-transparent';
  const id = typeId.toLowerCase();
  if (id.includes('paint') || id.includes('طلاء')) return 'fill-emerald-500/50';
  if (id.includes('scratch') || id.includes('خدش')) return 'fill-red-500/50';
  if (id.includes('replacement') || id.includes('استبدال')) return 'fill-purple-500/50';
  return 'fill-amber-500/50';
};

interface BlueprintPart {
  id: string;
  schemaId: string;
  nameEn: string;
  nameAr: string;
  path: string;
  labelX?: number;
  labelY?: number;
}

interface CarBlueprintProps {
  damages?: any[];
  selectedZone?: string | null;
  onZoneSelect?: (schemaId: string, label: string) => void;
  isInteractive?: boolean;
}

const CarBlueprint: React.FC<CarBlueprintProps> = ({
  damages = [],
  selectedZone,
  onZoneSelect,
  isInteractive = false,
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // ─── Realistic top-down car silhouette (viewBox 0 0 200 424) ───────────────
  const parts: BlueprintPart[] = [
    // ── FRONT BUMPER ──────────────────────────────────────────────────────────
    {
      id: 'frontbumper',
      schemaId: 'front_bumper',
      nameEn: 'Front Bumper',
      nameAr: 'المصد الأمامي',
      path: 'M 66,20 Q 100,6 134,20 L 132,36 Q 100,24 68,36 Z',
      labelX: 100, labelY: 28,
    },
    // ── LEFT HEADLIGHT ────────────────────────────────────────────────────────
    {
      id: 'leftheadlight',
      schemaId: 'left_headlight',
      nameEn: 'Left Headlight',
      nameAr: 'المصباح الأمامي الأيسر',
      path: 'M 46,28 Q 55,22 68,26 L 68,36 Q 56,34 48,38 Z',
      labelX: 56, labelY: 32,
    },
    // ── RIGHT HEADLIGHT ───────────────────────────────────────────────────────
    {
      id: 'rightheadlight',
      schemaId: 'right_headlight',
      nameEn: 'Right Headlight',
      nameAr: 'المصباح الأمامي الأيمن',
      path: 'M 154,28 Q 145,22 132,26 L 132,36 Q 144,34 152,38 Z',
      labelX: 144, labelY: 32,
    },
    // ── FRONT GRILL ───────────────────────────────────────────────────────────
    {
      id: 'frontgrill',
      schemaId: 'front_grill',
      nameEn: 'Front Grill',
      nameAr: 'الشبك الأمامي',
      path: 'M 68,26 Q 100,18 132,26 L 132,36 Q 100,28 68,36 Z',
      labelX: 100, labelY: 31,
    },
    // ── HOOD ──────────────────────────────────────────────────────────────────
    {
      id: 'hood',
      schemaId: 'Hood',
      nameEn: 'Hood',
      nameAr: 'غطاء المحرك',
      path: 'M 48,38 Q 100,24 152,38 L 148,120 Q 100,112 52,120 Z',
      labelX: 100, labelY: 80,
    },
    // ── LEFT FRONT FENDER ─────────────────────────────────────────────────────
    {
      id: 'leftfrontfender',
      schemaId: 'Left Front Fender',
      nameEn: 'Left Front Fender',
      nameAr: 'الرفرف الأمامي الأيسر',
      path: 'M 28,42 Q 48,38 52,120 L 38,122 Q 22,80 26,46 Z',
      labelX: 36, labelY: 80,
    },
    // ── RIGHT FRONT FENDER ────────────────────────────────────────────────────
    {
      id: 'rightfrontfender',
      schemaId: 'Right Front Fender',
      nameEn: 'Right Front Fender',
      nameAr: 'الرفرف الأمامي الأيمن',
      path: 'M 172,42 Q 152,38 148,120 L 162,122 Q 178,80 174,46 Z',
      labelX: 164, labelY: 80,
    },
    // ── LEFT FRONT DOOR ───────────────────────────────────────────────────────
    {
      id: 'leftfrontdoor',
      schemaId: 'Left Front Door',
      nameEn: 'Left Front Door',
      nameAr: 'الباب الأمامي الأيسر',
      path: 'M 24,126 L 52,122 L 52,210 L 24,210 Z',
      labelX: 36, labelY: 168,
    },
    // ── RIGHT FRONT DOOR ──────────────────────────────────────────────────────
    {
      id: 'rightfrontdoor',
      schemaId: 'Right Front Door',
      nameEn: 'Right Front Door',
      nameAr: 'الباب الأمامي الأيمن',
      path: 'M 176,126 L 148,122 L 148,210 L 176,210 Z',
      labelX: 164, labelY: 168,
    },
    // ── LEFT REAR DOOR ────────────────────────────────────────────────────────
    {
      id: 'leftreardoor',
      schemaId: 'Left Rear Door',
      nameEn: 'Left Rear Door',
      nameAr: 'الباب الخلفي الأيسر',
      path: 'M 24,214 L 52,214 L 52,300 L 24,300 Z',
      labelX: 36, labelY: 258,
    },
    // ── RIGHT REAR DOOR ───────────────────────────────────────────────────────
    {
      id: 'rightreardoor',
      schemaId: 'Right Rear Door',
      nameEn: 'Right Rear Door',
      nameAr: 'الباب الخلفي الأيمن',
      path: 'M 176,214 L 148,214 L 148,300 L 176,300 Z',
      labelX: 164, labelY: 258,
    },
    // ── ROOF ──────────────────────────────────────────────────────────────────
    {
      id: 'roof',
      schemaId: 'Roof',
      nameEn: 'Roof',
      nameAr: 'السقف',
      path: 'M 56,126 L 144,126 L 144,300 L 56,300 Z',
      labelX: 100, labelY: 214,
    },
    // ── LEFT REAR FENDER ──────────────────────────────────────────────────────
    {
      id: 'leftrearfender',
      schemaId: 'Left Rear Fender',
      nameEn: 'Left Rear Fender',
      nameAr: 'الرفرف الخلفي الأيسر',
      path: 'M 24,304 L 52,304 Q 46,370 32,374 L 22,340 Z',
      labelX: 34, labelY: 342,
    },
    // ── RIGHT REAR FENDER ─────────────────────────────────────────────────────
    {
      id: 'rightrearfender',
      schemaId: 'Right Rear Fender',
      nameEn: 'Right Rear Fender',
      nameAr: 'الرفرف الخلفي الأيمن',
      path: 'M 176,304 L 148,304 Q 154,370 168,374 L 178,340 Z',
      labelX: 166, labelY: 342,
    },
    // ── TRUNK ─────────────────────────────────────────────────────────────────
    {
      id: 'trunk',
      schemaId: 'trunk',
      nameEn: 'Trunk',
      nameAr: 'الصندوق الخلفي',
      path: 'M 56,304 L 144,304 Q 148,370 140,388 Q 100,396 60,388 Q 52,370 56,304 Z',
      labelX: 100, labelY: 350,
    },
    // ── LEFT TAILLIGHT ────────────────────────────────────────────────────────
    {
      id: 'lefttaillight',
      schemaId: 'left_taillight',
      nameEn: 'Left Taillight',
      nameAr: 'المصباح الخلفي الأيسر',
      path: 'M 32,374 Q 46,370 52,384 Q 42,390 30,384 Z',
      labelX: 41, labelY: 381,
    },
    // ── RIGHT TAILLIGHT ───────────────────────────────────────────────────────
    {
      id: 'righttaillight',
      schemaId: 'right_taillight',
      nameEn: 'Right Taillight',
      nameAr: 'المصباح الخلفي الأيمن',
      path: 'M 168,374 Q 154,370 148,384 Q 158,390 170,384 Z',
      labelX: 159, labelY: 381,
    },
    // ── REAR BUMPER ───────────────────────────────────────────────────────────
    {
      id: 'rearbumper',
      schemaId: 'rear_bumper',
      nameEn: 'Rear Bumper',
      nameAr: 'المصد الخلفي',
      path: 'M 30,384 Q 100,404 170,384 L 168,394 Q 100,414 32,394 Z',
      labelX: 100, labelY: 396,
    },
  ];

  // Helper to find damage info for a part
  const getPartDamage = (part: BlueprintPart) => {
    return damages.find((d) => {
      const zoneName = d.damage_zone || d.damageZone || '';
      return normalizeZone(zoneName) === part.id;
    });
  };

  const isDark = typeof window !== 'undefined'
    ? document.documentElement.classList.contains('dark')
    : false;



  return (
    <div className="w-full flex flex-col items-center justify-center select-none">
      <svg
        viewBox="0 0 200 424"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxHeight: 440 }}
      >
        <defs>
          {/* Subtle body gradient for depth - Light mode (Silver/Platinum metallic) */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="1" />
            <stop offset="25%" stopColor="#f1f5f9" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#f1f5f9" stopOpacity="1" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="1" />
          </linearGradient>
          
          {/* Body gradient - Dark mode (Slate/Steel metallic) */}
          <linearGradient id="bodyGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
            <stop offset="25%" stopColor="#334155" stopOpacity="1" />
            <stop offset="50%" stopColor="#475569" stopOpacity="1" />
            <stop offset="75%" stopColor="#334155" stopOpacity="1" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="1" />
          </linearGradient>



          {/* Windshield & Windows anti-reflective glass gradient */}
          <radialGradient id="glassGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </radialGradient>
          
          {/* Taillight LED Bar Gradient */}
          <linearGradient id="taillightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="20%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="80%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Honeycomb Pattern for Front Grille & Air Intakes */}
          <pattern id="grilleHoneycomb" width="3" height="5" patternUnits="userSpaceOnUse">
            <path d="M 1.5,0 L 3,1 L 3,3.5 L 1.5,4.5 L 0,3.5 L 0,1 Z" fill="none" stroke="#ffffff" strokeWidth="0.35" />
          </pattern>

          {/* Interactive panel glow */}
          <filter id="panel-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ABDE3B" floodOpacity="0.95" />
          </filter>
          
          <filter id="damage-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.3" />
          </filter>

          {/* Headlight projector bulb glow */}
          <filter id="headlightglow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.8"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Taillight LED strip glow */}
          <filter id="taillightglow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.8"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Main Car Soft Shadow */}
          <filter id="car-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* ─── LAYER 1: DETAILED REALISTIC VEHICLE BASE (Pointer Events Blocked) ─── */}
        <g style={{ pointerEvents: 'none' }} filter="url(#car-shadow)">
          
          {/* LIGHT MODE CAR BODY */}
          <g className="dark:opacity-0 opacity-100" style={{ transition: 'opacity 0.3s' }}>
            {/* Metallic Body Shell */}
            <path
              d="M 28,42 C 28,42 45,18 100,18 C 155,18 172,42 172,42 C 172,42 182,75 180,120 C 178,165 182,210 180,255 C 178,300 182,330 178,345 C 174,360 170,375 170,375 C 170,375 160,396 100,396 C 40,396 30,375 30,375 C 30,375 26,360 22,345 C 18,330 22,300 20,255 C 18,210 22,165 20,120 C 18,75 28,42 28,42 Z"
              fill="url(#bodyGrad)"
            />
            {/* Panel Crease details - Hood accents */}
            <path d="M 60,38 L 54,118 M 140,38 L 146,118" stroke="#94a3b8" strokeWidth="0.8" opacity="0.6" fill="none" />
            <path d="M 80,36 L 76,118 M 120,36 L 124,118" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" fill="none" />
            {/* Door seam lines */}
            <line x1="21" y1="212" x2="52" y2="212" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
            <line x1="148" y1="212" x2="179" y2="212" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
            {/* Trunk seams */}
            <path d="M 52,304 C 52,304 46,370 32,374 M 148,304 C 148,304 154,370 168,374" stroke="#64748b" strokeWidth="0.8" opacity="0.4" fill="none" />
          </g>
          
          {/* DARK MODE CAR BODY */}
          <g className="dark:opacity-100 opacity-0" style={{ transition: 'opacity 0.3s' }}>
            {/* Metallic Body Shell */}
            <path
              d="M 28,42 C 28,42 45,18 100,18 C 155,18 172,42 172,42 C 172,42 182,75 180,120 C 178,165 182,210 180,255 C 178,300 182,330 178,345 C 174,360 170,375 170,375 C 170,375 160,396 100,396 C 40,396 30,375 30,375 C 30,375 26,360 22,345 C 18,330 22,300 20,255 C 18,210 22,165 20,120 C 18,75 28,42 28,42 Z"
              fill="url(#bodyGradDark)"
            />
            {/* Panel Crease details - Hood accents */}
            <path d="M 60,38 L 54,118 M 140,38 L 146,118" stroke="#1e293b" strokeWidth="0.8" opacity="0.8" fill="none" />
            <path d="M 80,36 L 76,118 M 120,36 L 124,118" stroke="#475569" strokeWidth="0.8" opacity="0.5" fill="none" />
            {/* Door seam lines */}
            <line x1="21" y1="212" x2="52" y2="212" stroke="#1e293b" strokeWidth="0.8" opacity="0.8" />
            <line x1="148" y1="212" x2="179" y2="212" stroke="#1e293b" strokeWidth="0.8" opacity="0.8" />
            {/* Trunk seams */}
            <path d="M 52,304 C 52,304 46,370 32,374 M 148,304 C 148,304 154,370 168,374" stroke="#1e293b" strokeWidth="0.8" opacity="0.8" fill="none" />
          </g>

          {/* Front Grille Slats & Honeycomb Intake Mesh */}
          <g>
            {/* Main Center Grille */}
            <path d="M 68,26 Q 100,18 132,26 L 132,36 Q 100,28 68,36 Z" fill="#0f172a" />
            <path d="M 68,26 Q 100,18 132,26 L 132,36 Q 100,28 68,36 Z" fill="url(#grilleHoneycomb)" opacity="0.4" />
            <line x1="72" y1="31" x2="128" y2="31" stroke="#475569" strokeWidth="0.8" opacity="0.6" />
            <line x1="76" y1="34" x2="124" y2="34" stroke="#475569" strokeWidth="0.8" opacity="0.6" />
            
            {/* Left intake mesh */}
            <path d="M 38,20 Q 48,16 58,20 L 56,28 Q 48,24 40,28 Z" fill="#0f172a" />
            <path d="M 38,20 Q 48,16 58,20 L 56,28 Q 48,24 40,28 Z" fill="url(#grilleHoneycomb)" opacity="0.35" />
            
            {/* Right intake mesh */}
            <path d="M 162,20 Q 152,16 142,20 L 144,28 Q 152,24 160,28 Z" fill="#0f172a" />
            <path d="M 162,20 Q 152,16 142,20 L 144,28 Q 152,24 160,28 Z" fill="url(#grilleHoneycomb)" opacity="0.35" />
            
            {/* Lower bumper chin splitter */}
            <path d="M 64,12 Q 100,3 136,12 L 134,16 Q 100,7 66,16 Z" fill="#0f172a" opacity="0.9" />
          </g>



          {/* Aerodynamic Side Mirrors with Amber LED Indicator Strips */}
          <g>
            {/* Left Mirror */}
            <path d="M 22,129 Q 8,134 6,127 Q 8,121 22,125 Z" fill="#475569" stroke="#334155" strokeWidth="0.5" />
            <path d="M 20,128 Q 10,132 8,127" stroke="#f97316" strokeWidth="0.8" fill="none" opacity="0.85" />
            {/* Right Mirror */}
            <path d="M 178,129 Q 192,134 194,127 Q 192,121 178,125 Z" fill="#475569" stroke="#334155" strokeWidth="0.5" />
            <path d="M 180,128 Q 190,132 192,127" stroke="#f97316" strokeWidth="0.8" fill="none" opacity="0.85" />
          </g>

          {/* INTERIOR SEATS & STEERING WHEEL (Subtly visible under dark-tinted window glass) */}
          <g opacity="0.4" className="dark:opacity-[0.25]">
            {/* Steering Wheel (Left hand drive placement) */}
            <circle cx="75" cy="138" r="8" fill="none" stroke="#e2e8f0" strokeWidth="1.6" />
            <line x1="75" y1="138" x2="75" y2="146" stroke="#e2e8f0" strokeWidth="1.2" />
            <line x1="75" y1="138" x2="68" y2="135" stroke="#e2e8f0" strokeWidth="1.2" />
            <line x1="75" y1="138" x2="82" y2="135" stroke="#e2e8f0" strokeWidth="1.2" />
            
            {/* Dashboard Curved Shape */}
            <path d="M 54,127 Q 100,118 146,127 L 140,112 Q 100,103 60,112 Z" fill="#1e293b" />

            {/* Front Left bucket seat */}
            <rect x="62" y="152" width="15" height="9" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="0.5" /> {/* Headrest */}
            <path d="M 55,163 C 55,163 52,192 57,200 C 62,202 78,202 83,200 C 88,192 85,163 85,163 Z" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            <path d="M 61,168 L 61,196 M 79,168 L 79,196" stroke="#1e293b" strokeWidth="0.8" /> {/* Stitching */}
            
            {/* Front Right bucket seat */}
            <rect x="123" y="152" width="15" height="9" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="0.5" /> {/* Headrest */}
            <path d="M 116,163 C 116,163 113,192 118,200 C 123,202 139,202 144,200 C 149,192 146,163 146,163 Z" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            <path d="M 122,168 L 122,196 M 140,168 L 140,196" stroke="#1e293b" strokeWidth="0.8" /> {/* Stitching */}

            {/* Center console armrest */}
            <rect x="91" y="162" width="18" height="35" rx="2" fill="#1e293b" />
            <rect x="96" y="166" width="8" height="12" rx="1" fill="#0f172a" /> {/* screen / selector */}

            {/* Rear Passenger Bench seats */}
            <path d="M 54,262 C 54,262 52,291 58,296 C 64,297 136,297 142,296 C 148,291 146,262 146,262 Z" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            {/* Rear Headrests */}
            <rect x="58" y="293" width="12" height="7" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
            <rect x="94" y="293" width="12" height="7" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
            <rect x="130" y="293" width="12" height="7" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
          </g>

          {/* GLASS PANELS (Windshield, Panoramic Sunroof, Windows, Rear Window) */}
          <g>
            {/* Front Windshield */}
            <path d="M 56,126 Q 100,116 144,126 L 140,88 Q 100,78 60,88 Z" fill="url(#glassGrad)" stroke="#60a5fa" strokeWidth="0.6" />
            
            {/* Sunroof / Glass Cabin Top */}
            <path d="M 54,127 L 146,127 L 146,299 L 54,299 Z" fill="url(#glassGrad)" stroke="#60a5fa" strokeWidth="0.6" />
            
            {/* Side Windows - Front Doors */}
            <path d="M 52,127 L 26,133 L 26,209 L 52,209 Z" fill="url(#glassGrad)" stroke="#60a5fa" strokeWidth="0.4" />
            <path d="M 148,127 L 174,133 L 174,209 L 148,209 Z" fill="url(#glassGrad)" stroke="#60a5fa" strokeWidth="0.4" />
            
            {/* Side Windows - Rear Doors */}
            <path d="M 52,213 L 26,213 L 26,298 L 52,298 Z" fill="url(#glassGrad)" stroke="#60a5fa" strokeWidth="0.4" />
            <path d="M 148,213 L 174,213 L 174,298 L 148,298 Z" fill="url(#glassGrad)" stroke="#60a5fa" strokeWidth="0.4" />

            {/* Rear Window */}
            <path d="M 54,299 Q 100,309 146,299 L 142,336 Q 100,346 58,336 Z" fill="url(#glassGrad)" stroke="#60a5fa" strokeWidth="0.6" />

            {/* Glossy Sheen Highlights (Dual diagonal white sheen bands simulating real reflection) */}
            {/* Windshield highlights */}
            <polygon points="56,126 76,126 120,88 100,88" fill="#ffffff" opacity="0.16" />
            <polygon points="90,126 108,126 136,94 126,90" fill="#ffffff" opacity="0.1" />
            
            {/* Sunroof highlights */}
            <polygon points="54,200 146,118 146,138 74,200" fill="#ffffff" opacity="0.08" />
            <polygon points="54,270 146,188 146,208 74,270" fill="#ffffff" opacity="0.08" />

            {/* Windshield Wipers */}
            <line x1="68" y1="126" x2="98" y2="120" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="112" y1="126" x2="136" y2="121" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Door Handles (Modern Flush fit style) */}
          <g>
            <rect x="25" y="165" width="7" height="2" rx="1" fill="#475569" stroke="#334155" strokeWidth="0.4" />
            <rect x="25" y="255" width="7" height="2" rx="1" fill="#475569" stroke="#334155" strokeWidth="0.4" />
            <rect x="168" y="165" width="7" height="2" rx="1" fill="#475569" stroke="#334155" strokeWidth="0.4" />
            <rect x="168" y="255" width="7" height="2" rx="1" fill="#475569" stroke="#334155" strokeWidth="0.4" />
          </g>

          {/* Headlamp Clusters (DRL Guides + Dual project lens detail) */}
          <g>
            {/* Left headlight */}
            <path d="M 46,28 Q 55,22 68,26 L 68,36 Q 56,34 48,38 Z" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
            <path d="M 48,30 Q 56,25 66,28" fill="none" stroke="#bae6fd" strokeWidth="1.2" filter="url(#headlightglow)" />
            <circle cx="53" cy="31" r="1.5" fill="#fef08a" />
            <circle cx="53" cy="31" r="0.7" fill="#ffffff" />
            <circle cx="61" cy="32" r="1.2" fill="#bae6fd" />
            <circle cx="61" cy="32" r="0.5" fill="#ffffff" />

            {/* Right headlight */}
            <path d="M 154,28 Q 145,22 132,26 L 132,36 Q 144,34 152,38 Z" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
            <path d="M 152,30 Q 144,25 134,28" fill="none" stroke="#bae6fd" strokeWidth="1.2" filter="url(#headlightglow)" />
            <circle cx="147" cy="31" r="1.5" fill="#fef08a" />
            <circle cx="147" cy="31" r="0.7" fill="#ffffff" />
            <circle cx="139" cy="32" r="1.2" fill="#bae6fd" />
            <circle cx="139" cy="32" r="0.5" fill="#ffffff" />
          </g>

          {/* LED Taillight Bar with Glowing accents */}
          <g>
            {/* Black taillight casing bar */}
            <path d="M 32,374 C 32,374 100,362 168,374 L 170,384 C 170,384 100,372 30,384 Z" fill="#0c0a09" stroke="#292524" strokeWidth="0.5" />
            {/* Base Red light bar */}
            <path d="M 34,375 C 34,375 100,364 166,375 L 168,382 C 168,382 100,370 32,382 Z" fill="url(#taillightGrad)" />
            {/* Glowing DRL Light Guide wire */}
            <path d="M 36,378 Q 100,367 164,378" fill="none" stroke="#f87171" strokeWidth="1.2" filter="url(#taillightglow)" />
            {/* Amber indicators */}
            <path d="M 33,375 L 40,375 L 38,382 L 31,382 Z" fill="#f97316" opacity="0.8" />
            <path d="M 167,375 L 160,375 L 162,382 L 169,382 Z" fill="#f97316" opacity="0.8" />
          </g>

        </g>

        {/* ─── LAYER 2: INTERACTIVE PANEL OVERLAYS (Captures mouse clicks & hovers) ─── */}
        {parts.map((part) => {
          const dmg = getPartDamage(part);
          const damageType = dmg?.damage_type || dmg?.damageType;
          const isSelected = normalizeZone(selectedZone) === part.id;
          const isHovered = hoveredPart === part.id;
          const hasDamage = !!damageType;
          const dmgStyle = getDamageStyle(damageType);

          return (
            <g key={part.id}>
              {/* Selected Glow Ring (Placed slightly below the interactive path border to prevent overlapping) */}
              {isSelected && (
                <path
                  d={part.path}
                  filter="url(#panel-glow)"
                  fill="none"
                  stroke="#ABDE3B"
                  strokeWidth="4"
                  opacity="0.85"
                  style={{ animation: 'pulse 1.6s infinite', pointerEvents: 'none' }}
                />
              )}

              {/* Main Panel Interactive Path */}
              <path
                d={part.path}
                fill={hasDamage ? dmgStyle.fill : 'transparent'}
                fillOpacity={hasDamage ? dmgStyle.opacity : 0}
                className={cn(
                  "transition-all duration-200 select-none",
                  isSelected 
                    ? "stroke-[#ABDE3B]" 
                    : isHovered && isInteractive
                    ? "stroke-slate-500 dark:stroke-zinc-400"
                    : "stroke-slate-300/80 dark:stroke-zinc-700/80"
                )}
                strokeWidth={isSelected ? 2 : 0.9}
                strokeLinejoin="round"
                filter={hasDamage ? 'url(#damage-glow)' : undefined}
                style={{ cursor: isInteractive ? 'pointer' : 'default' }}
                onClick={() => {
                  if (isInteractive && onZoneSelect) {
                    onZoneSelect(part.schemaId, isArabic ? part.nameAr : part.nameEn);
                  }
                }}
                onMouseEnter={() => isInteractive && setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
              />

              {/* Hover Overlay Highlight (Interactive mode only, non-damaged panels) */}
              {isInteractive && isHovered && !hasDamage && (
                <path
                  d={part.path}
                  fill={isDark ? "#ffffff" : "#000000"}
                  fillOpacity={0.07}
                  stroke="none"
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* Damage Badge Icon (Always on top, events passed through) */}
              {hasDamage && part.labelX && part.labelY && (
                <g style={{ pointerEvents: 'none' }}>
                  <circle cx={part.labelX} cy={part.labelY} r="5" fill="#ffffff" fillOpacity="0.95" filter="url(#damage-glow)" />
                  <text
                    x={part.labelX}
                    y={part.labelY + 2.2}
                    textAnchor="middle"
                    fontSize="6.5"
                    fontWeight="900"
                    fill={dmgStyle.fill}
                  >
                    !
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CarBlueprint;
