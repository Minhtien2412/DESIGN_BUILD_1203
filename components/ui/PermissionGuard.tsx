import { useAuth } from '@/context/AuthContext';
import { PermissionString, Role } from '@/types/auth';
import React from 'react';

interface PermissionGuardProps {
  permission?: PermissionString;
  role?: Role;
  requireAuth?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route guard that checks permissions/roles before rendering children
 * @param permission - Required permission (optional)
 * @param role - Required role (optional)
 * @param requireAuth - Whether authentication is required (default: true)
 * @param children - Content to render if checks pass
 * @param fallback - Content to render if checks fail (optional)
 */
export function PermissionGuard({
  permission,
  role,
  requireAuth = true,
  children,
  fallback
}: PermissionGuardProps) {
  const { user, hasPermission, hasRole } = useAuth();

  // Check authentication
  if (requireAuth && !user) {
    return fallback || <UnauthorizedMessage type="auth" />;
  }

  // Check permission
  if (permission) {
    const [feature, capability] = permission.split('.');
    if (!hasPermission(feature, capability)) {
      return fallback || <UnauthorizedMessage type="permission" permission={permission} />;
    }
  }

  // Check role
  if (role && !hasRole(role)) {
    return fallback || <UnauthorizedMessage type="role" role={role} />;
  }

  return <>{children}</>;
}

interface UnauthorizedMessageProps {
  type: 'auth' | 'permission' | 'role';
  permission?: PermissionString;
  role?: Role;
}

function UnauthorizedMessage({ type, permission, role }: UnauthorizedMessageProps) {
  const messages = {
    auth: 'Vui lòng đăng nhập để tiếp tục.',
    permission: `Bạn không có quyền truy cập chức năng này. (${permission})`,
    role: `Bạn cần có vai trò ${role} để truy cập chức năng này.`
  };

  return (
    <div style={{
      padding: 20,
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: 8,
      margin: 20
    }}>
      <h3 style={{ color: '#dc3545', marginBottom: 10 }}>
        🚫 Truy cập bị từ chối
      </h3>
      <p style={{ color: '#6c757d', margin: 0 }}>
        {messages[type]}
      </p>
      {type === 'permission' && (
        <p style={{ color: '#6c757d', fontSize: 14, marginTop: 10 }}>
          Liên hệ quản trị viên để được cấp quyền.
        </p>
      )}
    </div>
  );
}
