'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/providers/CompareProvider';
import { Link } from '@/i18n/routing';
import { Switch } from '@/components/ui/switch';
import {
  getBodyTypeOptions,
  getFuelTypeOptions,
  getTransmissionOptions,
} from '@/core/entities/enums/cars.enums';

interface CompareTableProps {
  cars: any[];
}

const CompareTable: React.FC<CompareTableProps> = ({ cars }) => {
  const t = useTranslations('compare');
  const tHome = useTranslations('homePage');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTwo');
  const { removeFromCompare, maxCompare } = useCompare();

  const [highlightDiffs, setHighlightDiffs] = React.useState(false);

  const bodyTypeOptions = React.useMemo(() => getBodyTypeOptions(bodyTypeT), [bodyTypeT]);
  const transmissionOptions = React.useMemo(() => getTransmissionOptions(bodyTypeT), [bodyTypeT]);
  const fuelTypeOptions = React.useMemo(() => getFuelTypeOptions(bodyTypeT), [bodyTypeT]);

  const getTranslatedLabel = (value: string | undefined | null, options: Array<{ value: string; label: string }>) => {
    if (!value) return '';
    const option = options.find((opt) => opt.value.toLowerCase() === value.toLowerCase());
    return option ? option.label : value;
  };

  const specRows = React.useMemo(() => [
    { key: 'price', label: t('price'), getValue: (car: any) => `${car.price} ${car.currency}` },
    { key: 'make', label: t('make'), getValue: (car: any) => car.make?.name },
    { key: 'model', label: t('model'), getValue: (car: any) => car.model?.name },
    { key: 'year', label: t('year'), getValue: (car: any) => car.details?.year },
    { key: 'fuel', label: t('fuel'), getValue: (car: any) => getTranslatedLabel(car.details?.fuelType, fuelTypeOptions) },
    { key: 'transmission', label: t('transmission'), getValue: (car: any) => getTranslatedLabel(car.details?.transmission, transmissionOptions) },
    { key: 'mileage', label: t('mileage'), getValue: (car: any) => `${car.details?.mileage} km` },
    { key: 'bodyType', label: tHome('bodyType'), getValue: (car: any) => getTranslatedLabel(car.details?.bodyType, bodyTypeOptions) },
  ], [t, tHome, fuelTypeOptions, transmissionOptions, bodyTypeOptions]);

  const isRowDifferent = React.useMemo(() => {
    if (cars.length <= 1) return {};
    
    const diffs: Record<string, boolean> = {};
    specRows.forEach((row) => {
      const values = cars.map((car) => {
        const val = row.getValue(car);
        return val ? val.toString().trim().toLowerCase() : '';
      });
      const firstVal = values[0];
      const hasDifference = values.some((val) => val !== firstVal);
      diffs[row.key] = hasDifference;
    });
    return diffs;
  }, [cars, specRows]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Controls Bar */}
      {cars.length > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-md border border-emerald-50/60 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Switch
              id="highlight-diffs"
              checked={highlightDiffs}
              onCheckedChange={setHighlightDiffs}
              className="data-[state=checked]:bg-emerald-600"
            />
            <label
              htmlFor="highlight-diffs"
              className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
            >
              {t('highlightDifferences')}
            </label>
          </div>
          <div className="text-xs text-emerald-800 bg-emerald-50/50 px-3 py-1.5 rounded-full font-bold">
            {t('comparingCount', { count: cars.length })}
          </div>
        </div>
      )}

      {/* Table Container */}
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
              {/* Empty slots if less than maxCompare cars */}
              {Array.from({ length: Math.max(0, maxCompare - cars.length) }).map((_, i) => (
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
            {specRows.map((row, index) => {
              const isDiff = highlightDiffs && isRowDifferent[row.key];
              return (
                <tr 
                  key={row.key}
                  className={`border-b border-emerald-50 transition-all duration-300 ${
                    isDiff 
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/60' 
                      : index % 2 === 0 ? 'bg-white hover:bg-emerald-50/20' : 'bg-gray-50/30 hover:bg-emerald-50/20'
                  }`}
                >
                  <td className={`p-6 font-semibold text-gray-700 transition-colors duration-300 ${
                    isDiff ? 'bg-emerald-100/20 text-emerald-900' : 'bg-emerald-50/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isDiff && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      )}
                      <span>{row.label}</span>
                    </div>
                  </td>
                  {cars.map((car) => (
                    <td 
                      key={car.id} 
                      className={`p-6 text-gray-900 font-medium capitalize transition-colors duration-300 ${
                        isDiff ? 'text-emerald-950 font-semibold' : ''
                      }`}
                    >
                      {row.getValue(car) || (
                        <span className="text-gray-300 italic">N/A</span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, maxCompare - cars.length) }).map((_, i) => (
                    <td key={`empty-cell-${i}`} className="p-6"></td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTable;
