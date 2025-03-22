'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import {
  UploadResponse,
  UploadSingleImageResponse,
} from '@/core/entities/models/file-manager/upload-res.domain';
import {
  UploadImagesDto,
  UploadSingleImageDto,
} from '@/core/entities/models/file-manager/upload.dto';
import { getInjection } from '@/di/container';

export const uploadImages = async (
  images: UploadImagesDto,
): Promise<ApiResponse<UploadResponse>> => {
  const controller = getInjection('IFileManagerController');

  const res = await controller.uploadImages(images);

  return res;
};

export const uploadImage = async (
  image: UploadSingleImageDto,
): Promise<ApiResponse<UploadSingleImageResponse>> => {
  const controller = getInjection('IFileManagerController');

  const res = await controller.uploadImage(image);

  return res;
};
