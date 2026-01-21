import { IncomingCallModal } from "@/components/call";
import { FormErrorBoundary } from "@/components/FormErrorBoundary";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import { FullMediaViewerProvider } from "@/components/ui/full-media-viewer";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CallProvider } from "@/context/CallContext";
import { CartProvider } from "@/context/cart-context";
import { CommunicationHubProvider } from "@/context/CommunicationHubContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MeetingProvider } from "@/context/MeetingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { PerfexAuthProvider } from "@/context/PerfexAuthContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { ProgressWebSocketProvider } from "@/context/ProgressWebSocketContext";
import { ProjectDataProvider } from "@/context/project-data-context";
import { PushNotificationProvider } from "@/context/PushNotificationContext";
import { UnifiedBadgeProvider } from "@/context/UnifiedBadgeContext";
import { UtilitiesProvider } from "@/context/UtilitiesContext";
import { VideoInteractionsProvider } from "@/context/VideoInteractionsContext";
import { ViewHistoryProvider } from "@/context/ViewHistoryContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { useScreenTracking } from "@/hooks/useAnalytics";
import { useCachedResources } from "@/hooks/useCachedResources";
import { initAnalyticsSession } from "@/utils/analytics";
import * as Sentry from "@sentry/react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

Sentry.init({
  dsn: "https://295d16b1ab0f6d8591c062f619da9411@o4510695460372480.ingest.de.sentry.io/4510695463190608",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

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

    const inAuth = segments[0] === "(auth)";

    // Debug logging
    console.log("[AuthNavigator]", {
      isAuthenticated,
      loading,
      segments: segments.join("/"),
      inAuth,
    });

    // If user just logged in successfully and is on auth screen, redirect to tabs
    if (isAuthenticated && inAuth) {
      console.log("[AuthNavigator] Redirecting to tabs...");
      router.replace("/(tabs)");
      return;
    }

    // Guest mode: Allow viewing main content without login
    // Only redirect to login when user tries to access protected features
    // This is handled per-screen basis for better UX
  }, [isAuthenticated, loading, segments]);

  return null;
}

export default Sentry.wrap(function RootLayout() {
  const isLoadingComplete = useCachedResources();

  // Resources are always loaded immediately (no async loading)
  // This prevents fontfaceobserver timeout on web
  // The check below is kept for API consistency but will always be true
  if (!isLoadingComplete) {
    return null;
  }

  return (
    <FormErrorBoundary>
      <FullMediaViewerProvider>
        <PermissionProvider>
          <AuthProvider>
            <PerfexAuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <ViewHistoryProvider>
                    <MeetingProvider>
                      <CallProvider>
                        <CommunicationHubProvider>
                          <WebSocketProvider>
                            <ProgressWebSocketProvider>
                              <UtilitiesProvider>
                                <ProjectDataProvider>
                                  <VideoInteractionsProvider>
                                    <ProfileProvider>
                                      <NotificationProvider>
                                        <PushNotificationProvider>
                                          <NotificationsProvider>
                                            <UnifiedBadgeProvider>
                                              <OfflineIndicator />
                                              <IncomingCallModal />
                                              <NotificationToast />
                                              <AuthNavigator />
                                              <Stack
                                                screenOptions={{
                                                  headerShown: false,
                                                }}
                                                initialRouteName="(tabs)"
                                              >
                                                <Stack.Screen
                                                  name="(tabs)"
                                                  options={{
                                                    headerShown: false,
                                                  }}
                                                />
                                                <Stack.Screen
                                                  name="(auth)"
                                                  options={{
                                                    headerShown: false,
                                                  }}
                                                />
                                                <Stack.Screen
                                                  name="crm"
                                                  options={{
                                                    headerShown: false,
                                                  }}
                                                />
                                                <Stack.Screen
                                                  name="communication/index"
                                                  options={{
                                                    headerShown: false,
                                                  }}
                                                />
                                                <Stack.Screen
                                                  name="call/active"
                                                  options={{
                                                    headerShown: false,
                                                    presentation:
                                                      "fullScreenModal",
                                                  }}
                                                />
                                              </Stack>
                                              <Toast />
                                            </UnifiedBadgeProvider>
                                          </NotificationsProvider>
                                        </PushNotificationProvider>
                                      </NotificationProvider>
                                    </ProfileProvider>
                                  </VideoInteractionsProvider>
                                </ProjectDataProvider>
                              </UtilitiesProvider>
                            </ProgressWebSocketProvider>
                          </WebSocketProvider>
                        </CommunicationHubProvider>
                      </CallProvider>
                    </MeetingProvider>
                  </ViewHistoryProvider>
                </FavoritesProvider>
              </CartProvider>
            </PerfexAuthProvider>
          </AuthProvider>
        </PermissionProvider>
      </FullMediaViewerProvider>
    </FormErrorBoundary>
  );
});
