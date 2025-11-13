import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types/auth';
import React from 'react';

export function RoleGate({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  const userRoles = (user?.global_roles || []) as Role[];
  const ok = !!user && (userRoles.length > 0 ? userRoles.some(role => allow.includes(role)) : allow.includes('khach-hang'));
  if (!ok) return <ThemedText style={{ margin: 16 }}>Bạn không có quyền truy cập nội dung này.</ThemedText>;
  return <>{children}</>;
}

export default RoleGate;
