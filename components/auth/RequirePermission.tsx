import { useAuth } from '@/context/AuthContext';
import * as React from 'react';

type Props = {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function RequirePermission({ permission, fallback = null, children }: Props) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) return <>{fallback}</>;
  return <>{children}</>;
}

export default RequirePermission;
