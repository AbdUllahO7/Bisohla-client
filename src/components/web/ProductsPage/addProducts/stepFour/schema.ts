import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums"
import { Currency } from "@/core/entities/enums/currency.enum"
import { z } from "zod"

export const adInformationSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.string().min(1, "Price must be provided"),
    contactNumber: z
        .string()
        .min(10, "Contact number must be at least 10 digits")
        .max(20, "Contact number must be at most 20 digits"),
    listingType: z.nativeEnum(ListingType),
    rentType: z.nativeEnum(RentType).nullable().optional(),
    publicationDate: z.date(),
    saveStatus: z.nativeEnum(SaveStatus).default(SaveStatus.PUBLISHED),
    currency: z.nativeEnum(Currency).default(Currency.USD)
})

export type AdInformationFormData = z.infer<typeof adInformationSchema>