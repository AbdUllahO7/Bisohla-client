import { z } from 'zod';

export interface UserAddress {
  id: number;
  userId: number;
  label: string;
  governorate: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteUserAddressResponse {
  deleted: boolean;
  promotedDefault: UserAddress | null;
}

export const CreateUserAddressSchema = z.object({
  label: z.string().trim().min(1, 'savedAddresses.form.label_required').max(100),
  governorate: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export const UpdateUserAddressSchema = CreateUserAddressSchema.partial();

export type CreateUserAddressDto = z.infer<typeof CreateUserAddressSchema>;
export type UpdateUserAddressDto = z.infer<typeof UpdateUserAddressSchema>;

export const SavedAddressFormSchema = z
  .object({
    label: z.string().trim().min(1, 'savedAddresses.form.label_required').max(100),
    governorate: z.string().min(1, 'savedAddresses.form.governorate_required'),
    city: z.string().min(1, 'savedAddresses.form.city_required'),
    address: z.string().max(500).optional().default(''),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    detectedGovernorate: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (
        data.latitude != null &&
        data.longitude != null &&
        data.detectedGovernorate &&
        data.governorate
      ) {
        return data.governorate === data.detectedGovernorate;
      }
      return true;
    },
    {
      message: 'savedAddresses.form.governorate_pin_mismatch',
      path: ['governorate'],
    }
  );

export type SavedAddressFormData = z.infer<typeof SavedAddressFormSchema>;
