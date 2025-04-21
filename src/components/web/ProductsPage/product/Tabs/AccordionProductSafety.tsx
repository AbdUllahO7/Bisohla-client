import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useMemo } from 'react';

// Define TypeScript interfaces for the feature data structure
interface FeatureDetails {
  category: string;
  createdAt: string;
  deletedAt: null | string;
  icon: string;
  id: number;
  name: string;
  updatedAt: string;
}

interface FeatureItem {
  carListingId: number;
  feature: FeatureDetails;
}

// Define props interface for the component
interface AccordionProductSafetyProps {
  features?: FeatureItem[];
}

const AccordionProductSafety: React.FC<AccordionProductSafetyProps> = ({ features = [] }) => {
  const t = useTranslations('product');

  // Group features by category
  const categorizedFeatures = useMemo(() => {
    const grouped: Record<string, FeatureItem[]> = {};
    
    features.forEach(featureItem => {
      const category = featureItem.feature.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(featureItem);
    });
    
    return grouped;
  }, [features]);

  // Get all unique categories
  const categories = Object.keys(categorizedFeatures);
  const hasFeatures = categories.length > 0;

  return (
    <Box variant="column" className="w-full">
      {hasFeatures ? (
        categories.map(category => (
          <Box key={category} variant="column" className="mb-6 w-full justify-start items-start ">
            <Box className="border-b pb-2 mb-4 mr-5 ml-5">
              <Text variant="large" className="font-bold text-primary capitalize">
                {t(`tabs.features.categories.${category.toLowerCase()}`)}
              </Text>
            </Box>
            
            <Box variant="row" className="flex-wrap gap-4 mr-5 ml-5">
              {categorizedFeatures[category].map((featureItem) => (
                <Box 
                  key={`${featureItem.carListingId}-${featureItem.feature.id}`}
                  className="flex items-start bg-white p-3 rounded-lg shadow-sm w-64 h-16"
                >
                  <Checkbox
                    id={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                    checked={true}
                    onCheckedChange={() => {}}
                    className="mr-3"
                  />
                  
                  {/* {featureItem.feature.icon && (
                    <Image 
                      src={featureItem.feature.icon} 
                      alt={featureItem.feature.name}
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                  )}
                   */}
                  <Label
                    htmlFor={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                    className="text-sm font-medium"
                  >
                    {featureItem.feature.name}
                  </Label>
                </Box>
              ))}
            </Box>
          </Box>
        ))
      ) : (
        <Box className="text-center py-4">
          {/* <Text variant="mid">{t('features.noFeatures', { fallback: 'No features available' })}</Text> */}
        </Box>
      )}
    </Box>
  );
};

export default AccordionProductSafety;