import {
  GetUserUploadsResponse,
  UploadResponse,
  UploadSingleImageResponse,
} from '@/core/entities/models/file-manager/upload-res.domain';
import {
  UploadImagesDto,
  UploadSingleImageDto,
} from '@/core/entities/models/file-manager/upload.dto';
import { IFileManagerService } from '../../services/file-manager.service.interface';
import { IFileManagerUseCase } from './file-manager.use-case.interface';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';

export class FileMangerUseCase implements IFileManagerUseCase {
  constructor(protected readonly fileManagerService: IFileManagerService) {}
  async uploadImage(
    image: UploadSingleImageDto,
  ): Promise<ApiResponse<UploadSingleImageResponse>> {
    const res = await this.fileManagerService.uploadImage(image);

    return res;
  }

  async uploadImages(
    images: UploadImagesDto,
  ): Promise<ApiResponse<UploadResponse>> {
    const res = await this.fileManagerService.uploadImages(images);

    return res;
  }

  async getUserUploads(): Promise<PaginatedResponse<GetUserUploadsResponse>> {
    const res = await this.fileManagerService.getUserUploads();

    return res;
  }
}
