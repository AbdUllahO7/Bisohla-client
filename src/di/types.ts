import { ICarUserController } from './../core/application/controllers/users/cars/car-controller.interface';
import { IFileManagerController } from '@/core/application/controllers/file-manager.controller.interface';
import { IRolesRepoController } from './../core/application/controllers/repositories/roles.repo.controller.interface';
import { IRolesRepoUseCase } from './../core/application/use-cases/repositories/roles/roles.repo.use-case.inteface';
import { IAuthController } from '@/core/application/controllers/auth.controller.interface';
import { IPermissionController } from '@/core/application/controllers/permission.controller.interface';
import { IUserRepoController } from '@/core/application/controllers/repositories/users.repo.controller.interface';
import { IRolesRepo } from '@/core/application/repositories/roles.repo.interface';
import { IUserRepository } from '@/core/application/repositories/user.repo.interface';
import { IAuthService } from '@/core/application/services/auth.service.interface';
import { IFileManagerService } from '@/core/application/services/file-manager.service.interface';
import { IPermissionService } from '@/core/application/services/permission.service.interface';
import { IBaseRepo } from '@/core/application/strategies/repo.strategy';

import { IAuthUseCase } from '@/core/application/use-cases/auth/auth.use-case.interface';
import { IFileManagerUseCase } from '@/core/application/use-cases/file-manager/file-manager.use-case.interface';
import { IPermissionUseCase } from '@/core/application/use-cases/permission/permission.use-case.interface';
import { IUsersRepoUseCase } from '@/core/application/use-cases/repositories/users/users.repo.use-case.interface';
import { IProductGroupsRepo } from '@/core/application/repositories/products/product-groups.repo.interface';
import { IProductGroupsRepoUseCase } from '@/core/application/use-cases/repositories/products/product-groups/product-groups.repo.use-case.interface';
import { IProductGroupsRepoController } from '@/core/application/controllers/repositories/products/product-groups.repo.controller.interface';
import {
  ICarFeatureRepo,
  ICarListingRepo,
  ICarMakeRepo,
  ICarModelRepo,
  ICarTrimRepo,
} from '@/core/application/repositories/cars/cars.repos.interface';
import {
  ICarFeatureRepoUseCase,
  ICarListingRepoUseCase,
  ICarMakeRepoUseCase,
  ICarModelRepoUseCase,
  ICarTrimRepoUseCase,
} from '@/core/application/use-cases/repositories/cars/cars.repo.use-case.interface';
import {
  ICarFeatureRepoController,
  ICarListingRepoController,
  ICarMakeRepoController,
  ICarModelRepoController,
  ICarTrimRepoController,
} from '@/core/application/controllers/repositories/cars/car.repo.controller.interface';
import { ICarVisitorService } from '@/core/application/services/visitors/car.visitor.service.interface';
import { ICarUserService } from '@/core/application/services/users/car.user.service.interface';
import { ICarVisitorUseCase } from '@/core/application/use-cases/visitors/cars/car.visitor.use-case.interface';
import { ICarUserUseCase } from '@/core/application/use-cases/users/cars/car.user.use-case.interface';
import { ICarVisitorController } from '@/core/application/controllers/visitors/cars/car-controller.interface';

