/**
 * PermissionGuard Component
 * Bảo vệ UI components dựa trên quyền của user
 */

import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Chỉ render children nếu user có permission
 * 
 * @example
 * <PermissionGuard permission="product.create">
 *   <Button title="Tạo sản phẩm" />
 * </PermissionGuard>
 */
export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasMarketplacePermission } = useAuth();

  if (!hasMarketplacePermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
