import { createModule } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../types';
import { FileManagerService } from '@/core/infrastructure/services/file-manager.service';
import { FileMangerUseCase } from '@/core/application/use-cases/file-manager/file-manager.use-case';
import { FileMangerController } from '@/core/infrastructure-adapters/controllers/file-manager.controller';

export const createFileManagerModule = () => {
  const fileManagerModule = createModule();

  fileManagerModule
    .bind(DI_SYMBOLS.IFileManagerService)
    .toClass(FileManagerService);

  fileManagerModule
    .bind(DI_SYMBOLS.IFileManagerUseCase)
    .toClass(FileMangerUseCase, [DI_SYMBOLS.IFileManagerService]);

  fileManagerModule
    .bind(DI_SYMBOLS.IFileManagerController)
    .toClass(FileMangerController, [DI_SYMBOLS.IFileManagerUseCase]);

  return fileManagerModule;
};
