import Text from '@/components/ui/text';
import { CheckCircle2, AlertTriangle, Wrench, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import CarBlueprint from '../CarBlueprint';
import MotorcycleBlueprint from '../MotorcycleBlueprint';

// Define the type for product details boxes data
interface ProductDetailsBox {
  title: string;
  damageType: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
}

/** One stored `damages` row — keyed by child slug exactly as the wizard writes it. */
interface CarDamage {
  damage_type?: string;
  damage_zone?: string;
  damageType?: string;
  damageZone?: string;
  description?: string | null;
}

interface AccordionProductDetailsProps {
  damages?: CarDamage[];
  /** Which silhouette to draw; `null` shows the type cards only. */
  blueprint?: 'car' | 'motorcycle' | null;
}

const AccordionProductDetails: React.FC<AccordionProductDetailsProps> = ({
  damages = [],
  blueprint = null,
}) => {
  const t = useTranslations('product');

  // Group damages by damage type
  const damagesByType: Record<string, string[]> = {};

  if (Array.isArray(damages) && damages.length > 0) {
    damages.forEach((damage) => {
      const rawType = damage.damageType || damage.damage_type;
      const zone = damage.damageZone || damage.damage_zone;
      if (!rawType) return;

      const type = rawType.toLowerCase();

      if (!damagesByType[type]) {
        damagesByType[type] = [];
      }

      if (
        zone &&
        !damagesByType[type].includes(zone)
      ) {
        damagesByType[type].push(zone);
      }
    });
  }

  // Enhanced data for product details boxes with modern styling
  const productDetailsBoxes: { [key: string]: ProductDetailsBox } = {
    'box-scratch': {
      title: t('accordionDetails.details.productDetailsTitles.scratch', {
        defaultValue: 'Scratches',
      }),
      damageType: 'scratch',
      bgColor: 'bg-gradient-to-br from-[#2C3C39] to-[#198341]',
      textColor: 'text-white',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
      gradientFrom: 'from-[#198341]/10',
      gradientTo: 'to-[#ABDE3B]/10',
    },
    'box-paint': {
      title: t('accordionDetails.details.productDetailsTitles.paint', {
        defaultValue: 'Paint Damage',
      }),
      damageType: 'paint',
      bgColor: 'bg-gradient-to-br from-[#2C3C39] to-[#198341]',

      textColor: 'text-white',
      icon: <Palette className="w-5 h-5 text-white" />,
      gradientFrom: 'from-[#198341]/10',
      gradientTo: 'to-[#2C3C39]/10',
    },
    'box-replacement': {
      title: t('accordionDetails.details.productDetailsTitles.replacement', {
        defaultValue: 'Requires Replacement',
      }),
      damageType: 'replacement',
      bgColor: 'bg-gradient-to-br from-[#2C3C39] to-[#198341]',
      textColor: 'text-white',
      icon: <Wrench className="w-5 h-5 text-white" />,
      gradientFrom: 'from-[#198341]/10',
      gradientTo: 'to-[#198341]/10',
    },
  };

  // Count active damages
  const totalDamages = damages.length;
  const uniqueDamageTypes = new Set(
    damages.map(d => d.damageType || d.damage_type).filter(Boolean)
  ).size;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
      {/* Visual Blueprint Summary Card */}
      {blueprint != null && (
        <div className="w-full lg:w-[340px] bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-5 border-2 border-slate-200 dark:border-zinc-700 shadow-xl flex flex-col items-center shrink-0">
          {/* Header with count badge */}
          <div className="w-full flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-gray-800 dark:text-white">
              {t('accordionDetails.details.damageSummary', { defaultValue: 'Visual Damage Map' })}
            </h4>
            {totalDamages > 0 && (
              <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {totalDamages} {totalDamages === 1 ? 'damage' : 'damages'}
              </span>
            )}
            {totalDamages === 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Clear
              </span>
            )}
          </div>

          {/* Blueprint */}
          <div className="w-full max-w-[280px] rounded-2xl bg-slate-100/60 dark:bg-zinc-800/40 p-3 border border-slate-200 dark:border-zinc-700">
            {blueprint === 'motorcycle' ? (
              <MotorcycleBlueprint damages={damages} isInteractive={false} />
            ) : (
              <CarBlueprint damages={damages} isInteractive={false} />
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 w-full">
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Legend</p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { color: 'bg-red-500', label: t('accordionDetails.details.productDetailsTitles.scratch', { defaultValue: 'Scratch' }), dot: '#ef4444' },
                { color: 'bg-emerald-500', label: t('accordionDetails.details.productDetailsTitles.paint', { defaultValue: 'Paint Damage' }), dot: '#10b981' },
                { color: 'bg-purple-500', label: t('accordionDetails.details.productDetailsTitles.replacement', { defaultValue: 'Requires Replacement' }), dot: '#a855f7' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                  <span className={`w-3 h-3 rounded-sm ${item.color} shrink-0`} />
                  <span className="text-xs font-medium text-gray-600 dark:text-zinc-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Details Cards Container */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(productDetailsBoxes).map((boxKey, index) => {
          const box = productDetailsBoxes[boxKey];
          const damageZones = damagesByType[box.damageType] || [];

          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 transform hover:-translate-y-2 transition-all duration-500"
            >
              {/* Outer glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
              
              {/* Border wrapper */}
              <div className="relative rounded-2xl border-2 border-slate-200 dark:border-zinc-800 group-hover:border-[#198341] dark:group-hover:border-[#ABDE3B] transition-all duration-500 bg-white dark:bg-zinc-900 shadow-lg hover:shadow-2xl">
                {/* Decorative corner accents */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ABDE3B]/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#198341]/10 to-transparent rounded-tr-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Gradient Background Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${box.gradientFrom} ${box.gradientTo} opacity-20`}
                ></div>

                {/* Card Header - Enhanced */}
                <div className={`relative ${box.bgColor} p-4 overflow-hidden`}>
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ABDE3B] via-white to-[#ABDE3B]"></div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative group/icon">
                        {/* Icon glow */}
                        <div className="absolute inset-0 bg-white blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-lg"></div>
                        
                        <div className="relative p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover/icon:scale-110 transition-transform duration-300">
                          {box.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${box.textColor}`}>
                          {box.title}
                        </h3>
                        <p className={`text-sm ${box.textColor} opacity-90`}>
                          {damageZones.length === 0 &&
                            t('accordionDetails.details.noDamageReported')}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Status Badge */}
                    <div className="relative group/badge">
                      {damageZones.length > 0 ? (
                        <>
                          {/* Red glow for issues */}
                          <div className="absolute inset-0 bg-red-500 blur-md opacity-0 group-hover/badge:opacity-30 transition-opacity duration-300 rounded-full"></div>
                          
                          <div className="relative px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border-2 border-red-200 group-hover/badge:border-red-400 transition-colors duration-300">
                            {t('accordionDetails.details.issuesFound')}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Green glow for all clear */}
                          <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover/badge:opacity-30 transition-opacity duration-300 rounded-full"></div>
                          
                          <div className="relative px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#198341] to-[#198341] text-white border-2 border-white group-hover/badge:scale-110 transition-transform duration-300">
                            {t('accordionDetails.details.allClear')}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content - Enhanced */}
                <div className="relative p-4 min-h-[200px]">
                  {/* Side accent indicator */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-32 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-500 rounded-r-full"></div>
                  
                  {damageZones.length > 0 ? (
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
                        <Text className="font-semibold text-sm text-[#2C3C39] dark:text-zinc-300 uppercase tracking-wide">
                          {t('accordionDetails.details.affectedAreas', {
                            defaultValue: 'Affected Areas',
                          })}
                        </Text>
                      </div>

                      <div className="space-y-2">
                        {damageZones.map((zone, idx) => (
                          <div
                            key={`damage-${idx}`}
                            className="group/item relative flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900 rounded-xl hover:from-[#198341]/10 hover:to-[#ABDE3B]/10 dark:hover:from-[#ABDE3B]/10 dark:hover:to-[#ABDE3B]/20 transition-all duration-300 border border-transparent hover:border-[#198341]/30 dark:hover:border-[#ABDE3B]/30"
                          >
                            {/* Hover indicator */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover/item:h-8 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full"></div>
                            
                            <div className="flex-shrink-0 ml-1">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 group-hover/item:scale-125 transition-transform duration-300"></div>
                            </div>
                            <Text className="text-sm font-medium text-[#2C3C39] dark:text-zinc-300 group-hover/item:text-[#198341] dark:group-hover/item:text-[#ABDE3B] group-hover/item:font-semibold transition-all duration-300">
                              {t(`accordionDetails.details.damageZone.${zone}`, {
                                defaultValue: zone,
                              })}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 relative z-10">
                      <div className="relative group/check">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-[#198341] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        
                        <div className="relative w-16 h-16 bg-gradient-to-br from-[#198341] to-[#ABDE3B] rounded-full flex items-center justify-center mb-4 group-hover/check:scale-110 transition-transform duration-500 shadow-lg">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ABDE3B] rounded-full flex items-center justify-center shadow-lg group-hover/check:scale-125 transition-transform duration-300">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>

                      <Text className="text-center text-[#2C3C39] dark:text-zinc-200 font-bold mb-2 text-lg">
                        {t('accordionDetails.details.excellentCondition')}
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-zinc-400 text-center leading-relaxed max-w-[200px]">
                        {t('accordionDetails.details.noDamage', {
                          defaultValue: `No ${box.damageType.toLowerCase()} damage found`,
                          type: box.damageType.toLowerCase(),
                        })}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Bottom Border Accent - Enhanced */}
                <div className="relative h-1 overflow-hidden">
                  <div className={`h-full ${box.bgColor}`}></div>
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccordionProductDetails;