import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import * as React from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Could add a splash screen here
  }
  
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return <>{children}</>;
}
