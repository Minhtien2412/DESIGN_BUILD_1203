import { useAuth } from '@/context/AuthContext';
import { PermissionString } from '@/types/auth';
import React from 'react';

interface CanProps {
  /**
   * A permission string (scoped identifier like 'user.view').
   * Use constants from PERMISSIONS to avoid typos.
   */
  permission: PermissionString;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * @param permission - The permission required to render children
 * @param children - Content to render if user has permission
 * @param fallback - Content to render if user doesn't have permission (optional)
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useAuth();

  // Parse permission string (format: 'feature.capability')
  const [feature, capability] = permission.split('.');
  
  if (hasPermission(feature, capability)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
