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

export interface IFileManagerStrategy {
  uploadImages(images: UploadImagesDto): Promise<ApiResponse<UploadResponse>>;
  uploadImage(
    image: UploadSingleImageDto,
  ): Promise<ApiResponse<UploadSingleImageResponse>>;
  getUserUploads(): Promise<PaginatedResponse<GetUserUploadsResponse>>;
}
