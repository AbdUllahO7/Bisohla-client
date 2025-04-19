import Box from '@/components/box/box';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import React from 'react';

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

  // If features are provided, we can use this data to display in the component
  const hasFeatures = features && features.length > 0;

  return (
    <Box variant="row" className="p-4 flex-wrap gap-8">
      {/* If features data exists, display it below the safety items */}
      {hasFeatures && (
        <Box className="w-full mt-4">
          {features.map((feature, index) => (
            <Box key={index} className="mb-2">
              <Box className="flex items-center">
                <Checkbox
                  id={`feature-${feature.carListingId}-${feature.feature.id}`}
                  checked={true}
                  // Add onCheckedChange to satisfy Checkbox props requirement
                  onCheckedChange={() => {}}
                />
                <Label
                  htmlFor={`feature-${feature.carListingId}-${feature.feature.id}`}
                  className="text-sm font-bold leading-none ml-2"
                >
                  {feature.feature.name} ({feature.feature.category})
                </Label>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AccordionProductSafety;

