import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ProjectDataProvider } from '@/context/project-data-context';
import { VideoInteractionsProvider } from '@/context/VideoInteractionsContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

function AuthNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    const inAuth = segments[0] === '(auth)';
    
    // Debug logging
    console.log('[AuthNavigator]', {
      isAuthenticated,
      loading,
      segments: segments.join('/'),
      inAuth,
    });
    
    // If user just logged in successfully and is on auth screen, redirect to tabs
    if (isAuthenticated && inAuth) {
      console.log('[AuthNavigator] Redirecting to tabs...');
      router.replace('/(tabs)');
      return;
    }
    
    // Guest mode: Allow viewing main content without login
    // Only redirect to login when user tries to access protected features
    // This is handled per-screen basis for better UX
    
  }, [isAuthenticated, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProjectDataProvider>
        <VideoInteractionsProvider>
          <NotificationProvider>
            <AuthNavigator />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </NotificationProvider>
      </VideoInteractionsProvider>
      </ProjectDataProvider>
    </AuthProvider>
  );
}
