import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';

import { ListingTypeRefsRepo } from '@/core/infrastructure/repositories/listing-type-refs/listing-type-refs.repo';
import { ListingTypeRefsRepoUseCase } from '@/core/application/use-cases/repositories/listing-type-refs/listing-type-refs.repo.use-case';
import { ListingTypeRefsRepoController } from '@/core/application/controllers/repositories/listing-type-refs/listing-type-refs.repo.controller';

export function createListingTypeRefsRepoModule(): Module {
  const listingTypeRefsRepoModule = createModule();

  listingTypeRefsRepoModule
    .bind(DI_SYMBOLS.IListingTypeRefsRepo)
    .toClass(ListingTypeRefsRepo);

  listingTypeRefsRepoModule
    .bind(DI_SYMBOLS.IListingTypeRefsRepoUseCase)
    .toClass(ListingTypeRefsRepoUseCase, [DI_SYMBOLS.IListingTypeRefsRepo]);

  listingTypeRefsRepoModule
    .bind(DI_SYMBOLS.IListingTypeRefsRepoController)
    .toClass(ListingTypeRefsRepoController, [DI_SYMBOLS.IListingTypeRefsRepoUseCase]);

  return listingTypeRefsRepoModule;
}
