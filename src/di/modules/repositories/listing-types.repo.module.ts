import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';

import { ListingTypesRepo } from '@/core/infrastructure/repositories/listing-types/listing-types.repo';
import { ListingTypesRepoUseCase } from '@/core/application/use-cases/repositories/listing-types/listing-types.repo.use-case';
import { ListingTypesRepoController } from '@/core/application/controllers/repositories/listing-types/listing-types.repo.controller';

export function createListingTypesRepoModule(): Module {
  const listingTypesRepoModule = createModule();

  listingTypesRepoModule
    .bind(DI_SYMBOLS.IListingTypesRepo)
    .toClass(ListingTypesRepo);

  listingTypesRepoModule
    .bind(DI_SYMBOLS.IListingTypesRepoUseCase)
    .toClass(ListingTypesRepoUseCase, [DI_SYMBOLS.IListingTypesRepo]);

  listingTypesRepoModule
    .bind(DI_SYMBOLS.IListingTypesRepoController)
    .toClass(ListingTypesRepoController, [DI_SYMBOLS.IListingTypesRepoUseCase]);

  return listingTypesRepoModule;
}
