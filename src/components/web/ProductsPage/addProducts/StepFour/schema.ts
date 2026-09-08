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

export const adInformationSchema = z
    .object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        price: z.string().min(1, "Price must be provided"),
        countryDialCode: z.string().default("+963"),
        contactNumber: z.string().min(1, "listing.errors.contact_number_required"),
        listingType: z.nativeEnum(ListingType),
        rentType: z.nativeEnum(RentType).nullable().optional(),
        publicationDate: z.date(),
        saveStatus: z.nativeEnum(SaveStatus).default(SaveStatus.PUBLISHED),
        currency: z.nativeEnum(Currency).default(Currency.USD),
        governorate: z.string().min(1, "Governorate is required"),
        city: z.string().min(1, "City is required"),
        address: z.string().min(1, "Detailed address is required"),
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
        message: "listing.errors.saved_address_label_required",
        path: ["savedAddressLabel"]
    })
    .refine((d) => isPhoneFieldValid(d.contactNumber, d.countryDialCode), {
        message: "listing.errors.contact_number_invalid",
        path: ["contactNumber"]
    })
    .refine((d) => {
        if (!d.installmentsAvailable) return true;
        return Array.isArray(d.installmentPlans) && d.installmentPlans.length > 0;
    }, {
        message: "errors.plans_required",
        path: ["installmentPlans"]
    })
    .refine((d) => {
        if (!d.installmentsAvailable || !d.installmentPlans) return true;
        const months = d.installmentPlans.map(p => p.months);
        return new Set(months).size === months.length;
    }, {
        message: "errors.months_duplicate",
        path: ["installmentPlans"]
    })
    .refine((d) => {
        if (!d.installmentsAvailable || !d.installmentPlans) return true;
        const priceNum = parseFloat(d.price);
        if (isNaN(priceNum) || priceNum <= 0) return true;
        return d.installmentPlans.every(p => p.downPayment < priceNum);
    }, {
        message: "errors.down_payment_too_high",
        path: ["installmentPlans"]
    });

export type AdInformationFormData = z.infer<typeof adInformationSchema>