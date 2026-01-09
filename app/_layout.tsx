import { IncomingCallModal } from '@/components/call';
import { FormErrorBoundary } from '@/components/FormErrorBoundary';
import { NotificationToast } from '@/components/notifications/NotificationToast';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CallProvider } from '@/context/CallContext';
import { CartProvider } from '@/context/cart-context';
import { CommunicationHubProvider } from '@/context/CommunicationHubContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { PerfexAuthProvider } from '@/context/PerfexAuthContext';
import { PermissionProvider } from '@/context/PermissionContext';
import { ProgressWebSocketProvider } from '@/context/ProgressWebSocketContext';
import { ProjectDataProvider } from '@/context/project-data-context';
import { PushNotificationProvider } from '@/context/PushNotificationContext';
import { UnifiedBadgeProvider } from '@/context/UnifiedBadgeContext';
import { UtilitiesProvider } from '@/context/UtilitiesContext';
import { VideoInteractionsProvider } from '@/context/VideoInteractionsContext';
import { ViewHistoryProvider } from '@/context/ViewHistoryContext';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { useCachedResources } from '@/hooks/useCachedResources';
import { initAnalyticsSession } from '@/utils/analytics';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

function AuthNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Auto-track screen views
  useScreenTracking();

  // Initialize analytics session
  useEffect(() => {
    initAnalyticsSession();
  }, []);

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
  const isLoadingComplete = useCachedResources();

  // Don't render until resources are loaded (prevents fontfaceobserver timeout on web)
  if (!isLoadingComplete) {
    return null;
  }

  return (
    <FormErrorBoundary>
      <PermissionProvider>
        <AuthProvider>
          <PerfexAuthProvider>
            <CartProvider>
            <FavoritesProvider>
              <ViewHistoryProvider>
                <CallProvider>
                  <CommunicationHubProvider>
                    <WebSocketProvider>
                      <ProgressWebSocketProvider>
                        <UtilitiesProvider>
                          <ProjectDataProvider>
                            <VideoInteractionsProvider>
                              <NotificationProvider>
                                <PushNotificationProvider>
                                  <NotificationsProvider>
                                    <UnifiedBadgeProvider>
                                  <OfflineIndicator />
                                  <IncomingCallModal />
                                  <NotificationToast />
                                <AuthNavigator />
                                <Stack 
                                  screenOptions={{ headerShown: false }}
                                  initialRouteName="(tabs)"
                                >
                                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                                  <Stack.Screen name="crm" options={{ headerShown: false }} />
                                  <Stack.Screen name="communication/index" options={{ headerShown: false }} />
                                  <Stack.Screen name="call/active" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                                </Stack>
                                <Toast />
                                    </UnifiedBadgeProvider>
                                  </NotificationsProvider>
                              </PushNotificationProvider>
                            </NotificationProvider>
                          </VideoInteractionsProvider>
                        </ProjectDataProvider>
                      </UtilitiesProvider>
                    </ProgressWebSocketProvider>
                  </WebSocketProvider>
                </CommunicationHubProvider>
              </CallProvider>
            </ViewHistoryProvider>
          </FavoritesProvider>
        </CartProvider>
      </PerfexAuthProvider>
    </AuthProvider>
  </PermissionProvider>
</FormErrorBoundary>
  );
}
