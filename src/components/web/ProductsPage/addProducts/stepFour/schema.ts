import { ListingType, RentType } from "@/core/entities/enums/cars.enums"
import { z } from "zod"


export const adInformationSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    contactNumber: z
        .string()
        .min(10, "Contact number must be at least 10 digits")
        .max(20, "Contact number must be at most 20 digits"),
    listingType: z.nativeEnum(ListingType),
    rentType: z.nativeEnum(RentType).nullable().optional(),
    publicationDate: z.date(),
})

export type AdInformationFormData = z.infer<typeof adInformationSchema>