export const DI_SYMBOLS = {
  // ? services
  IAuthService: Symbol.for('IAuthService'),
  IPermissionService: Symbol.for('IPermissionService'),
  IFileManagerService: Symbol.for('IFileManagerService'),
  // visitors
  // ---- cars
  ICarVisitorService: Symbol.for('ICarVisitorService'),
  // users
  // ---- cars
  ICarUserService: Symbol.for('ICarUserService'),

  //? use cases
  IAuthUseCase: Symbol.for('IAuthUseCase'),
  IPermissionUseCase: Symbol.for('IPermissionUseCase'),
  IFileManagerUseCase: Symbol.for('IFileManagerUseCase'),
  // visitors
  // ---- cars
  ICarVisitorUseCase: Symbol.for('ICarVisitorUseCase'),
  // users
  // ---- cars
  ICarUserUseCase: Symbol.for('ICarUserUseCase'),

  //? controllers
  IAuthController: Symbol.for('IAuthController'),
  IPermissionController: Symbol.for('IPermissionController'),
  IFileManagerController: Symbol.for('IFileManagerController'),

  // visitors
  // ---- cars
  ICarVisitorController: Symbol.for('ICarVisitorController'),
  // users
  // ---- cars
  ICarUserController: Symbol.for('ICarUserController'),

  //? REPOSITORIES
  IBaseRepo: Symbol.for('IBaseRepo'),

  //? repositores
  IUserRepo: Symbol.for('IUserRepo'),
  IRolesRepo: Symbol.for('IRolesRepo'),

  // cars repos
  ICarMakeRepo: Symbol.for('ICarMakeRepository'),
  ICarModelRepo: Symbol.for('ICarModelRepository'),
  ICarTrimRepo: Symbol.for('ICarTrimRepository'),
  ICarFeatureRepo: Symbol.for('ICarFeatureRepository'),
  ICarListingRepo: Symbol.for('ICarListingRepositories'),

  // Product Repos
  IProductGroupsRepo: Symbol.for('IProductGroupsRepo'),

  //repositories use cases
  IUserRepoUseCase: Symbol.for('IUserRepoUseCase'),
  IRolesRepoUseCase: Symbol.for('IRolesRepoUseCase'),
  IProductGroupsRepoUseCase: Symbol.for('IProductGroupsRepoUseCase'),

  // cars repos use cases
  ICarMakeRepoUseCase: Symbol.for('ICarMakeRepoUseCase'),
  ICarModelRepoUseCase: Symbol.for('ICarModelRepoUseCase'),
  ICarTrimRepoUseCase: Symbol.for('ICarTrimRepoUseCase'),
  ICarFeatureRepoUseCase: Symbol.for('ICarFeatureRepoUseCase'),
  ICarListingRepoUseCase: Symbol.for('ICarListingRepoUseCase'),

  // repositories controllers
  IUserRepoController: Symbol.for('IUserRepoController'),
  IRolesRepoController: Symbol.for('IRolesRepoController'),
  IProductGroupsRepoController: Symbol.for('IProductGroupsRepoController'), //

  // cars repos controllers
  ICarMakeRepoController: Symbol.for('ICarMakeRepoController'),
  ICarModelRepoController: Symbol.for('ICarModelRepoController'),
  ICarTrimRepoController: Symbol.for('ICarTrimRepoController'),
  ICarFeatureRepoController: Symbol.for('ICarFeatureRepoController'),
  ICarListingRepoController: Symbol.for('ICarListingRepoController'),

  //repo patths
  usersRepoPath: Symbol.for('usersRepoPath'),
  rolesRepoPath: Symbol.for('rolesRepoPath'), //
  productGroupsRepoPath: Symbol.for('productGroupsRepoPath'), //

  // cars repositories paths
  carMakeRepoPath: Symbol.for('carMakeRepoPath'),
  carModelRepoPath: Symbol.for('carModelRepoPath'),
  carTrimRepoPath: Symbol.for('carTrimRepoPath'),
  carFeatureRepoPath: Symbol.for('carFeatureRepoPath'),
  carListingRepoPath: Symbol.for('carListingRepoPath'),
};

export interface DI_RETURN_TYPES {
  //services
  IAuthService: IAuthService;
  IPermissionService: IPermissionService;
  IFileManagerService: IFileManagerService;

  //visitors
  // --- cars
  ICarVisitorService: ICarVisitorService;
  //users
  // --- cars
  ICarUserService: ICarUserService;

  // use cases
  IAuthUseCase: IAuthUseCase;
  IPermissionUseCase: IPermissionUseCase;
  IFileManagerUseCase: IFileManagerUseCase;

  //visitors
  // --- cars
  ICarVisitorUseCase: ICarVisitorUseCase;
  //users
  // --- cars
  ICarUserUseCase: ICarUserUseCase;

  // controllers
  IAuthController: IAuthController;
  IPermissionController: IPermissionController;
  IFileManagerController: IFileManagerController;

  // visitors
  // --- cars
  ICarVisitorController: ICarVisitorController;
  //users
  // --- cars
  ICarUserController: ICarUserController;

  //REPOSITORIES
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  IBaseRepo: IBaseRepo<any, any, any>;

  //repositores
  IUserRepo: IUserRepository;
  IRolesRepo: IRolesRepo;

  // Product Repos
  IProductGroupsRepo: IProductGroupsRepo;

  //car repos
  ICarMakeRepo: ICarMakeRepo;
  ICarModelRepo: ICarModelRepo;
  ICarTrimRepo: ICarTrimRepo;
  ICarFeatureRepo: ICarFeatureRepo;
  ICarListingRepo: ICarListingRepo;

  //repositories use cases
  IUserRepoUseCase: IUsersRepoUseCase;
  IRolesRepoUseCase: IRolesRepoUseCase;
  IProductGroupsRepoUseCase: IProductGroupsRepoUseCase;

  //car repos use cases
  ICarMakeRepoUseCase: ICarMakeRepoUseCase;
  ICarModelRepoUseCase: ICarModelRepoUseCase;
  ICarTrimRepoUseCase: ICarTrimRepoUseCase;
  ICarFeatureRepoUseCase: ICarFeatureRepoUseCase;
  ICarListingRepoUseCase: ICarListingRepoUseCase;

  // repositories controllers
  IUserRepoController: IUserRepoController;
  IRolesRepoController: IRolesRepoController;
  IProductGroupsRepoController: IProductGroupsRepoController; //

  //cars repos controllers
  ICarMakeRepoController: ICarMakeRepoController;
  ICarModelRepoController: ICarModelRepoController;
  ICarTrimRepoController: ICarTrimRepoController;
  ICarFeatureRepoController: ICarFeatureRepoController;
  ICarListingRepoController: ICarListingRepoController;

  //repo patths
  usersRepoPath: string;
  rolesRepoPath: string;
  productGroupsRepoPath: string;

  // cars repositories paths
  carMakeRepoPath: string;
  carModelRepoPath: string;
  carTrimRepoPath: string;
  carFeatureRepoPath: string;
  carListingRepoPath: string;
}
