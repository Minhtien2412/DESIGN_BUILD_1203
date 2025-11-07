import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { queryClient } from './services/queryClient';
import socketService from './services/socket';
import { useAuthStore } from './store/auth';

const App = () => {
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
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
