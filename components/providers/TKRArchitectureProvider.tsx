import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { queryClient } from '../../src/services/queryClient';
import socketService from '../../src/services/socket';
import { useAuthStore } from '../../src/store/auth';

interface TKRArchitectureProviderProps {
  children: React.ReactNode;
}

export const TKRArchitectureProvider: React.FC<TKRArchitectureProviderProps> = ({ children }) => {
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    // Hydrate auth state on app start
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Connect to WebSocket when user is authenticated
    if (user) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
