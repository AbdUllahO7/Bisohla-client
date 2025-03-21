'use client';

import {
  UploadResponse,
  UploadSingleImageResponse,
} from '@/core/entities/models/file-manager/upload-res.domain';
import {
  UploadImagesDto,
  UploadSingleImageDto,
} from '@/core/entities/models/file-manager/upload.dto';
import { useMutation } from '@tanstack/react-query';
import { ApiResponse } from '@/core/entities/api/success.response';
import { uploadImage, uploadImages } from './actions';

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
