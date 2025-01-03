import { checkRole } from '@/lib/permission';

interface RoleCheckProps {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function RoleCheck({
  role,
  children,
  fallback = null,
}: RoleCheckProps) {
  const hasRole = await checkRole(role);
  return hasRole ? children : fallback;
}
