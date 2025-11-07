import { useStandardAuth } from '@/context/StandardAuthContext';
import { Redirect } from 'expo-router';
import * as React from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useStandardAuth();
  
  if (loading) {
    return null; // Could add a splash screen here
  }
  
  if (!user) {
    return <Redirect href="/auth-screen" />;
  }
  
  return <>{children}</>;
}
