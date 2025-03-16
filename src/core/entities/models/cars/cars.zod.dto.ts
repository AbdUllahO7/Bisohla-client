// src/core/entities/models/cars/car.dtos.ts
import { z } from 'zod';
import {
  CarStatus,
  FuelType,
  Transmission,
  BodyType,
  FeatureCategory,
} from '@/core/entities/enums/cars.enums';
import { Currency } from '@/core/entities/enums/currency.enum';
import { SyriaCity, SyriaGovernorate } from '../../enums/syria.enums';

// ============= Car Make DTOs =============
export const CreateCarMakeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logoUrl: z.string().url('Invalid URL').nullable().optional(),
  description: z.string().nullable().optional(),
});

export type CreateCarMakeDto = z.infer<typeof CreateCarMakeSchema>;

export const UpdateCarMakeSchema = CreateCarMakeSchema.partial();
export type UpdateCarMakeDto = z.infer<typeof UpdateCarMakeSchema>;

// ============= Car Model DTOs =============
export const CreateCarModelSchema = z.object({
  makeId: z.number().int().positive('Make ID is required'),
  name: z.string().min(1, 'Name is required'),
  yearStart: z.number().int().positive().nullable().optional(),
  yearEnd: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type CreateCarModelDto = z.infer<typeof CreateCarModelSchema>;

export const UpdateCarModelSchema = CreateCarModelSchema.partial();
export type UpdateCarModelDto = z.infer<typeof UpdateCarModelSchema>;

// ============= Car Trim DTOs =============
export const CreateCarTrimSchema = z.object({
  modelId: z.number().int().positive('Model ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
});

export type CreateCarTrimDto = z.infer<typeof CreateCarTrimSchema>;

export const UpdateCarTrimSchema = CreateCarTrimSchema.partial();
export type UpdateCarTrimDto = z.infer<typeof UpdateCarTrimSchema>;

// ============= Car Image DTOs =============
export const CarImageSchema = z.object({
  id: z.number().int().positive(),
  carListingId: z.number().int().positive(),
  url: z.string().url(),
  isPrimary: z.boolean(),
  createdAt: z.union([z.string().datetime(), z.date()]),
  updatedAt: z.union([z.string().datetime(), z.date()]),
  deletedAt: z.union([z.string().datetime(), z.date(), z.null()]).nullable(),
});
export interface CarImage {
  id: number;
  carListingId: number;
  url: string;
  isPrimary: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

// ============= Car Listing DTOs =============
export const CreateCarListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive').nullable().optional(),
  currency: z.nativeEnum(Currency),
  makeId: z.number().int().positive('Make ID is required'),
  modelId: z.number().int().positive('Model ID is required'),
  trimId: z.number().int().positive().nullable().optional(),

  // Location information
  governorate: z.nativeEnum(SyriaGovernorate).optional(),
  city: z.nativeEnum(SyriaCity).optional(),
  address: z.string().optional(),

  // Car details embedded
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0).nullable().optional(),
  fuelType: z.nativeEnum(FuelType).nullable().optional(),
  transmission: z.nativeEnum(Transmission).nullable().optional(),
  engineSize: z.number().positive().nullable().optional(),
  enginePower: z.number().int().positive().nullable().optional(),
  bodyType: z.nativeEnum(BodyType).nullable().optional(),
  doors: z.number().int().min(0).max(10).nullable().optional(),
  colorExterior: z.string().nullable().optional(),
  colorInterior: z.string().nullable().optional(),
  vin: z.string().nullable().optional(),
  plateNumber: z.string().nullable().optional(),

  // Features
  featureIds: z.array(z.number().int().positive()).optional(),

  // Images
  images: z.array(CarImageSchema).optional(),
  primaryImageIndex: z.number().int().min(0).optional(),
});

export type CreateCarListingDto = z.infer<typeof CreateCarListingSchema>;

export const UpdateCarListingSchema = CreateCarListingSchema.partial();
export type UpdateCarListingDto = z.infer<typeof UpdateCarListingSchema>;

// Admin update status schema
export const UpdateCarListingStatusSchema = z.object({
  status: z.nativeEnum(CarStatus),
  isFeatured: z.boolean().optional(),
});

export type UpdateCarListingStatusDto = z.infer<
  typeof UpdateCarListingStatusSchema
>;

// ============= Feature DTOs =============
export const CreateFeatureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.nativeEnum(FeatureCategory),
  icon: z.string().nullable().optional(),
});

export type CreateFeatureDto = z.infer<typeof CreateFeatureSchema>;

export const UpdateFeatureSchema = CreateFeatureSchema.partial();
export type UpdateFeatureDto = z.infer<typeof UpdateFeatureSchema>;
