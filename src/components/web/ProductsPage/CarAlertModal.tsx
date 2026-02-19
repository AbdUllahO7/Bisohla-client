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
                    title: initialData.id ? (isArabic ? 'تم تحديث التنبيه' : 'Alert Updated') : (isArabic ? 'تم إنشاء التنبيه' : 'Alert Created'),
                    description: initialData.id ? (isArabic ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully') : (isArabic ? 'سنقوم بإعلامك عند توفر سيارات مطابقة' : 'We will notify you when matching cars are available'),
                });
                onOpenChange(false);
            } else {
                toast({
                    title: initialData.id ? (isArabic ? 'خطأ في التحديث' : 'Update Error') : (isArabic ? 'خطأ في الإنشاء' : 'Creation Error'),
                    description: res.message || (initialData.id ? (isArabic ? 'فشل تحديث التنبيه' : 'Failed to update alert') : (isArabic ? 'فشل إنشاء التنبيه' : 'Failed to create alert')),
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: initialData.id ? (isArabic ? 'خطأ في التحديث' : 'Update Error') : (isArabic ? 'خطأ في الإنشاء' : 'Creation Error'),
                description: isArabic ? 'حدث خطأ غير متوقع' : 'Unexpected error',
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
                                {initialData.id ? (isArabic ? 'تعديل التنبيه' : 'Edit Alert') : (isArabic ? 'خبرني' : 'Notify Me')}
                            </DialogTitle>
                            <p className="text-sm text-white/95">
                                {initialData.id ? (isArabic ? 'قم بتحديث معايير التنبيه الخاص بك' : 'Update your alert criteria') : (isArabic ? 'كن أول من يعرف بالسيارات الجديدة' : 'Be first to know about new cars')}
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
                            />
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
                            />
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
                            />
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
                            />
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
                            />
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
                            />
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
                            />
                        </div>
                    </div>

                    {errors.general && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-4">
                            <p className="text-sm text-red-600 text-center font-medium">
                                {isArabic ? 'الرجاء ملء حقل واحد على الأقل' : 'Please fill at least one field'}
                            </p>
                        </div>
                    )}
                    {errors.priceRange && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-4">
                            <p className="text-sm text-red-600 text-center font-medium">
                                {isArabic ? 'الحد الأدنى للسعر يجب أن يكون أقل من أو يساوي الحد الأعلى' : 'Minimum price must be less than or equal to maximum price'}
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
                                initialData.id ? (isArabic ? 'حفظ التعديلات' : 'Save Changes') : (isArabic ? 'تفعيل التنبيه' : 'Activate Alert')
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CarAlertModal;
