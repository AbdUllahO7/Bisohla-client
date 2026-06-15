import { z } from 'zod';

export const CreateCarAlertSchema = z.object({
    listingTypeId: z.number(),
    minPrice: z.number().nullable().optional(),
    maxPrice: z.number().nullable().optional(),
    governorate: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    attributeFilters: z.record(z.any()).optional(),
});

export type CreateCarAlertDto = z.infer<typeof CreateCarAlertSchema>;

export const UpdateCarAlertSchema = CreateCarAlertSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export type UpdateCarAlertDto = z.infer<typeof UpdateCarAlertSchema>;

export const ToggleCarAlertStatusSchema = z.object({
    isActive: z.boolean(),
});

export type ToggleCarAlertStatusDto = z.infer<typeof ToggleCarAlertStatusSchema>;
