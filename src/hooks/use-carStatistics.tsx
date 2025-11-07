'use client';

import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { IncrementCountDto, UpdateViewDurationDto } from '@/core/entities/models/cars/cars.zod.dto';
import { incrementContactCount, incrementDetailsViewedCount, incrementSharesCount, incrementViewCount, updateViewDuration } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { useMutation } from '@tanstack/react-query';



export const useIncrementViewCount = () =>
  useMutation
<ApiResponse<SuccessResponseWithNoContent>,
    Error,
    IncrementCountDto
  >({
    mutationFn: async (dto) => {
      const result = await incrementViewCount(dto);
      return result;
    },
    onSuccess: (data) => {
    },
    onError: (error) => {
      console.error('[Hook] Failed to increment view count:', error);
    },
    onSettled: () => {
    },
  });

export const useIncrementContactCount = () =>
  useMutation<
    ApiResponse<SuccessResponseWithNoContent>,
    Error,
    IncrementCountDto
  >({
    mutationFn: async (dto) => await incrementContactCount(dto),
    onError: (error) => {
      console.error('Failed to increment contact count:', error);
    },
  });

export const useIncrementSharesCount = () =>
  useMutation<
    ApiResponse<SuccessResponseWithNoContent>,
    Error,
    IncrementCountDto
  >({
    mutationFn: async (dto) => await incrementSharesCount(dto),
    onError: (error) => {
      console.error('Failed to increment shares count:', error);
    },
  });

export const useIncrementDetailsViewedCount = () =>
  useMutation<
    ApiResponse<SuccessResponseWithNoContent>,
    Error,
    IncrementCountDto
  >({
    mutationFn: async (dto) => await incrementDetailsViewedCount(dto),
    onError: (error) => {
      console.error('Failed to increment details viewed count:', error);
    },
  });

export const useUpdateViewDuration = () =>
  useMutation<
    ApiResponse<SuccessResponseWithNoContent>,
    Error,
    UpdateViewDurationDto
  >({
    mutationFn: async (dto) => await updateViewDuration(dto),
    onError: (error) => {
      console.error('Failed to update view duration:', error);
    },
  });