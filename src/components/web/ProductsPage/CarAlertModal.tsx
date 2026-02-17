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
import { useToast } from '@/hooks/use-toast';
import { createCarAlert } from '@/core/infrastructure-adapters/actions/users/car-alert.user.actions';
import { Bell, Loader2 } from 'lucide-react';
import { getCarMakes, getCarModels, getCarTrims } from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { SelectCarMakeDto, SelectCarModelDto, SelectCarTrimDto } from '@/core/entities/models/cars/cars.dto';
import { cn } from '@/lib/utils';

interface CarAlertModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: {
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

    const [options, setOptions] = useState<{
        makes: { value: string; label: string }[];
        models: { value: string; label: string }[];
        trims: { value: string; label: string }[];
    }>({
        makes: [],
        models: [],
        trims: [],
    });

    const [isLoadingOptions, setIsLoadingOptions] = useState({
        makes: false,
        models: false,
        trims: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { toast } = useToast();

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

    useEffect(() => {
        if (open) {
            const fetchMakes = async () => {
                setIsLoadingOptions(prev => ({ ...prev, makes: true }));
                try {
                    const res = await getCarMakes({ pageSize: 200, sortBy: 'name', sortDirection: 'asc' });
                    if (res.success && res.data?.data) {
                        setOptions(prev => ({
                            ...prev,
                            makes: res.data!.data.map((m: SelectCarMakeDto) => ({ value: String(m.id), label: m.name }))
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching makes:', error);
                } finally {
                    setIsLoadingOptions(prev => ({ ...prev, makes: false }));
                }
            };
            fetchMakes();
        }
    }, [open]);

    useEffect(() => {
        if (open && formData.makeId > 0) {
            const fetchModels = async () => {
                setIsLoadingOptions(prev => ({ ...prev, models: true }));
                try {
                    const res = await getCarModels({
                        pageSize: 200,
                        sortBy: 'name',
                        sortDirection: 'asc',
                        where: [{ field: 'makeId', operator: 'eq', value: formData.makeId }]
                    });
                    if (res.success && res.data?.data) {
                        setOptions(prev => ({
                            ...prev,
                            models: res.data!.data.map((m: SelectCarModelDto) => ({ value: String(m.id), label: m.name }))
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching models:', error);
                } finally {
                    setIsLoadingOptions(prev => ({ ...prev, models: false }));
                }
            };
            fetchModels();
        } else {
            setOptions(prev => ({ ...prev, models: [], trims: [] }));
        }
    }, [open, formData.makeId]);

    useEffect(() => {
        if (open && formData.modelId > 0) {
            const fetchTrims = async () => {
                setIsLoadingOptions(prev => ({ ...prev, trims: true }));
                try {
                    const res = await getCarTrims({
                        pageSize: 200,
                        sortBy: 'name',
                        sortDirection: 'asc',
                        where: [{ field: 'modelId', operator: 'eq', value: formData.modelId }]
                    });
                    if (res.success && res.data?.data) {
                        setOptions(prev => ({
                            ...prev,
                            trims: res.data!.data.map((t: SelectCarTrimDto) => ({ value: String(t.id), label: t.name }))
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching trims:', error);
                } finally {
                    setIsLoadingOptions(prev => ({ ...prev, trims: false }));
                }
            };
            fetchTrims();
        } else {
            setOptions(prev => ({ ...prev, trims: [] }));
        }
    }, [open, formData.modelId]);

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
        if (!formData.makeId || formData.makeId <= 0) newErrors.makeId = 'Required';
        if (!formData.modelId || formData.modelId <= 0) newErrors.modelId = 'Required';
        if (!formData.trimId || formData.trimId <= 0) newErrors.trimId = 'Required';
        if (!formData.minPrice || formData.minPrice <= 0) newErrors.minPrice = 'Required';
        if (!formData.maxPrice || formData.maxPrice <= 0) newErrors.maxPrice = 'Required';
        if (!formData.governorate) newErrors.governorate = 'Required';
        if (!formData.city) newErrors.city = 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const res = await createCarAlert({
                makeId: Number(formData.makeId),
                modelId: Number(formData.modelId),
                trimId: Number(formData.trimId),
                minPrice: Number(formData.minPrice),
                maxPrice: Number(formData.maxPrice),
                governorate: formData.governorate,
                city: formData.city,
            });

            if (res.success) {
                toast({
                    title: t('allCars.alertCreated'),
                    description: t('allCars.alertCreatedDesc'),
                });
                onOpenChange(false);
            } else {
                toast({
                    title: t('allCars.alertCreateError'),
                    description: res.message || t('allCars.alertCreateErrorDesc'),
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: t('allCars.alertCreateError'),
                description: t('allCars.alertCreateErrorDesc'),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const cityOptions = formData.governorate ? getCityOptions(formData.governorate) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-white rounded-3xl border-none shadow-2xl overflow-hidden">
                {/* Premium Header with Gradient */}
                <div className="relative bg-primary-light px-8 py-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className={cn("relative flex items-center gap-4", isArabic ? "flex-row" : "flex-row-reverse")}>
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <div >
                            <DialogTitle className="text-3xl font-bold text-white m-0 mb-1">
                                {isArabic ? 'خبرني' : 'Notify Me'}
                            </DialogTitle>
                            <p className="text-sm text-white/95">
                                {isArabic ? 'كن أول من يعرف بالسيارات الجديدة' : 'Be first to know about new cars'}
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
                                {isArabic ? 'الماركة' : 'Make'}
                            </Label>
                            <SelectDropdown
                                options={options.makes}
                                value={formData.makeId ? String(formData.makeId) : ''}
                                onChange={(name: string, val: string) => {
                                    handleChange('makeId', val);
                                    handleChange('modelId', 0);
                                    handleChange('trimId', 0);
                                }}
                                placeholder={isLoadingOptions.makes ? (isArabic ? 'جاري التحميل...' : 'Loading...') : (isArabic ? 'اختر' : 'Select')}
                                SelectTriggerStyle={cn("h-12 rounded-xl border-2 transition-all", errors.makeId ? "border-red-400 bg-red-50/50 focus:ring-red-400" : "border-slate-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20")}
                                disabled={isLoadingOptions.makes}
                            />
                            {errors.makeId && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    {isArabic ? 'مطلوب' : 'Required'}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {isArabic ? 'الموديل' : 'Model'}
                            </Label>
                            <SelectDropdown
                                options={options.models}
                                value={formData.modelId ? String(formData.modelId) : ''}
                                onChange={(name: string, val: string) => {
                                    handleChange('modelId', val);
                                    handleChange('trimId', 0);
                                }}
                                placeholder={isLoadingOptions.models ? (isArabic ? 'جاري...' : 'Loading...') : (isArabic ? 'اختر' : 'Select')}
                                SelectTriggerStyle={cn("h-12 rounded-xl border-2 transition-all", errors.modelId ? "border-red-400 bg-red-50/50 focus:ring-red-400" : "border-slate-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20")}
                                disabled={!formData.makeId || isLoadingOptions.models}
                            />
                            {errors.modelId && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    {isArabic ? 'مطلوب' : 'Required'}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {isArabic ? 'الفئة' : 'Trim'}
                            </Label>
                            <SelectDropdown
                                options={options.trims}
                                value={formData.trimId ? String(formData.trimId) : ''}
                                onChange={(name: string, val: string) => handleChange('trimId', val)}
                                placeholder={isLoadingOptions.trims ? (isArabic ? 'جاري...' : 'Loading...') : (isArabic ? 'اختر' : 'Select')}
                                SelectTriggerStyle={cn("h-12 rounded-xl border-2 transition-all", errors.trimId ? "border-red-400 bg-red-50/50 focus:ring-red-400" : "border-slate-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20")}
                                disabled={!formData.modelId || isLoadingOptions.trims}
                            />
                            {errors.trimId && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    {isArabic ? 'مطلوب' : 'Required'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {isArabic ? 'السعر الأدنى (ل.س)' : 'Min Price (SYP)'}
                            </Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.minPrice || ''}
                                onChange={(e) => handleChange('minPrice', Number(e.target.value))}
                                className={cn("h-12 rounded-xl border-2 transition-all text-base", errors.minPrice ? "border-red-400 bg-red-50/50" : "border-slate-200 hover:border-primary/50 focus:border-primary")}
                            />
                            {errors.minPrice && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    {isArabic ? 'مطلوب' : 'Required'}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {isArabic ? 'السعر الأعلى (ل.س)' : 'Max Price (SYP)'}
                            </Label>
                            <Input
                                type="number"
                                placeholder="∞"
                                value={formData.maxPrice || ''}
                                onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
                                className={cn("h-12 rounded-xl border-2 transition-all text-base", errors.maxPrice ? "border-red-400 bg-red-50/50" : "border-slate-200 hover:border-primary/50 focus:border-primary")}
                            />
                            {errors.maxPrice && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    {isArabic ? 'مطلوب' : 'Required'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {isArabic ? 'المحافظة' : 'Governorate'}
                            </Label>
                            <SelectDropdown
                                options={governorateOptions}
                                value={formData.governorate}
                                onChange={(name: string, val: string) => {
                                    handleChange('governorate', val);
                                    handleChange('city', '');
                                }}
                                placeholder={isArabic ? 'اختر' : 'Select'}
                                SelectTriggerStyle={cn("h-12 rounded-xl border-2 transition-all", errors.governorate ? "border-red-400 bg-red-50/50 focus:ring-red-400" : "border-slate-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20")}
                            />
                            {errors.governorate && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    {isArabic ? 'مطلوب' : 'Required'}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                {isArabic ? 'المدينة' : 'City'}
                            </Label>
                            <SelectDropdown
                                options={cityOptions}
                                value={formData.city}
                                onChange={(name: string, val: string) => handleChange('city', val)}
                                placeholder={isArabic ? 'اختر' : 'Select'}
                                SelectTriggerStyle={cn("h-12 rounded-xl border-2 transition-all", errors.city ? "border-red-400 bg-red-50/50 focus:ring-red-400" : "border-slate-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20")}
                                disabled={!formData.governorate}
                            />
                            {errors.city && (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                    {isArabic ? 'مطلوب' : 'Required'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-sm text-red-600 text-center font-medium">
                                {isArabic ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields'}
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
                            {isArabic ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 h-14 text-base rounded-xl bg-primary-light hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-bold transition-all shadow-md"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                                </>
                            ) : (
                                isArabic ? 'تفعيل التنبيه' : 'Activate Alert'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CarAlertModal;
