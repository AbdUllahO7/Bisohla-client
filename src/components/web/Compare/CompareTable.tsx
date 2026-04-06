'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/providers/CompareProvider';
import { Link } from '@/i18n/routing';

interface CompareTableProps {
  cars: any[];
}

const CompareTable: React.FC<CompareTableProps> = ({ cars }) => {
  const t = useTranslations('compare');
  const tHome = useTranslations('homePage');
  const { removeFromCompare } = useCompare();

  const specRows = [
    { key: 'price', label: t('price'), getValue: (car: any) => `${car.price} ${car.currency}` },
    { key: 'make', label: t('make'), getValue: (car: any) => car.make?.name },
    { key: 'model', label: t('model'), getValue: (car: any) => car.model?.name },
    { key: 'year', label: t('year'), getValue: (car: any) => car.details?.year },
    { key: 'fuel', label: t('fuel'), getValue: (car: any) => car.details?.fuelType },
    { key: 'transmission', label: t('transmission'), getValue: (car: any) => car.details?.transmission },
    { key: 'mileage', label: t('mileage'), getValue: (car: any) => `${car.details?.mileage} km` },
    { key: 'bodyType', label: tHome('bodyType'), getValue: (car: any) => car.details?.bodyType },
  ];

  return (
    <div className="w-full overflow-x-auto bg-white rounded-3xl shadow-xl border border-emerald-50">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-emerald-50">
            <th className="p-6 bg-emerald-50/30 w-1/4">
              <span className="text-emerald-900 font-bold text-lg">{t('specLabel')}</span>
            </th>
            {cars.map((car) => (
              <th key={car.id} className="p-6 align-top w-1/4 relative group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-emerald-200 transition-all duration-300">
                  <Image
                    src={car.images?.[0]?.url || '/placeholder-car.jpg'}
                    alt={car.title}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeFromCompare(car.id)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-50 p-2 rounded-full shadow-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <Link href={`/products/product/${car.id}`}>
                  <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors">
                    {car.title}
                  </h3>
                </Link>
              </th>
            ))}
            {/* Empty slots if less than 3 cars */}
            {Array.from({ length: Math.max(0, 3 - cars.length) }).map((_, i) => (
              <th key={`empty-${i}`} className="p-6 w-1/4">
                <div className="aspect-[4/3] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Minus size={24} />
                  </div>
                  <span className="text-sm font-medium">{t('addToCompare')}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specRows.map((row, index) => (
            <tr 
              key={row.key}
              className={`border-b border-emerald-50 transition-colors hover:bg-emerald-50/20 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}
            >
              <td className="p-6 font-semibold text-gray-700 bg-emerald-50/10">
                {row.label}
              </td>
              {cars.map((car) => (
                <td key={car.id} className="p-6 text-gray-900 font-medium capitalize">
                  {row.getValue(car) || (
                    <span className="text-gray-300 italic">N/A</span>
                  )}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - cars.length) }).map((_, i) => (
                <td key={`empty-cell-${i}`} className="p-6"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompareTable;
