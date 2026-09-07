import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums"
import { Currency } from "@/core/entities/enums/currency.enum"
import { isPhoneFieldValid } from "@/core/lib/phone/phone.schema"
import { z } from "zod"

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
        address: z.string().min(1, "Detailed address is required")
    })
    .refine((d) => isPhoneFieldValid(d.contactNumber, d.countryDialCode), {
        message: "listing.errors.contact_number_invalid",
        path: ["contactNumber"]
    })

export type AdInformationFormData = z.infer<typeof adInformationSchema>