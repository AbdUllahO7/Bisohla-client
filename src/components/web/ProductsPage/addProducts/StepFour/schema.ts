import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums"
import { Currency } from "@/core/entities/enums/currency.enum"
import { isPhoneFieldValid } from "@/core/lib/phone/phone.schema"
import { z } from "zod"

export const installmentPlanSchema = z.object({
    months: z.number().int().min(1),
    downPayment: z.number().min(0),
    monthlyAmount: z.number().positive(),
    noteTranslations: z
        .object({
            en: z.string().trim().max(300).nullable().optional(),
            ar: z.string().trim().max(300).nullable().optional(),
        })
        .nullable()
        .optional(),
    displayOrder: z.number().int().min(0).optional(),
});

export const getAdInformationSchema = (isRtl: boolean = false) =>
    z
        .object({
            title: z
                .string()
                .trim()
                .min(1, isRtl ? "العنوان مطلوب" : "Title is required")
                .min(3, isRtl ? "يجب أن يكون العنوان 3 أحرف على الأقل" : "Title must be at least 3 characters"),
            description: z
                .string()
                .trim()
                .min(1, isRtl ? "الوصف مطلوب" : "Description is required")
                .min(10, isRtl ? "يجب أن يكون الوصف 10 أحرف على الأقل" : "Description must be at least 10 characters"),
            price: z
                .string()
                .trim()
                .min(1, isRtl ? "السعر مطلوب" : "Price must be provided")
                .refine(
                    (val) => {
                        const num = Number(val);
                        return !isNaN(num) && num > 0;
                    },
                    {
                        message: isRtl ? "يجب أن يكون السعر رقمًا موجبًا" : "Price must be a positive number",
                    }
                ),
            countryDialCode: z.string().default("+963"),
            contactNumber: z.string().min(1, isRtl ? "رقم الهاتف مطلوب" : "Phone number is required"),
            listingType: z.nativeEnum(ListingType),
            rentType: z.nativeEnum(RentType).nullable().optional(),
            publicationDate: z.date(),
            saveStatus: z.nativeEnum(SaveStatus).default(SaveStatus.PUBLISHED),
            currency: z.nativeEnum(Currency).default(Currency.USD),
            governorate: z.string().min(1, isRtl ? "المحافظة مطلوبة" : "Governorate is required"),
            city: z.string().min(1, isRtl ? "المدينة مطلوبة" : "City is required"),
            address: z.string().min(1, isRtl ? "العنوان التفصيلي مطلوب" : "Detailed address is required"),
            latitude: z.number().nullable().optional(),
            longitude: z.number().nullable().optional(),
            detectedGovernorate: z.string().nullable().optional(),
            saveAsSavedAddress: z.boolean().default(false).optional(),
            savedAddressLabel: z.string().optional(),
            installmentsAvailable: z.boolean().default(false).optional(),
            installmentPlans: z.array(installmentPlanSchema).default([]).optional(),
        })
        .refine((d) => {
            if (d.saveAsSavedAddress) {
                return !!d.savedAddressLabel && d.savedAddressLabel.trim().length > 0;
            }
            return true;
        }, {
            message: isRtl ? "يرجى تسمية هذا العنوان" : "Please name this address",
            path: ["savedAddressLabel"]
        })
        .refine((d) => isPhoneFieldValid(d.contactNumber, d.countryDialCode), {
            message: isRtl ? "هذا ليس رقم هاتف صالحاً للدولة المختارة" : "This is not a valid phone number for the selected country",
            path: ["contactNumber"]
        })
        .refine((d) => {
            if (!d.installmentsAvailable) return true;
            return Array.isArray(d.installmentPlans) && d.installmentPlans.length > 0;
        }, {
            message: isRtl ? "مطلوب خطة تقسيط واحدة على الأقل" : "At least one installment plan is required",
            path: ["installmentPlans"]
        })
        .refine((d) => {
            if (!d.installmentsAvailable || !d.installmentPlans) return true;
            const months = d.installmentPlans.map(p => p.months);
            return new Set(months).size === months.length;
        }, {
            message: isRtl ? "يجب أن تكون مدة كل خطة (الأشهر) مختلفة" : "Each plan must have a distinct duration (months)",
            path: ["installmentPlans"]
        })
        .refine((d) => {
            if (!d.installmentsAvailable || !d.installmentPlans) return true;
            const priceNum = parseFloat(d.price);
            if (isNaN(priceNum) || priceNum <= 0) return true;
            return d.installmentPlans.every(p => p.downPayment < priceNum);
        }, {
            message: isRtl ? "يجب أن تكون الدفعة الأولى أقل من السعر الإجمالي" : "Down payment must be less than the total price",
            path: ["installmentPlans"]
        });

export const adInformationSchema = getAdInformationSchema(false);

export type AdInformationFormData = z.infer<typeof adInformationSchema>