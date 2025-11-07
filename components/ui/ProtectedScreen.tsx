import { PermissionString, Role } from '@/types/auth';
import React from 'react';
import { PermissionGuard } from './PermissionGuard';

interface ProtectedScreenProps {
  permission?: PermissionString;
  role?: Role;
  requireAuth?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Higher-order component for protecting entire screens
 * Use this to wrap screen components that require specific permissions
 */
export function ProtectedScreen({
  permission,
  role,
  requireAuth = true,
  children,
  fallback
}: ProtectedScreenProps) {
  return (
    <PermissionGuard
      permission={permission}
      role={role}
      requireAuth={requireAuth}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}
