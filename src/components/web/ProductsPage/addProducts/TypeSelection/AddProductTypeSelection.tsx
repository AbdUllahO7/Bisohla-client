'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Text from "@/components/ui/text";
import { getInjection } from '@/di/container';
import { ListingTypeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface AddProductTypeSelectionProps {
  onSelect: (type: ListingTypeDto) => void;
  selectedTypeId?: number;
}

const AddProductTypeSelection: React.FC<AddProductTypeSelectionProps> = ({ onSelect, selectedTypeId }) => {
  const [types, setTypes] = useState<ListingTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("addProduct");

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const controller = getInjection('IListingTypesRepoController');
        const response = await controller.getListingTypes(1, 100);
        if (response.success && response.data) {
          const activeTypes = response.data.data.filter(t => t.isActive);
          setTypes(activeTypes);
          
          // Auto-select if only one active type exists
          if (activeTypes.length === 1) {
            onSelect(activeTypes[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch listing types", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  if (loading || (types.length === 1 && !selectedTypeId)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse h-48 bg-gray-100 border-none" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="text-center space-y-2">
        <Text className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t("typeSelection.title", { defaultValue: "Select Category" })}
        </Text>
        <Text className="text-gray-500">
          {t("typeSelection.description", { defaultValue: "What kind of ad would you like to post?" })}
        </Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type) => (
          <Card 
            key={type.id}
            className={cn(
              "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2",
              selectedTypeId === type.id 
                ? "border-emerald-500 bg-emerald-50/50" 
                : "border-transparent hover:border-emerald-200 bg-white"
            )}
            onClick={() => onSelect(type)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-32 h-32 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {(type.imageUrl || type.iconUrl) ? (
                  <Image 
                    src={type.imageUrl || type.iconUrl!} 
                    alt={type.name} 
                    fill
                    sizes="(max-width: 768px) 128px, 128px"
                    className="object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-full" />
                )}
              </div>
              <div className="space-y-1">
                <Text className="text-xl font-bold text-gray-900">{type.name}</Text>
                {type.description && (
                  <Text className="text-sm text-gray-500 line-clamp-2">{type.description}</Text>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddProductTypeSelection;
