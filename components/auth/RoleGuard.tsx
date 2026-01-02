/**
 * RoleGuard Component
 * Bảo vệ UI components dựa trên vai trò của user
 */

import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/types/auth';
import { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: UserType[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Chỉ render children nếu user có vai trò phù hợp
 * 
 * @example
 * <RoleGuard allowedRoles={['seller', 'company']}>
 *   <Button title="Quản lý sản phẩm" />
 * </RoleGuard>
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user?.userType || !allowedRoles.includes(user.userType)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
