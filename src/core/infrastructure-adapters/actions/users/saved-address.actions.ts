'use server';

import { getAuthReq, postAuthReq, patchAuthReq, deleteAuthReq } from '@/core/lib/api';
import { ApiResponse } from '@/core/entities/api/success.response';
import {
  UserAddress,
  CreateUserAddressDto,
  UpdateUserAddressDto,
  DeleteUserAddressResponse,
} from '@/core/entities/models/users/saved-address.dto';

/**
 * Get all saved addresses for the authenticated user (unpaginated flat array)
 * GET /user-addresses
 */
export const getUserAddresses = async (): Promise<ApiResponse<UserAddress[]>> => {
  return await getAuthReq<Record<string, unknown>, UserAddress[]>({
    url: '/user-addresses',
  });
};

/**
 * Get a single saved address by ID
 * GET /user-addresses/:id
 */
export const getUserAddressById = async (
  id: number
): Promise<ApiResponse<UserAddress>> => {
  return await getAuthReq<Record<string, unknown>, UserAddress>({
    url: `/user-addresses/${id}`,
  });
};

/**
 * Create a new saved address
 * POST /user-addresses -> returns 201
 */
export const createUserAddress = async (
  dto: CreateUserAddressDto
): Promise<ApiResponse<UserAddress>> => {
  return await postAuthReq<CreateUserAddressDto, UserAddress>({
    url: '/user-addresses',
    body: dto,
  });
};

/**
 * Update an existing saved address
 * PATCH /user-addresses/:id
 */
export const updateUserAddress = async (
  id: number,
  dto: UpdateUserAddressDto
): Promise<ApiResponse<UserAddress>> => {
  return await patchAuthReq<UpdateUserAddressDto, UserAddress>({
    url: `/user-addresses/${id}`,
    body: dto,
  });
};

/**
 * Set an address as the default address
 * PATCH /user-addresses/:id/set-default
 */
export const setDefaultUserAddress = async (
  id: number
): Promise<ApiResponse<UserAddress>> => {
  return await patchAuthReq<Record<string, unknown>, UserAddress>({
    url: `/user-addresses/${id}/set-default`,
  });
};

/**
 * Bump lastUsedAt on an address when applied to a listing draft (fire-and-forget)
 * PATCH /user-addresses/:id/touch
 */
export const touchUserAddress = async (
  id: number
): Promise<ApiResponse<UserAddress>> => {
  return await patchAuthReq<Record<string, unknown>, UserAddress>({
    url: `/user-addresses/${id}/touch`,
  });
};

/**
 * Delete a saved address
 * DELETE /user-addresses/:id
 */
export const deleteUserAddress = async (
  id: number
): Promise<ApiResponse<DeleteUserAddressResponse>> => {
  return await deleteAuthReq<Record<string, unknown>, DeleteUserAddressResponse>({
    url: `/user-addresses/${id}`,
  });
};
