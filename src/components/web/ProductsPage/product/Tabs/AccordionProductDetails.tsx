import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

// Define the type for product details boxes data
interface ProductDetailsBox {
  title: string;
  list: {
    one: string;
    tow: string;
  };
}

const AccordionProductDetails: React.FC = () => {
  const t = useTranslations('product');

  // Data for product details boxes (using translations for dynamic content)
  const productDetailsBoxes: { [key: string]: ProductDetailsBox } = {
    "box-one": {
      title: t('accordionDetails.questions.productDetailsBoxes.box-one.title'),
      list: {
        one: t('accordionDetails.questions.productDetailsBoxes.box-one.list.one'),
        tow: t('accordionDetails.questions.productDetailsBoxes.box-one.list.tow'),
      },
    },
    "box-tow": {
      title: t('accordionDetails.questions.productDetailsBoxes.box-tow.title'),
      list: {
        one: t('accordionDetails.questions.productDetailsBoxes.box-tow.list.one'),
        tow: t('accordionDetails.questions.productDetailsBoxes.box-tow.list.tow'),
      },
    },
    "box-three": {
      title: t('accordionDetails.questions.productDetailsBoxes.box-three.title'),
      list: {
        one: t('accordionDetails.questions.productDetailsBoxes.box-three.list.one'),
        tow: t('accordionDetails.questions.productDetailsBoxes.box-three.list.tow'),
      },
    },
    "box-four": {
      title: t('accordionDetails.questions.productDetailsBoxes.box-four.title'),
      list: {
        one: t('accordionDetails.questions.productDetailsBoxes.box-four.list.one'),
        tow: t('accordionDetails.questions.productDetailsBoxes.box-four.list.tow'),
      },
    },
  };

  // Define a color scheme for each box
  const colorSchemes = [
    {
      textColor: 'text-primary',
      borderColor: 'border-secondary-indigo',
      circleColor: 'bg-secondary-indigo',
    },
    {
      textColor: 'text-primary',
      borderColor: 'border-secondary-purple',
      circleColor: 'bg-secondary-purple',
    },
    {
      textColor: 'text-primary',
      borderColor: 'border-secondary-pink',
      circleColor: 'bg-secondary-pink',
    },
    {
      textColor: 'text-primary',
      borderColor: 'border-primary-light',
      circleColor: 'bg-primary-light',
    },
  ];

  return (
    <Box variant="column" className="justify-start items-start flex-wrap">
      <Box variant="row" className="gap-8 flex-wrap">
        {/* Titles Section */}
        <Text className="bg-primary-light text-white min-w-[140px] px-4 font-bold py-2 rounded-3xl flex gap-2 items-center">
          <Circle size={20} className="text-primary" />
          {t('accordionDetails.questions.productDetailsTitles.title-one')}
        </Text>
        <Text className="bg-secondary-purple text-white min-w-[140px]  px-4 font-bold py-2 rounded-3xl flex gap-2 items-center">
          <Circle size={20} className="text-primary" />
          {t('accordionDetails.questions.productDetailsTitles.title-tow')}
        </Text>
        <Text className="bg-secondary-indigo text-white min-w-[140px]  px-4 font-bold py-2 rounded-3xl flex gap-2 items-center">
          <Circle size={20} className="text-primary" />
          {t('accordionDetails.questions.productDetailsTitles.title-three')}
        </Text>
        <Text className="bg-secondary-pink text-white min-w-[140px]  px-4 font-bold py-2 rounded-3xl flex gap-2 items-center">
          <Circle size={20} className="text-primary" />
          {t('accordionDetails.questions.productDetailsTitles.title-four')}
        </Text>
      </Box>

      {/* Product Details Boxes */}
      <Box className='gap-8 flex-wrap xs:justify-center' >
        {Object.keys(productDetailsBoxes).map((boxKey, index) => {
          const box = productDetailsBoxes[boxKey];
          const colorScheme = colorSchemes[index % colorSchemes.length]; // Cycle through colors
          return (
            <Box
              variant="column"
              key={index}
              className={`border ${colorScheme.borderColor} max-w-[200px] mb-4 items-start px-2 py-2 min-h-[300px] rounded-2xl  `}
            >
              <Text
                className={`font-bold text-lg text-center ${colorScheme.textColor} flex items-center gap-1`}
              >
                {/* Circle and Title */}
                <span
                  className={`border ${colorScheme.borderColor} rounded-full w-4 h-4 inline-block mr-2 ${colorScheme.circleColor}`}
                />
                {box.title}
              </Text>
              <Box className="ml-6 flex-col xs:items-center">
                {/* List Section */}
                {Object.values(box.list).map((listItem, idx) => (
                  <Text
                    key={idx}
                    className={`font-bold text-sm text-center flex items-center gap-1 ${colorScheme.textColor}`}
                  >
                    <span
                      className={`border ${colorScheme.borderColor} rounded-full w-1 h-1 inline-block mr-2 ${colorScheme.circleColor}`}
                    />
                    <span>{listItem}</span>
                  </Text>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AccordionProductDetails;
