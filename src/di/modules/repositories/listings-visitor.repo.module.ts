import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';

import { ListingsVisitorRepo } from '@/core/infrastructure/repositories/listings/listings.visitor.repo';
import { ListingsVisitorRepoUseCase } from '@/core/application/use-cases/repositories/listings/listings.visitor.repo.use-case';
import { ListingsVisitorRepoController } from '@/core/application/controllers/repositories/listings/listings.visitor.repo.controller';

export function createListingsVisitorRepoModule(): Module {
  const listingsVisitorRepoModule = createModule();

  listingsVisitorRepoModule
    .bind(DI_SYMBOLS.IListingsVisitorRepo)
    .toClass(ListingsVisitorRepo);

  listingsVisitorRepoModule
    .bind(DI_SYMBOLS.IListingsVisitorRepoUseCase)
    .toClass(ListingsVisitorRepoUseCase, [DI_SYMBOLS.IListingsVisitorRepo]);

  listingsVisitorRepoModule
    .bind(DI_SYMBOLS.IListingsVisitorRepoController)
    .toClass(ListingsVisitorRepoController, [DI_SYMBOLS.IListingsVisitorRepoUseCase]);

  return listingsVisitorRepoModule;
}
