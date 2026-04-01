'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SelectDropdown from '@/components/SelectDropdown';
import ServerSelect from '@/components/server-select';
import { useToast } from '@/hooks/use-toast';
import { createCarAlert, updateCarAlert } from '@/core/infrastructure-adapters/actions/users/car-alert.user.actions';
import { Bell, Loader2 } from 'lucide-react';
import { getCarMakes, getCarModels, getCarTrims } from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { SelectCarMakeDto, SelectCarModelDto, SelectCarTrimDto } from '@/core/entities/models/cars/cars.dto';
import { cn } from '@/lib/utils';

interface CarAlertModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: {
        id?: number;
        makeId?: number;
        modelId?: number;
        trimId?: number;
        minPrice?: number;
        maxPrice?: number;
        governorate?: string;
        city?: string;
    };
    governorateOptions: any[];
    getCityOptions: (governorate: string) => any[];
    isArabic: boolean;
    t: any;
}

const CarAlertModal: React.FC<CarAlertModalProps> = ({
    open,
    onOpenChange,
    initialData,
    governorateOptions,
    getCityOptions,
    isArabic,
    t,
}) => {
    const [formData, setFormData] = useState({
        makeId: initialData.makeId || 0,
        modelId: initialData.modelId || 0,
        trimId: initialData.trimId || 0,
        minPrice: initialData.minPrice || 0,
        maxPrice: initialData.maxPrice || 0,
        governorate: initialData.governorate || '',
        city: initialData.city || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isCarTrimRequired, setIsCarTrimRequired] = useState(true); // Default to true to be safe
    const { toast } = useToast();
    const tModal = useTranslations('carAlertModal');

    // Effect to check if trim is required for selected make
    useEffect(() => {
        if (formData.makeId > 0) {
            const fetchMakeDetails = async () => {
                try {
                    const response = await getCarMakes({
                        pageSize: 1,
                        where: [{ field: 'id', operator: 'eq', value: formData.makeId }]
                    });
                    if (response.success && response.data?.data?.[0]) {
                        setIsCarTrimRequired(!!response.data.data[0].isCarTrimRequired);
                    }
                } catch (error) {
                    console.error('Failed to fetch make details:', error);
                }
            };
            fetchMakeDetails();
        } else {
            setIsCarTrimRequired(true); // Default when no make selected
        }
    }, [formData.makeId]);

    useEffect(() => {
        if (open) {
            setFormData({
                makeId: initialData.makeId || 0,
                modelId: initialData.modelId || 0,
                trimId: initialData.trimId || 0,
                minPrice: initialData.minPrice || 0,
                maxPrice: initialData.maxPrice || 0,
                governorate: initialData.governorate || '',
                city: initialData.city || '',
            });
            setErrors({});
        }
    }, [open, initialData]);



    const handleChange = (name: string, value: any) => {
        const numericFields = ['makeId', 'modelId', 'trimId', 'minPrice', 'maxPrice'];
        const finalValue = numericFields.includes(name) ? Number(value) : value;

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Require at least one field to be filled
        if (
            (!formData.makeId || formData.makeId <= 0) &&
            (!formData.modelId || formData.modelId <= 0) &&
            (!formData.trimId || formData.trimId <= 0) &&
            (!formData.minPrice || formData.minPrice <= 0) &&
            (!formData.maxPrice || formData.maxPrice <= 0) &&
            !formData.governorate &&
            !formData.city
        ) {
            newErrors.general = 'Required';
        }

        if (
            formData.minPrice && formData.minPrice > 0 &&
            formData.maxPrice && formData.maxPrice > 0 &&
            formData.minPrice > formData.maxPrice
        ) {
            newErrors.priceRange = 'Invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const payload: any = {
                makeId: formData.makeId > 0 ? Number(formData.makeId) : null,
                modelId: formData.modelId > 0 ? Number(formData.modelId) : null,
                trimId: formData.trimId > 0 ? Number(formData.trimId) : null,
                minPrice: formData.minPrice > 0 ? Number(formData.minPrice) : null,
                maxPrice: formData.maxPrice > 0 ? Number(formData.maxPrice) : null,
                governorate: formData.governorate || null,
                city: formData.city || null,
            };

            let res;
            if (initialData.id) {
                res = await updateCarAlert(initialData.id, payload);
            } else {
                res = await createCarAlert(payload);
            }

            if (res.success) {
                toast({
                    title: initialData.id ? tModal('alertUpdated') : tModal('alertCreated'),
                    description: initialData.id ? tModal('changesSaved') : tModal('willNotify'),
                });
                onOpenChange(false);
            } else {
                toast({
                    title: initialData.id ? tModal('updateError') : tModal('creationError'),
                    description: res.message || (initialData.id ? tModal('failedUpdate') : tModal('failedCreate')),
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: initialData.id ? tModal('updateError') : tModal('creationError'),
                description: tModal('unexpectedError'),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const cityOptions = formData.governorate ? getCityOptions(formData.governorate) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                dir={isArabic ? 'rtl' : 'ltr'}
                className="sm:max-w-2xl p-0 gap-0 bg-white rounded-3xl border-none shadow-2xl overflow-hidden"
            >
                {/* Premium Header with Gradient */}
                <div className="relative bg-primary-light px-8 py-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative flex items-center gap-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <div className='flex flex-col items-start'>
                            <DialogTitle className="text-3xl font-bold text-white m-0 mb-1">
                                {initialData.id ? tModal('editAlert') : tModal('notifyMe')}
                            </DialogTitle>
                            <p className="text-sm text-white/95">
                                {initialData.id ? tModal('updateCriteria') : tModal('beFirst')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Spacious Form Content */}
                <div className="px-8 py-8 space-y-6">
                    {/* Car Selection Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {tModal('make')}
                            </Label>
                            <ServerSelect<SelectCarMakeDto, 'id'>
                                queryKey={['car-makes-alert']}
                                fetchFn={getCarMakes}
                                labelField="name"
                                valueField="id"
                                placeholder={tModal('select')}
                                searchPlaceholder={isArabic ? 'ابحث عن الماركات...' : 'Search makes...'}
                                noOptionsMessage={isArabic ? 'لم يتم العثور على ماركات' : 'No makes found'}
                                value={formData.makeId > 0 ? formData.makeId : undefined}
                                onChange={(val: number | number[] | undefined) => {
                                    const selectedVal = Array.isArray(val) ? val[0] : (val || 0);
                                    handleChange('makeId', selectedVal);
                                    handleChange('modelId', 0);
                                    handleChange('trimId', 0);
                                }}
                                pageSize={20}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {tModal('model')}
                            </Label>
                            <ServerSelect<SelectCarModelDto, 'id'>
                                queryKey={['car-models-alert', String(formData.makeId)]}
                                fetchFn={(params) => getCarModels({
                                    ...params,
                                    where: [{ field: 'makeId', operator: 'eq', value: formData.makeId }]
                                })}
                                labelField="name"
                                valueField="id"
                                placeholder={tModal('select')}
                                searchPlaceholder={isArabic ? 'ابحث عن الموديلات...' : 'Search models...'}
                                noOptionsMessage={isArabic ? 'لم يتم العثور على موديلات' : 'No models found'}
                                value={formData.modelId > 0 ? formData.modelId : undefined}
                                onChange={(val: number | number[] | undefined) => {
                                    const selectedVal = Array.isArray(val) ? val[0] : (val || 0);
                                    handleChange('modelId', selectedVal);
                                    handleChange('trimId', 0);
                                }}
                                pageSize={20}
                                disabled={!formData.makeId || formData.makeId === 0}
                            />
                        </div>
                        {isCarTrimRequired && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">
                                    {tModal('trim')}
                                </Label>
                                <ServerSelect<SelectCarTrimDto, 'id'>
                                    queryKey={['car-trims-alert', String(formData.modelId)]}
                                    fetchFn={(params) => getCarTrims({
                                        ...params,
                                        where: [{ field: 'modelId', operator: 'eq', value: formData.modelId }]
                                    })}
                                    labelField="name"
                                    valueField="id"
                                    placeholder={tModal('select')}
                                    searchPlaceholder={isArabic ? 'ابحث عن الفئات...' : 'Search trims...'}
                                    noOptionsMessage={isArabic ? 'لم يتم العثور على فئات' : 'No trims found'}
                                    value={formData.trimId > 0 ? formData.trimId : undefined}
                                    onChange={(val: number | number[] | undefined) => {
                                        const selectedVal = Array.isArray(val) ? val[0] : (val || 0);
                                        handleChange('trimId', selectedVal);
                                    }}
                                    pageSize={20}
                                    disabled={!formData.modelId || formData.modelId === 0}
                                />
                            </div>
                        )}
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {tModal('minPriceSyp')}
                            </Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.minPrice || ''}
                                onChange={(e) => handleChange('minPrice', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {tModal('maxPriceSyp')}
                            </Label>
                            <Input
                                type="number"
                                placeholder="∞"
                                value={formData.maxPrice || ''}
                                onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {tModal('governorate')}
                            </Label>
                            <SelectDropdown
                                options={governorateOptions}
                                value={formData.governorate}
                                onChange={(name: string, val: string) => {
                                    handleChange('governorate', val);
                                    handleChange('city', '');
                                }}
                                placeholder={tModal('select')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {tModal('city')}
                            </Label>
                            <SelectDropdown
                                options={cityOptions}
                                value={formData.city}
                                onChange={(name: string, val: string) => handleChange('city', val)}
                                placeholder={tModal('select')}
                            />
                        </div>
                    </div>

                    {errors.general && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-4">
                            <p className="text-sm text-red-600 text-center font-medium">
                                {tModal('fillOneField')}
                            </p>
                        </div>
                    )}
                    {errors.priceRange && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-4">
                            <p className="text-sm text-red-600 text-center font-medium">
                                {tModal('priceRangeError')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Premium Footer */}
                <DialogFooter className="px-8 py-6 border-t border-slate-200">
                    <div className="flex w-full gap-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-14 text-base font-semibold rounded-xl border-2 hover:bg-white transition-all"
                        >
                            {tModal('cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 h-14 text-base rounded-xl bg-primary-light hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-bold transition-all shadow-md"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {tModal('saving')}
                                </>
                            ) : (
                                initialData.id ? tModal('saveChanges') : tModal('activateAlert')
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CarAlertModal;
