import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Circle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

// Define the type for product details boxes data
interface ProductDetailsBox {
  title: string;
  damageType: string; // Changed to match the actual data field
  bgColor: string;
  textColor: string;
}

// Define the type for your actual damage data structure
interface CarDamage {
  id: number;
  carListingId: number;
  damageType: string;    // Actual field from backend
  damageZone: string;    // Actual field from backend
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AccordionProductDetailsProps {
  damages?: CarDamage[];
}

const AccordionProductDetails: React.FC<AccordionProductDetailsProps> = ({ damages = [] }) => {
  const t = useTranslations('product');

  console.log("damages", damages);

  // Map damage zones to car sections if possible
  const mapDamageZoneToSection = (damageZone: string): string => {
    // Convert snake_case to Title Case
    return damageZone
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Group damages by damage type
  const damagesByType: Record<string, string[]> = {};
  
  if (Array.isArray(damages) && damages.length > 0) {
    damages.forEach(damage => {
      if (!damage.damageType) return;
      
      // Make sure the key exists in our record
      if (!damagesByType[damage.damageType]) {
        damagesByType[damage.damageType] = [];
      }
      
      // Add the section if it's not already in the array
      if (damage.damageZone && !damagesByType[damage.damageType].includes(damage.damageZone)) {
        damagesByType[damage.damageType].push(damage.damageZone);
      }
    });
  }

  console.log("Grouped damages by type:", damagesByType);

  // Data for product details boxes with matching colors to title sections
  const productDetailsBoxes: { [key: string]: ProductDetailsBox } = {
    "box-scratch": {
      title: t('accordionDetails.details.productDetailsTitles.scratch', { defaultValue: 'Scratches' }),
      damageType: "scratch", // Match the actual value from backend
      bgColor: "bg-primary-light",
      textColor: "text-white",
    },
    "box-paint": {
      title: t('accordionDetails.details.productDetailsTitles.paint', { defaultValue: 'Paint Damage' }),
      damageType: "paint", // Match the actual value from backend
      bgColor: "bg-secondary-purple",
      textColor: "text-white",
    },
    "box-replacement": {
      title: t('accordionDetails.details.productDetailsTitles.replacement', { defaultValue: 'Requires Replacement' }),
      damageType: "replacement", // Match the actual value from backend
      bgColor: "bg-secondary-indigo",
      textColor: "text-white",
    }
  };

  return (
    <Box variant="column" className="justify-center items-center flex-wrap gap-8">
      {/* Product Details Boxes - with fixed width and height */}
      <Box className='gap-8 flex-wrap xs:justify-center w-full'>
        {Object.keys(productDetailsBoxes).map((boxKey, index) => {
          const box = productDetailsBoxes[boxKey];
          
          // Get damage sections for this damage type if they exist
          const damageZones = damagesByType[box.damageType] || [];
          
          return (
            <Box
              variant="column"
              key={index}
              className="w-64 h-80 mb-4 rounded-2xl shadow-md overflow-hidden"
            >
              {/* Box Header - Color matches title section */}
              <Box className={`${box.bgColor} w-full py-4 px-3 ${box.textColor}`}>
                <Text className="font-bold text-lg flex items-center gap-2">
                  <Circle size={18} className="text-primary" />
                  {box.title}
                </Text>
              </Box>
              
              {/* Damage Zones Content Area - With scrolling */}
              <Box className="w-full h-full bg-white p-3 overflow-y-auto">
                {damageZones.length > 0 ? (
                  <Box variant="column" className="w-full space-y-2">
                    <Text className="font-bold text-sm text-primary mb-2">
                      {t('accordionDetails.details.affectedAreas', { defaultValue: 'Affected Areas:' })}
                    </Text>
                    
                    {damageZones.map((zone, idx) => (
                      <Box 
                        key={`damage-${idx}`}
                        className={`bg-gray-50 rounded-md py-2 px-3 w-full flex items-center shadow-sm`}
                      >
                        <div className={`w-2 h-2 rounded-full ${box.bgColor} mr-2`}></div>
                        <Text className="text-sm text-primary">
                          {t(`accordionDetails.details.damageZone.${zone}`, { defaultValue: mapDamageZoneToSection(zone) })}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box variant="column" className="w-full items-center mt-8">
                    <CheckCircle2 size={32} className="text-green-500 mb-2" />
                    <Text className="text-sm text-secondary-text text-center">
                      {t('accordionDetails.details.noDamage', { 
                        defaultValue: `No ${box.damageType.toLowerCase()} damage reported`,
                        type: box.damageType.toLowerCase()
                      })}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AccordionProductDetails;