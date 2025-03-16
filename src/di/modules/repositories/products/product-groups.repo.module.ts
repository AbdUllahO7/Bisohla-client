import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../../types';
import { ProductGroupsRepo } from '@/core/infrastructure/repositories/products/product-groups.repo';
import { ProductGroupsRepoUseCase } from '@/core/application/use-cases/repositories/products/product-groups/product-group.repo.use-case';
import { ProductGroupsRepoController } from '@/core/infrastructure-adapters/controllers/repositores/products/product-groups.repo.controller';

export function createProductGroupsRepoModule(): Module {
  const ProductGroupsRepoModule = createModule();

  //path
  ProductGroupsRepoModule.bind(DI_SYMBOLS.productGroupsRepoPath).toValue(
    'product-groups-repo',
  );

  //repo
  ProductGroupsRepoModule.bind(DI_SYMBOLS.IProductGroupsRepo).toClass(
    ProductGroupsRepo,
    [DI_SYMBOLS.productGroupsRepoPath],
  );

  //use case
  ProductGroupsRepoModule.bind(DI_SYMBOLS.IProductGroupsRepoUseCase).toClass(
    ProductGroupsRepoUseCase,
    [DI_SYMBOLS.IProductGroupsRepo],
  );

  //conbtroller
  ProductGroupsRepoModule.bind(DI_SYMBOLS.IProductGroupsRepoController).toClass(
    ProductGroupsRepoController,
    [DI_SYMBOLS.IProductGroupsRepoUseCase],
  );

  return ProductGroupsRepoModule;
}
