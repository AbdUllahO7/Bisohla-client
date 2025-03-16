// import { IUserRepository } from '../../repositories/user.repo.interface';
import { IUsersRepoUseCase } from '../../use-cases/repositories/users/users.repo.use-case.interface';

export type IUserRepoController = IUsersRepoUseCase; // this will return the same types of user repo use cases
