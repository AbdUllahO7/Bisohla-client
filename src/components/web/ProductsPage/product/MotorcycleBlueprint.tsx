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

interface BlueprintPart {
  id: string;
  schemaId: string;
  nameEn: string;
  nameAr: string;
  path: string;
  labelX?: number;
  labelY?: number;
}

interface MotorcycleBlueprintProps {
  damages?: any[];
  selectedZone?: string | null;
  onZoneSelect?: (schemaId: string, label: string) => void;
  isInteractive?: boolean;
}

const MotorcycleBlueprint: React.FC<MotorcycleBlueprintProps> = ({
  damages = [],
  selectedZone,
  onZoneSelect,
  isInteractive = false,
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Side view motorcycle blueprint (viewBox 0 0 400 250)
  const parts: BlueprintPart[] = [
    // Rear Wheel
    {
      id: 'rearwheel',
      schemaId: 'rear_wheel',
      nameEn: 'Rear Wheel & Brake',
      nameAr: 'العجلة الخلفية والفرامل',
      path: 'M 42,170 a 38,38 0 1,0 76,0 a 38,38 0 1,0 -76,0',
      labelX: 80, labelY: 175,
    },
    // Front Wheel
    {
      id: 'frontwheel',
      schemaId: 'front_wheel',
      nameEn: 'Front Wheel & Brake',
      nameAr: 'العجلة الأمامية والفرامل',
      path: 'M 282,170 a 38,38 0 1,0 76,0 a 38,38 0 1,0 -76,0',
      labelX: 320, labelY: 175,
    },
    // Front Fork
    {
      id: 'frontfork',
      schemaId: 'front_fork',
      nameEn: 'Front Suspension Fork',
      nameAr: 'الشوكة الأمامية والمساعدات',
      path: 'M 315,175 L 325,165 L 285,65 L 275,75 Z',
      labelX: 295, labelY: 120,
    },
    // Handlebars
    {
      id: 'handlebar',
      schemaId: 'handlebar',
      nameEn: 'Handlebars & Controls',
      nameAr: 'المقود وأجهزة التحكم',
      path: 'M 255,68 L 290,60 L 285,48 L 250,56 Z',
      labelX: 265, labelY: 50,
    },
    // Headlight
    {
      id: 'headlight',
      schemaId: 'headlight',
      nameEn: 'Headlight & Fairing',
      nameAr: 'المصباح الأمامي والغطاء',
      path: 'M 292,80 Q 315,85 308,105 L 288,98 Z',
      labelX: 305, labelY: 90,
    },
    // Fuel Tank
    {
      id: 'fueltank',
      schemaId: 'fuel_tank',
      nameEn: 'Fuel Tank',
      nameAr: 'خزان الوقود',
      path: 'M 180,105 C 180,75 250,70 270,95 C 270,120 220,130 180,120 Z',
      labelX: 220, labelY: 95,
    },
    // Seat
    {
      id: 'seat',
      schemaId: 'seat',
      nameEn: 'Seat / Saddle',
      nameAr: 'المقعد',
      path: 'M 115,115 Q 150,110 180,120 L 175,135 Q 145,125 110,130 Z',
      labelX: 145, labelY: 120,
    },
    // Engine
    {
      id: 'engine',
      schemaId: 'engine',
      nameEn: 'Engine & Transmission',
      nameAr: 'المحرك وناقل الحركة',
      path: 'M 180,135 L 245,135 L 235,190 L 170,190 Z',
      labelX: 210, labelY: 165,
    },
    // Exhaust
    {
      id: 'exhaust',
      schemaId: 'exhaust',
      nameEn: 'Exhaust Pipe & Muffler',
      nameAr: 'العادم (الاشكمان)',
      path: 'M 215,175 L 95,210 L 90,195 L 205,165 Z',
      labelX: 140, labelY: 190,
    },
    // Frame
    {
      id: 'frame',
      schemaId: 'frame',
      nameEn: 'Main Chassis Frame',
      nameAr: 'الهيكل الرئيسي (الشاصي)',
      path: 'M 80,170 Q 120,110 180,110 L 180,135 L 115,150 Z',
      labelX: 130, labelY: 145,
    },
    // Tail Light
    {
      id: 'taillight',
      schemaId: 'tail_light',
      nameEn: 'Tail Light & Rear Fender',
      nameAr: 'المصباح الخلفي والرفرف',
      path: 'M 82,122 L 74,124 L 76,134 L 84,130 Z',
      labelX: 70, labelY: 115,
    },
  ];

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
        viewBox="0 0 400 250"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxHeight: 380 }}
      >
        <defs>
          {/* Gradients and Filters matching CarBlueprint style */}
          <linearGradient id="motoBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="1" />
            <stop offset="25%" stopColor="#f1f5f9" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#f1f5f9" stopOpacity="1" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="motoBodyGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
            <stop offset="25%" stopColor="#334155" stopOpacity="1" />
            <stop offset="50%" stopColor="#475569" stopOpacity="1" />
            <stop offset="75%" stopColor="#334155" stopOpacity="1" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="1" />
          </linearGradient>

          <filter id="panel-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="damage-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── LAYER 1: STATIC VISUAL DETAILS ─── */}
        <g style={{ pointerEvents: 'none' }}>
          {/* Background Grid Lines or floor line */}
          <line x1="20" y1="215" x2="380" y2="215" stroke={isDark ? "#27272a" : "#e4e4e7"} strokeWidth="2" strokeDasharray="4" />

          {/* Rear Wheel Tire & Rim Details */}
          <circle cx="80" cy="170" r="38" fill="none" stroke="#09090b" strokeWidth="12" />
          <circle cx="80" cy="170" r="30" fill="none" stroke={isDark ? "#27272a" : "#e4e4e7"} strokeWidth="2" />
          <circle cx="80" cy="170" r="12" fill={isDark ? "#18181b" : "#f4f4f5"} stroke={isDark ? "#52525b" : "#a1a1aa"} strokeWidth="2" />
          <path d="M 80,132 L 80,208 M 42,170 L 118,170 M 53,143 L 107,197 M 53,197 L 107,143" stroke={isDark ? "#3f3f46" : "#cbd5e1"} strokeWidth="1" />

          {/* Front Wheel Tire & Rim Details */}
          <circle cx="320" cy="170" r="38" fill="none" stroke="#09090b" strokeWidth="12" />
          <circle cx="320" cy="170" r="30" fill="none" stroke={isDark ? "#27272a" : "#e4e4e7"} strokeWidth="2" />
          <circle cx="320" cy="170" r="12" fill={isDark ? "#18181b" : "#f4f4f5"} stroke={isDark ? "#52525b" : "#a1a1aa"} strokeWidth="2" />
          <path d="M 320,132 L 320,208 M 282,170 L 358,170 M 293,143 L 347,197 M 293,197 L 347,143" stroke={isDark ? "#3f3f46" : "#cbd5e1"} strokeWidth="1" />

          {/* Drive Chain & Rear Swingarm */}
          <path d="M 80,170 L 160,178 L 175,160 Z" fill="none" stroke={isDark ? "#3f3f46" : "#94a3b8"} strokeWidth="4" />
          <circle cx="170" cy="170" r="10" fill={isDark ? "#27272a" : "#cbd5e1"} stroke={isDark ? "#52525b" : "#64748b"} strokeWidth="1" />

          {/* Engine Fins & Details */}
          <rect x="185" y="145" width="45" height="35" rx="3" fill={isDark ? "#27272a" : "#cbd5e1"} stroke={isDark ? "#52525b" : "#64748b"} strokeWidth="1.5" />
          <line x1="185" y1="152" x2="230" y2="152" stroke={isDark ? "#18181b" : "#475569"} strokeWidth="1.5" />
          <line x1="185" y1="160" x2="230" y2="160" stroke={isDark ? "#18181b" : "#475569"} strokeWidth="1.5" />
          <line x1="185" y1="168" x2="230" y2="168" stroke={isDark ? "#18181b" : "#475569"} strokeWidth="1.5" />
          <line x1="185" y1="176" x2="230" y2="176" stroke={isDark ? "#18181b" : "#475569"} strokeWidth="1.5" />
        </g>

        {/* ─── LAYER 2: INTERACTIVE PANEL OVERLAYS ─── */}
        {parts.map((part) => {
          const dmg = getPartDamage(part);
          const damageType = dmg?.damage_type || dmg?.damageType;
          const isSelected = normalizeZone(selectedZone) === part.id;
          const isHovered = hoveredPart === part.id;
          const hasDamage = !!damageType;
          const dmgStyle = getDamageStyle(damageType);

          return (
            <g key={part.id}>
              {/* Selected Glow Ring */}
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
                fill={hasDamage ? dmgStyle.fill : (isDark ? 'url(#motoBodyGradDark)' : 'url(#motoBodyGrad)')}
                fillOpacity={hasDamage ? dmgStyle.opacity : 0.85}
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

              {/* Hover Overlay Highlight */}
              {isInteractive && isHovered && !hasDamage && (
                <path
                  d={part.path}
                  fill={isDark ? "#ffffff" : "#000000"}
                  fillOpacity={0.07}
                  stroke="none"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

        {/* Labels for parts in interactive mode or when damaged */}
        <g style={{ pointerEvents: 'none' }}>
          {parts.map((part) => {
            const dmg = getPartDamage(part);
            const isSelected = normalizeZone(selectedZone) === part.id;
            const isHovered = hoveredPart === part.id;
            const hasDamage = !!dmg;

            if (!isSelected && !isHovered && !hasDamage) return null;

            return (
              <g key={`lbl-${part.id}`}>
                {/* Background badge for label text */}
                <rect
                  x={part.labelX ? part.labelX - 45 : 100}
                  y={part.labelY ? part.labelY - 12 : 100}
                  width="90"
                  height="16"
                  rx="4"
                  fill={hasDamage ? "#b91c1c" : "#1e293b"}
                  opacity="0.9"
                />
                <text
                  x={part.labelX || 100}
                  y={part.labelY ? part.labelY - 1 : 100}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {isArabic ? part.nameAr : part.nameEn}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* CSS Animation Keyframes for Pulsing selection glow */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.85;
            stroke-width: 4px;
          }
          50% {
            opacity: 0.4;
            stroke-width: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default MotorcycleBlueprint;
