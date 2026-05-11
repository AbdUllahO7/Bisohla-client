'use client'
import React from 'react';
import { ListingTypeFormSchemaDto, SectionDto } from '@/core/entities/models/listing-types/listing-types.dto';
import Text from '@/components/ui/text';
import { useDynamicForm } from '../hooks/useDynamicForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocale, useTranslations } from 'next-intl';
import DynamicSectionHeader from './DynamicSectionHeader';
import SelectableList from '../../StepOne/SelectableList';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SelectFieldWithSearch from '@/components/web/design/SelectFieldWithSearch';
import { getColorOptions } from '@/core/entities/enums/cars.enums';
import { 
  SyriaGovernorate, 
  SyriaGovernorate_ARABIC_NAMES, 
  SyriaCity, 
  SyriaCity_ARABIC_NAMES, 
  SyriaGovernorate_TO_CITIES 
} from '@/core/entities/enums/syria.enums';
import { getInjection } from '@/di/container';
// --- Sub-components for specialized rendering ---

/**
 * Renders a specialized matrix table for car damages
 * Specifically for types like 'repeating_group' with zone/type selects
 */
const DamageMatrix: React.FC<{
  attribute: any;
  value: any[];
  onChange: (value: any[]) => void;
  getTranslation: (val: any) => string;
  isArabic: boolean;
}> = ({ attribute, value, onChange, getTranslation, isArabic }) => {
  const zoneAttr = attribute.childAttributes?.find((a: any) => a.slug === 'damage_zone');
  const typeAttr = attribute.childAttributes?.find((a: any) => a.slug === 'damage_type');

  if (!zoneAttr || !typeAttr) return null;

  const zones = zoneAttr.options || [];
  const types = typeAttr.options || [];

  // Map types to colors from the previous design
  const getColor = (typeId: string) => {
    const id = typeId.toLowerCase();
    if (id.includes('paint') || id.includes('طلاء')) return 'bg-[#198341]'; // Green
    if (id.includes('scratch') || id.includes('خدش')) return 'bg-[#5e6adb]'; // Blue
    if (id.includes('replacement') || id.includes('استبدال')) return 'bg-[#b861e6]'; // Purple
    return 'bg-gray-400';
  };

  const handleToggle = (zoneId: string, typeId: string) => {
    const existing = value.find((v: any) => v.damage_zone === zoneId);
    let newValue = [...value];

    if (existing) {
      if (existing.damage_type === typeId) {
        // Toggle off
        newValue = newValue.filter((v: any) => v.damage_zone !== zoneId);
      } else {
        // Change type
        newValue = newValue.map((v: any) => 
          v.damage_zone === zoneId ? { ...v, damage_type: typeId } : v
        );
      }
    } else {
      // Add new
      newValue.push({ damage_zone: zoneId, damage_type: typeId });
    }
    onChange(newValue);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
      <table className="w-full border-collapse">
        <thead className="bg-gray-100/80">
          <tr>
            <th className="py-4 px-4 text-sm font-bold text-gray-500 text-center w-1/4 border-b border-gray-200">
              {isArabic ? "اسم القسم" : "Section Name"}
            </th>
            {types.map((type: any) => (
              <th key={type.id} className="py-4 px-2 border-b border-gray-200">
                <div className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm mx-auto",
                  getColor(type.id)
                )}>
                  <div className="w-4 h-4 rounded-full border-2 border-white/50" />
                  {getTranslation(type.label || type.name)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zones.map((zone: any, idx: number) => {
            const zoneValue = value.find(v => v.damage_zone === zone.id);
            return (
              <tr key={zone.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50/30")}>
                <td className={cn(
                  "py-4 px-6 text-sm font-semibold text-gray-700 border-b border-gray-100",
                  isArabic ? "text-right" : "text-left"
                )}>
                  {getTranslation(zone.label || zone.name)}
                </td>
                {types.map((type: any) => {
                  const isSelected = zoneValue?.damage_type === type.id;
                  return (
                    <td key={type.id} className="py-4 px-2 text-center border-b border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleToggle(zone.id, type.id)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center mx-auto",
                          isSelected 
                            ? "border-[#198341] bg-white scale-110 shadow-sm" 
                            : "border-gray-200 bg-white hover:border-[#198341]/50"
                        )}
                      >
                        {isSelected && <div className="w-3 h-3 rounded-full bg-[#198341]" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface DynamicFormStepProps {
  section: SectionDto;
  schema?: ListingTypeFormSchemaDto | null;
  onValidationChange: (isValid: boolean) => void;
  isEditMode?: boolean;
  initialData?: any;
}

const DynamicFormStep: React.FC<DynamicFormStepProps> = ({ 
  section, 
  schema,
  onValidationChange,
  initialData 
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations('addProduct.enteredData.stepTwo'); // Match the nested path in ar.json

  // Helper to extract translation from objects like { ar: "...", en: "..." }
  const getTranslation = (val: any) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[locale] || val['en'] || val['ar'] || JSON.stringify(val);
    }
    return String(val);
  };

  // Inject location fields if they are missing from the "Vehicle Information" section
  // but are required for the backend submission to succeed.
  const attributes = React.useMemo(() => {
    let baseAttrs = section.attributes.map(attr => {
      // Transform doors attribute to string select with max 4
      if (attr.slug?.toLowerCase() === 'doors') {
        const doorOptions = ['1', '2', '3', '4'].map(val => ({
          id: val,
          name: { ar: val, en: val }
        }));
        
        return {
          ...attr,
          type: 'select',
          options: doorOptions
        } as any;
      }
      return attr;
    });

    return baseAttrs.sort((a, b) => a.order - b.order);
  }, [section.attributes, locale, schema]);

  const { 
    formData, 
    referenceOptions, 
    loadingOptions, 
    handleFieldChange 
  } = useDynamicForm(attributes, onValidationChange, initialData);

  // Helper to detect if a field should be rendered as a calendar
  const isDateLike = (attr: any) => {
    if (attr.type === 'date') return true;
    const name = (getTranslation(attr.name) || "").toLowerCase();
    const slug = (attr.slug || "").toLowerCase();
    const dateNames = ['date', 'year', 'سنة', 'تاريخ'];
    return dateNames.some(d => name.includes(d) || slug.includes(d));
  };

  return (
    <div className="space-y-8" dir={isArabic ? "rtl" : "ltr"}>
      <DynamicSectionHeader title={getTranslation(section.name)} />
      
      <div className="space-y-10">
        {/* Render Reference Fields & Location Cards (Image 1 Design) */}
        {(attributes.some(a => a.type === 'reference' || a.slug === 'governorate' || a.slug === 'city')) && (
          <div className="flex flex-wrap justify-center gap-10 pb-10 border-b border-gray-100 mb-6">
            {attributes
              .filter(a => a.type === 'reference' || a.slug === 'governorate' || a.slug === 'city')
              .sort((a, b) => a.order - b.order)
              .map((attr) => {
                const slug = (attr.slug || "").toLowerCase();
                const isGovernorate = slug === 'governorate' || slug === 'محافظة';
                const isCity = slug === 'city' || slug === 'مدينة';

                // Get options based on type
                let options: { value: string; label: string; logoUrl?: string | null }[] = [];
                if (isGovernorate) {
                  options = Object.values(SyriaGovernorate).map((gov) => ({
                    value: gov,
                    label: isArabic 
                      ? SyriaGovernorate_ARABIC_NAMES[gov] 
                      : gov.replace(/-/g, ' ')
                  }));
                } else if (isCity) {
                  const selectedGov = formData['governorate'] as SyriaGovernorate;
                  const cityList = selectedGov && SyriaGovernorate_TO_CITIES[selectedGov] 
                    ? SyriaGovernorate_TO_CITIES[selectedGov] 
                    : [];
                  options = cityList.map(city => ({
                    value: city,
                    label: isArabic ? SyriaCity_ARABIC_NAMES[city] : city.replace(/-/g, ' ')
                  }));
                } else {
                  options = referenceOptions[attr.id]?.map(opt => ({
                    value: opt.id.toString(),
                    label: getTranslation(opt.name),
                    logoUrl: opt.logoUrl || opt.iconUrl
                  })) || [];
                }

                return (
                  <SelectableList
                    key={attr.id}
                    title={getTranslation(attr.name)}
                    type={isGovernorate ? "governorate" : isCity ? "city" : "marka"} // marka is generic for reference logic
                    options={options}
                    selectedValue={formData[attr.slug]?.toString() || ""}
                    direction={isArabic ? 'rtl' : 'ltr'}
                    onSelect={(type, val) => handleFieldChange(attr.slug, val)}
                    required={attr.isRequired}
                  />
                );
              })}
          </div>
        )}

        {/* Render Other Fields (Grid Design) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {[...attributes]
            .filter(a => {
              const s = (a.slug || "").toLowerCase();
              return (
                a.type !== 'reference' && 
                s !== 'governorate' && 
                s !== 'city' &&
                s !== 'محافظة' &&
                s !== 'مدينة' &&
                a.type !== 'multi_select' && 
                a.type !== 'boolean' && 
                !isDateLike(a)
              );
            })
            .sort((a, b) => a.order - b.order)
            .map((attr) => {
              const type = (attr.type || "").toLowerCase();
              const slug = (attr.slug || "").toLowerCase();
              const isColorField = slug.includes('color') || slug.includes('لون');
              const isAddress = slug === 'address' || slug === 'عنوان';
              const isLocation = isAddress; // Only address left in this grid for location-style labels
              
              return (
                <div 
                  key={attr.id} 
                  className={cn(
                    "space-y-4", 
                    (isAddress || attr.type === 'textarea') ? "md:col-span-2 lg:col-span-4" : ""
                  )}
                >
                  {/* Label Rendering */}
                  <div className={cn("flex flex-col gap-2", isLocation && "mb-2")}>
                    <div className="flex items-center gap-1.5 pb-1">
                      <Label className={cn(
                        "text-[#1a2b28] font-bold tracking-tight",
                        isLocation ? "text-2xl" : "text-base"
                      )}>
                        {getTranslation(attr.name)}
                        {attr.isRequired && <span className={cn("text-red-500", isArabic ? "mr-1" : "ml-1")}>*</span>}
                      </Label>
                      {attr.hint && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{getTranslation(attr.hint)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>


                  {/* Field Rendering */}
                  {(() => {
                    // Force color fields to be SelectFieldWithSearch even if API type is 'text'
                    if (isColorField || type === 'select' || type === 'dropdown') {
                      let combinedOptions: any[] = [];
                      if (isColorField) {
                        combinedOptions = getColorOptions(t).map(opt => ({
                          value: opt.value,
                          label: opt.label
                        }));
                      } else {
                        const fixedOptions = Array.isArray(attr.options) ? attr.options : [];
                        const fetchedOptions = referenceOptions[attr.id] || [];
                        combinedOptions = [
                          ...fixedOptions.map((opt: any) => ({
                            value: (opt.id || opt.value || opt).toString(),
                            label: getTranslation(opt.name || opt.label || opt)
                          })),
                          ...fetchedOptions.map((opt: any) => ({
                            value: opt.id.toString(),
                            label: getTranslation(opt.name),
                          }))
                        ];
                      }

                      return (
                        <SelectFieldWithSearch
                          name={attr.slug}
                          options={combinedOptions}
                          value={formData[attr.slug]?.toString() || ""}
                          onChange={(name, val) => handleFieldChange(name, val)}
                          placeholder={getTranslation(attr.hint || attr.name)}
                          searchPlaceholder={isArabic ? `بحث في ${getTranslation(attr.name)}...` : `Search ${getTranslation(attr.name)}...`}
                          emptyMessage={isArabic ? "لا توجد نتائج" : "No results found"}
                          isRtl={isArabic}
                          SelectTriggerStyle="h-11 border-gray-300 focus:border-[#198341]"
                        />
                      );
                    }

                    if (type === 'text' || type === 'number' || type === 'string') {
                      return (
                        <Input
                          type={type === 'number' ? 'number' : 'text'}
                          placeholder={getTranslation(attr.hint || attr.name)}
                          value={formData[attr.slug] || ''}
                          onChange={(e) => handleFieldChange(attr.slug, e.target.value)}
                          className={cn("h-11 border-gray-300 focus:border-[#198341] transition-all", isArabic && "text-right")}
                          dir={isArabic ? "rtl" : "ltr"}
                        />
                      );
                    }

                    if (type === 'textarea') {
                      return (
                        <Textarea
                          placeholder={getTranslation(attr.hint || attr.name)}
                          value={formData[attr.slug] || ''}
                          onChange={(e) => handleFieldChange(attr.slug, e.target.value)}
                          className={cn("min-h-[120px] border-gray-300 focus:border-[#198341] transition-all", isArabic && "text-right")}
                          dir={isArabic ? "rtl" : "ltr"}
                        />
                      );
                    }

                    if (type === 'boolean' || type === 'checkbox') {
                      return (
                        <div className="flex items-center gap-2 h-11">
                          <Checkbox 
                            id={`attr-${attr.slug}`}
                            checked={!!formData[attr.slug]}
                            onCheckedChange={(checked) => handleFieldChange(attr.slug, checked)}
                            className="data-[state=checked]:bg-[#198341] data-[state=checked]:border-[#198341]"
                          />
                          <Label htmlFor={`attr-${attr.slug}`} className="text-sm text-gray-500 cursor-pointer">
                            {getTranslation(attr.hint || attr.name)}
                          </Label>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              );
            })}
          
          {/* Render Repeating Groups (Matrix UI) */}
          {attributes
            .filter(a => a.type?.toLowerCase() === 'repeating_group')
            .sort((a, b) => a.order - b.order)
            .map((attr) => (
              <div key={attr.id} className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
                <DamageMatrix 
                  attribute={attr}
                  value={formData[attr.slug] || []}
                  onChange={(val) => handleFieldChange(attr.slug, val)}
                  getTranslation={getTranslation}
                  isArabic={isArabic}
                />
              </div>
            ))}
          
          {/* Render Date Fields (Calendar) */}
          {attributes
            .filter(a => isDateLike(a))
            .sort((a, b) => a.order - b.order)
            .map((attr) => (
              <div key={attr.id} className="space-y-4">
                {/* Label Rendering matched with standard fields */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 pb-1">
                    <Label className="text-[#1a2b28] font-bold tracking-tight text-base">
                      {getTranslation(attr.name)}
                      {attr.isRequired && <span className={cn("text-red-500", isArabic ? "mr-1" : "ml-1")}>*</span>}
                    </Label>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-11 px-3 text-left font-normal border-gray-300 focus:border-[#198341] justify-between rounded-xl shadow-sm transition-all hover:bg-slate-50",
                        !formData[attr.slug] && "text-muted-foreground",
                        isArabic && "text-right"
                      )}
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      {formData[attr.slug] ? (
                        format(new Date(formData[attr.slug]), "PPP")
                      ) : (
                        <span>{getTranslation(attr.hint || attr.name)}</span>
                      )}
                      <CalendarIcon className="h-4 w-4 opacity-50 text-[#198341]" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start" dir={isArabic ? "rtl" : "ltr"}>
                    <Calendar
                      mode="single"
                      selected={formData[attr.slug] ? new Date(formData[attr.slug]) : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        if (attr.type === 'number') {
                          handleFieldChange(attr.slug, date.getFullYear().toString());
                        } else {
                          handleFieldChange(attr.slug, date.toISOString());
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ))}
        </div>

        {/* Feature Groups (Image 2 Design Restoration) */}
        {attributes.some(a => a.type === 'multi_select' || a.type === 'boolean') && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Each multi_select attribute gets its own Card */}
              {attributes
                .filter(a => a.type === 'multi_select')
                .sort((a, b) => a.order - b.order)
                .map((attr) => {
                  const options = Array.isArray(attr.options) ? attr.options : [];
                  const selectedValues = Array.isArray(formData[attr.slug]) ? formData[attr.slug] : [];
                  const progress = options.length > 0 ? (selectedValues.length / options.length) * 100 : 0;
                  
                  return (
                    <Card key={attr.id} className="border-0 shadow-sm bg-white overflow-hidden rounded-2xl border border-gray-100">
                      <CardHeader className="bg-gray-50/50 border-b py-5 px-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <Text className="font-bold text-gray-800 text-lg">
                            {getTranslation(attr.name)}
                          </Text>
                          <div className="bg-[#1e293b] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            {selectedValues.length}/{options.length}
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#198341] transition-all duration-500 ease-in-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        {options.map((option: any) => {
                          const optionId = (option.id || option.value || option).toString();
                          const isChecked = selectedValues.includes(optionId);
                          
                          return (
                            <div 
                              key={optionId} 
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl transition-all duration-200 border border-transparent",
                                isChecked ? "bg-gray-50 border-gray-200 shadow-sm" : "hover:bg-gray-50/50"
                              )}
                            >
                              <div className={cn("flex items-center gap-3 flex-1")}>
                                <Checkbox 
                                  id={`attr-${attr.id}-${optionId}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    const newValues = checked 
                                      ? [...selectedValues, optionId]
                                      : selectedValues.filter((v: string) => v !== optionId);
                                    handleFieldChange(attr.slug, newValues);
                                  }}
                                  className="data-[state=checked]:bg-[#198341] data-[state=checked]:border-[#198341] w-5 h-5 rounded"
                                />
                                <Label htmlFor={`attr-${attr.id}-${optionId}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                                  {getTranslation(option.name || option.label || option)}
                                </Label>
                              </div>
                              {isChecked && (
                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}

              {/* 2. Boolean attributes grouped together */}
              {(() => {
                const booleans = attributes.filter(a => a.type === 'boolean');
                if (booleans.length === 0) return null;
                
                // Group booleans by referenceGroup or section name
                const groups: Record<string, typeof booleans> = {};
                booleans.forEach(b => {
                  const gName = getTranslation(b.referenceGroup?.name || b.section?.name) || (isArabic ? "ميزات إاضافية" : "Other Features");
                  if (!groups[gName]) groups[gName] = [];
                  groups[gName].push(b);
                });

                return Object.entries(groups).map(([gName, attrs]) => {
                  const selectedCount = attrs.filter(a => !!formData[a.slug]).length;
                  const progress = (selectedCount / attrs.length) * 100;

                  return (
                    <Card key={gName} className="border-0 shadow-sm bg-white overflow-hidden rounded-2xl border border-gray-100">
                      <CardHeader className="bg-gray-50/50 border-b py-5 px-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <Text className="font-bold text-gray-800 text-lg">
                            {gName}
                          </Text>
                          <div className="bg-[#1e293b] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            {selectedCount}/{attrs.length}
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#198341] transition-all duration-500 ease-in-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        {attrs.map(attr => {
                          const isChecked = !!formData[attr.slug];
                          return (
                            <div 
                              key={attr.id} 
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl transition-all duration-200 border border-transparent",
                                isChecked ? "bg-gray-50 border-gray-200 shadow-sm" : "hover:bg-gray-50/50"
                              )}
                            >
                              <div className={cn("flex items-center gap-3 flex-1")}>
                                <Checkbox 
                                  id={`attr-${attr.slug}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handleFieldChange(attr.slug, checked)}
                                  className="data-[state=checked]:bg-[#198341] data-[state=checked]:border-[#198341] w-5 h-5 rounded"
                                />
                                <Label htmlFor={`attr-${attr.slug}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                                  {getTranslation(attr.name)}
                                </Label>
                              </div>
                              {isChecked && (
                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicFormStep;
