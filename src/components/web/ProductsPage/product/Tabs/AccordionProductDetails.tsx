import Text from '@/components/ui/text';
import { CheckCircle2, AlertTriangle, Wrench, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

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

// Define the type for your actual damage data structure
interface CarDamage {
  id: number;
  carListingId: number;
  damageType: string;
  damageZone: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AccordionProductDetailsProps {
  damages?: CarDamage[];
}

const AccordionProductDetails: React.FC<AccordionProductDetailsProps> = ({
  damages = [],
}) => {
  const t = useTranslations('product');

  // Group damages by damage type
  const damagesByType: Record<string, string[]> = {};

  if (Array.isArray(damages) && damages.length > 0) {
    damages.forEach((damage) => {
      if (!damage.damageType) return;

      if (!damagesByType[damage.damageType]) {
        damagesByType[damage.damageType] = [];
      }

      if (
        damage.damageZone &&
        !damagesByType[damage.damageType].includes(damage.damageZone)
      ) {
        damagesByType[damage.damageType].push(damage.damageZone);
      }
    });
  }

  // Enhanced data for product details boxes with modern styling
  const productDetailsBoxes: { [key: string]: ProductDetailsBox } = {
    'box-scratch': {
      title: t('accordionDetails.details.productDetailsTitles.scratch', {
        defaultValue: 'Scratches',
      }),
      damageType: 'Scratch',
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

  return (
    <div className="w-full">
      {/* Grid Layout for Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Object.keys(productDetailsBoxes).map((boxKey, index) => {
          const box = productDetailsBoxes[boxKey];
          const damageZones = damagesByType[box.damageType] || [];

          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white transform hover:-translate-y-2 transition-all duration-500"
            >
              {/* Outer glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
              
              {/* Border wrapper */}
              <div className="relative rounded-2xl border-2 border-slate-200 group-hover:border-[#198341] transition-all duration-500 bg-white shadow-lg hover:shadow-2xl">
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
                        <Text className="font-semibold text-sm text-[#2C3C39] uppercase tracking-wide">
                          {t('accordionDetails.details.affectedAreas', {
                            defaultValue: 'Affected Areas',
                          })}
                        </Text>
                      </div>

                      <div className="space-y-2">
                        {damageZones.map((zone, idx) => (
                          <div
                            key={`damage-${idx}`}
                            className="group/item relative flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-[#198341]/10 hover:to-[#ABDE3B]/10 transition-all duration-300 border border-transparent hover:border-[#198341]/30"
                          >
                            {/* Hover indicator */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover/item:h-8 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full"></div>
                            
                            <div className="flex-shrink-0 ml-1">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 group-hover/item:scale-125 transition-transform duration-300"></div>
                            </div>
                            <Text className="text-sm font-medium text-[#2C3C39] group-hover/item:text-[#198341] group-hover/item:font-semibold transition-all duration-300">
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

                      <Text className="text-center text-[#2C3C39] font-bold mb-2 text-lg">
                        {t('accordionDetails.details.excellentCondition')}
                      </Text>
                      <Text className="text-sm text-gray-600 text-center leading-relaxed max-w-[200px]">
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