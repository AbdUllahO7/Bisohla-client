'use client'
import React from 'react';
import Text from '@/components/ui/text';

interface DynamicSectionHeaderProps {
  title: string;
}

const DynamicSectionHeader: React.FC<DynamicSectionHeaderProps> = ({ title }) => {
  return (
    <div className="w-full bg-gray-100 dark:bg-zinc-800/50 py-4 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-y border-gray-200/50 dark:border-zinc-800/80">
      <Text className="text-xl font-bold text-[#1a2b28] dark:text-white text-center uppercase tracking-wide">
        {title}
      </Text>
    </div>
  );
};

export default DynamicSectionHeader;
