import { getSession } from './session';

export const checkPermission = async (permission: string) => {
  const session = await getSession();

  if (!session || !session.user) return false;

  return session?.user.permissions.includes(permission) ?? false;
};

export const checkRole = async (role: string) => {
  const session = await getSession();

  if (!session || !session.user) return false;

  return session?.user.roles.includes(role) ?? false;
};
