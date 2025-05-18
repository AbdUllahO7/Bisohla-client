'use client';

import {
  GetUserUploadsResponse,
  UploadResponse,
  UploadSingleImageResponse,
} from '@/core/entities/models/file-manager/upload-res.domain';
import {
  UploadImagesDto,
  UploadSingleImageDto,
} from '@/core/entities/models/file-manager/upload.dto';
import { useMutation } from '@tanstack/react-query';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import { getUserUploads, uploadImage, uploadImages } from './actions';
import { useLocaleQuery } from '@/core/infrastructure-adapters/use-actions/common/use-locale-query';

export const useUploadImages = () =>
  useMutation<ApiResponse<UploadResponse>, Error, UploadImagesDto>({
    mutationFn: async (dto) => await uploadImages(dto),
  });

export const useUploadSingleImage = () =>
  useMutation<
    ApiResponse<UploadSingleImageResponse>,
    Error,
    UploadSingleImageDto
  >({
    mutationFn: async (dto) => await uploadImage(dto),
  });

export const useGetUserUploads = () =>
  useLocaleQuery<PaginatedResponse<GetUserUploadsResponse>, Error>({
    queryKey: ['user-uploads'],
    queryFn: async () => await getUserUploads(),
  });
