import Box from '@/components/box/box';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import React from 'react';

const AccordionProductSafety: React.FC = () => {
  const t = useTranslations('product');

  // Define the list of items for checkboxes
  const safetyItems = [
    t('accordionSafety.list.one'),
    t('accordionSafety.list.two'),
    t('accordionSafety.list.three'),
    t('accordionSafety.list.four'),
    t('accordionSafety.list.five'),
    t('accordionSafety.list.six'),
    t('accordionSafety.list.seven'),
    t('accordionSafety.list.eight'),
    t('accordionSafety.list.nine'),
    t('accordionSafety.list.ten'),
  ];

  // Define the static checked states (true means checked, false means unchecked)
  const checkedStates = [true, false, true, false, true, false, true, false, true, false];

  return (
    <Box variant="row" className="p-4 flex-wrap gap-8">
      {/* Map over the list of safety items to create checkboxes dynamically */}
      {safetyItems.map((item, index) => (
        <Box key={index} className="mb-2 flex items-center">
          <Checkbox
            id={`checkbox-${index}`}
            checked={checkedStates[index]} // Use the corresponding checked state
          />
          <Label
            htmlFor={`checkbox-${index}`}
            className="text-sm font-bold leading-none ml-2"
          >
            {item}
          </Label>
        </Box>
      ))}
    </Box>
  );
};

export default AccordionProductSafety;
