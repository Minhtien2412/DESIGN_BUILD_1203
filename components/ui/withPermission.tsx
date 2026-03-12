import { useAuth } from '@/context/AuthContext';
import { PermissionString } from '@/types/auth';
import React from 'react';

interface WithPermissionOptions {
  permission: PermissionString;
  fallback?: React.ComponentType<any> | React.ReactNode;
}

/**
 * Higher-order component that wraps a component with permission checking
 * @param WrappedComponent - The component to wrap
 * @param options - Permission options
 * @returns Wrapped component that only renders if user has permission
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPermissionOptions
) {
  const { permission, fallback: FallbackComponent } = options;

  const WithPermissionComponent = (props: P) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(permission, 'read')) {
      if (FallbackComponent) {
        if (React.isValidElement(FallbackComponent)) {
          return FallbackComponent;
        }
        const Fallback = FallbackComponent as React.ComponentType<any>;
        return <Fallback />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPermissionComponent;
}
