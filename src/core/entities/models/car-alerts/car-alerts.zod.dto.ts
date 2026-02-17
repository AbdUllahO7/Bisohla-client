import { z } from 'zod';

export const CreateCarAlertSchema = z.object({
    makeId: z.number(),
    modelId: z.number(),
    trimId: z.number(),
    minPrice: z.number(),
    maxPrice: z.number(),
    governorate: z.string(),
    city: z.string(),
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
