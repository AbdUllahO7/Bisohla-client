'use server';

import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  GetUserUploadsResponse,
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

export const getUserUploads = async (): Promise<
  PaginatedResponse<GetUserUploadsResponse>
> => {
  const controller = getInjection('IFileManagerController');

  const res = await controller.getUserUploads();

  return res;
};
