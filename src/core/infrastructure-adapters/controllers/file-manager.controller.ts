import { IFileManagerController } from '@/core/application/controllers/file-manager.controller.interface';
import { IFileManagerUseCase } from '@/core/application/use-cases/file-manager/file-manager.use-case.interface';
import { ApiResponse } from '@/core/entities/api/success.response';
import {
  UploadResponse,
  UploadSingleImageResponse,
} from '@/core/entities/models/file-manager/upload-res.domain';
import {
  UploadImagesDto,
  UploadSingleImageDto,
} from '@/core/entities/models/file-manager/upload.dto';
import { catchClientRequest } from '@/core/lib/error';

export class FileMangerController implements IFileManagerController {
  constructor(protected readonly fileManagerUseCase: IFileManagerUseCase) {}
  async uploadImages(
    images: UploadImagesDto,
  ): Promise<ApiResponse<UploadResponse>> {
    try {
      return await this.fileManagerUseCase.uploadImages(images);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async uploadImage(
    image: UploadSingleImageDto,
  ): Promise<ApiResponse<UploadSingleImageResponse>> {
    try {
      return await this.fileManagerUseCase.uploadImage(image);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
}
