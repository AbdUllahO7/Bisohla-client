import { IPermissionStrategy } from '../strategies/permission.strategy';

export interface IPermissionService extends IPermissionStrategy {
  authorizePermission(permission: string): Promise<boolean>;
  authorizeRole(role: string): Promise<boolean>;
}
