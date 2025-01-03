import { checkPermission } from '@/lib/permission';

interface PermissionCheckProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function PermissionCheck({
  permission,
  children,
  fallback = null,
}: PermissionCheckProps) {
  const hasPermission = await checkPermission(permission);
  return hasPermission ? children : fallback;
}
