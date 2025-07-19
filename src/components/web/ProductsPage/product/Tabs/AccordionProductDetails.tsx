import Text from '@/components/text/text';
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
      bgColor: 'bg-gradient-to-br from-primary to-primary-light',
      textColor: 'text-white',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
      gradientFrom: 'from-orange-50',
      gradientTo: 'to-red-50',
    },
    'box-paint': {
      title: t('accordionDetails.details.productDetailsTitles.paint', {
        defaultValue: 'Paint Damage',
      }),
      damageType: 'paint',
      bgColor: 'bg-gradient-to-br from-primary-light to-primary',
      textColor: 'text-white',
      icon: <Palette className="w-5 h-5 text-white" />,
      gradientFrom: 'from-purple-50',
      gradientTo: 'to-indigo-50',
    },
    'box-replacement': {
      title: t('accordionDetails.details.productDetailsTitles.replacement', {
        defaultValue: 'Requires Replacement',
      }),
      damageType: 'replacement',
      bgColor: 'bg-gradient-to-br from-primary to-primary-light',
      textColor: 'text-white',
      icon: <Wrench className="w-5 h-5 text-white" />,
      gradientFrom: 'from-red-50',
      gradientTo: 'to-pink-50',
    },
  };

  return (
    <div className="w-full">
      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Object.keys(productDetailsBoxes).map((boxKey, index) => {
          const box = productDetailsBoxes[boxKey];
          const damageZones = damagesByType[box.damageType] || [];

          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Gradient Background Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${box.gradientFrom} ${box.gradientTo} opacity-20`}
              ></div>

              {/* Card Header */}
              <div className={`relative ${box.bgColor} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {box.icon}
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

                  {/* Status Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      damageZones.length > 0
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}
                  >
                    {damageZones.length > 0
                      ? t('accordionDetails.details.issuesFound')
                      : t('accordionDetails.details.allClear')}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="relative p-4 min-h-[200px]">
                {damageZones.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-primary-light rounded-full"></div>
                      <Text className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                        {t('accordionDetails.details.affectedAreas', {
                          defaultValue: 'Affected Areas',
                        })}
                      </Text>
                    </div>

                    <div className="space-y-2">
                      {damageZones.map((zone, idx) => (
                        <div
                          key={`damage-${idx}`}
                          className="group/item flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full ${box.bgColor.replace(
                                'bg-gradient-to-br',
                                'bg-danger',
                              )}`}
                            ></div>
                          </div>
                          <Text className="text-sm font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors">
                            {t(`accordionDetails.details.damageZone.${zone}`, {
                              defaultValue: zone,
                            })}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <div className="relative">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>

                    <Text className="text-center text-gray-600 font-medium mb-2">
                      {t('accordionDetails.details.excellentCondition')}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center leading-relaxed">
                      {t('accordionDetails.details.noDamage', {
                        defaultValue: `No ${box.damageType.toLowerCase()} damage found`,
                        type: box.damageType.toLowerCase(),
                      })}
                    </Text>
                  </div>
                )}
              </div>

              {/* Bottom Border Accent */}
              <div
                className={`h-1 absolute bottom-0 left-0 w-full ${box.bgColor}`}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Summary Section
      {damages.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-primary-light rounded-full"></div>
            <Text className="font-semibold text-gray-700 uppercase tracking-wide text-sm">
              {t('accordionDetails.details.damageSummary')}
            </Text>
          </div>
          <Text className="text-gray-600">
            Total of{' '}
            <span className="font-semibold text-primary">{damages.length}</span>{' '}
            damage reports found across{' '}
            <span className="font-semibold text-primary">
              {Object.keys(damagesByType).length}
            </span>{' '}
            different categories.
          </Text>
        </div>
      )} */}
    </div>
  );
};

export default AccordionProductDetails;
