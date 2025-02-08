import { BaseRepo } from '@/core/infrastructure/repositories/base.repo';
import { DI_SYMBOLS } from '@/di/types';
import { createModule, Module } from '@evyweb/ioctopus';

export function createRepoModule(): Module {
  const repoModules = createModule();

  //service
  //white not linked to backend
  repoModules.bind(DI_SYMBOLS.IBaseRepo).toClass(BaseRepo, []);

  return repoModules;
}
