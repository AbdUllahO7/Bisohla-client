import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../types';
import { PermissionService } from '@/core/infrastructure/services/permission.service';
import { PermissionUseCase } from '@/core/application/use-cases/permission/permission.use-case';
import { PermissionController } from '@/core/infrastructure-adapters/controllers/permission.controller';

export function createPermissionModule(): Module {
  const permissionModule = createModule();

  //service
  permissionModule
    .bind(DI_SYMBOLS.IPermissionService)
    .toClass(PermissionService, []);

  // use cases
  permissionModule
    .bind(DI_SYMBOLS.IPermissionUseCase)
    .toClass(PermissionUseCase, [DI_SYMBOLS.IPermissionService]);

  // controllers
  permissionModule
    .bind(DI_SYMBOLS.IPermissionController)
    .toClass(PermissionController, [DI_SYMBOLS.IPermissionUseCase]);

  return permissionModule;
}
