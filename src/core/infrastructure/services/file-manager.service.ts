import { IFileManagerService } from '@/core/application/services/file-manager.service.interface';
import { ApiResponse } from '@/core/entities/api/success.response';
import {
  UploadResponse,
  UploadSingleImageResponse,
} from '@/core/entities/models/file-manager/upload-res.domain';
import {
  UploadImagesDto,
  UploadSingleImageDto,
} from '@/core/entities/models/file-manager/upload.dto';
import { postReq } from '@/core/lib/api';

export class FileManagerService implements IFileManagerService {
  async uploadImage(
    dto: UploadSingleImageDto,
  ): Promise<ApiResponse<UploadSingleImageResponse>> {
    try {
      const formData = new FormData();

      // Append the single file to FormData with field name 'file'
      formData.append('file', dto.file);

      const res = await postReq<FormData, UploadResponse>({
        url: '/cloudinary/upload',
        body: formData,
        errorDefaultMessage: 'Failed to upload image.',
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    } catch (error) {
      throw error;
    }
  }
  async uploadImages(
    dto: UploadImagesDto,
  ): Promise<ApiResponse<UploadResponse>> {
    try {
      const formData = new FormData();

      // Append each image to FormData with its name
      dto.images.forEach((imageData) => {
        formData.append(`images`, imageData.image);
        formData.append(`imageNames`, imageData.imageName);
      });

      const res = await postReq<FormData, UploadResponse>({
        url: '/cloudinary/upload-images',
        body: formData, // Send FormData instead of the DTO directly
        errorDefaultMessage: 'Failed to upload images.',
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    } catch (error) {
      throw error;
    }
  }
}
