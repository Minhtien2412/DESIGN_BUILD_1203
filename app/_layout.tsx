import { IncomingCallModal } from "@/components/call";
import { CommentsSheetProvider } from "@/components/community/CommentsSheet";
import { MoreOptionsProvider } from "@/components/community/MoreOptionsMenu";
import { ShareSheetProvider } from "@/components/community/ShareSheet";
import { VerticalVideoFeedProvider } from "@/components/community/VerticalVideoFeed";
import {
    DeferredProviderWrapper,
    LazyProvider,
} from "@/components/DeferredProviders";
import { FormErrorBoundary } from "@/components/FormErrorBoundary";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import { FullMediaViewerProvider } from "@/components/ui/full-media-viewer";
import { GlobalTextSafetyProvider } from "@/components/ui/global-text-safety-provider";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { CallProvider } from "@/context/CallContext";
import { CartProvider } from "@/context/cart-context";
import { CommunicationHubProvider } from "@/context/CommunicationHubContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MeetingProvider } from "@/context/MeetingContext";
import { PerfexAuthProvider } from "@/context/PerfexAuthContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { ProgressWebSocketProvider } from "@/context/ProgressWebSocketContext";
import { ProjectDataProvider } from "@/context/project-data-context";
import { UnifiedBadgeProvider } from "@/context/UnifiedBadgeContext";
import { UnifiedNotificationProvider } from "@/context/UnifiedNotificationContext";
import { UtilitiesProvider } from "@/context/UtilitiesContext";
import { VideoInteractionsProvider } from "@/context/VideoInteractionsContext";
import { ViewHistoryProvider } from "@/context/ViewHistoryContext";
import { VoucherProvider } from "@/context/voucher-context";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { useCachedResources } from "@/hooks/useCachedResources";
import { I18nProvider } from "@/services/i18nService";
import { initAnalyticsSession } from "@/utils/analytics";
import * as Sentry from "@sentry/react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { InteractionManager } from "react-native";
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
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // NOTE: useScreenTracking removed — AuthNavigator renders null,
  // so there is no screen to track. Screen tracking should live in
  // actual screen components or the Tabs layout instead.

  // Initialize analytics session - DEFERRED
  useEffect(() => {
    // Defer analytics init to not block startup
    const timeoutId = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        initAnalyticsSession();
      });
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuth =
      pathname.startsWith("/(auth)") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register");

    // If user just logged in successfully and is on auth screen, redirect to tabs
    if (isAuthenticated && inAuth && !hasRedirected.current) {
      hasRedirected.current = true;
      // Defer navigation to avoid conflicting with mount-phase store updates
      requestAnimationFrame(() => {
        router.replace("/(tabs)");
      });
      return;
    }

    // Reset redirect flag when user is no longer on auth screen
    if (!inAuth) {
      hasRedirected.current = false;
    }

    // Guest mode: Allow viewing main content without login
    // Only redirect to login when user tries to access protected features
    // This is handled per-screen basis for better UX
  }, [isAuthenticated, loading, pathname]);

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
    <GlobalTextSafetyProvider>
      <FormErrorBoundary>
        <I18nProvider>
          {/* PHASE 1: Essential UI providers - load immediately */}
          <FullMediaViewerProvider>
            <PermissionProvider>
              <AuthProvider>
                <PerfexAuthProvider>
                  <CartProvider>
                    <VoucherProvider>
                      {/* Deferred Provider Wrapper manages loading phases */}
                      <DeferredProviderWrapper>
                        {/* PHASE 2: Deferred providers - load after UI ready */}
                        <LazyProvider waitForPhase={1}>
                          <FavoritesProvider>
                            <ViewHistoryProvider>
                              <BookingProvider>
                                <UtilitiesProvider>
                                  <ProjectDataProvider>
                                    <ProfileProvider>
                                      {/* PHASE 3: Communication providers - load last */}
                                      <LazyProvider waitForPhase={2}>
                                        <MeetingProvider>
                                          <CallProvider>
                                            <CommunicationHubProvider>
                                              <WebSocketProvider>
                                                <ProgressWebSocketProvider>
                                                  <VideoInteractionsProvider>
                                                    <UnifiedNotificationProvider>
                                                      <UnifiedBadgeProvider>
                                                        {/* Community UI providers */}
                                                        <VerticalVideoFeedProvider>
                                                          <CommentsSheetProvider>
                                                            <ShareSheetProvider>
                                                              <MoreOptionsProvider>
                                                                {/* Global overlays */}
                                                                <OfflineIndicator />
                                                                <LazyProvider
                                                                  waitForPhase={
                                                                    2
                                                                  }
                                                                >
                                                                  <IncomingCallModal />
                                                                </LazyProvider>
                                                                <NotificationToast />
                                                                <AuthNavigator />
                                                                {/* Main navigation */}
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
                                                                    name="communications"
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
                                                              </MoreOptionsProvider>
                                                            </ShareSheetProvider>
                                                          </CommentsSheetProvider>
                                                        </VerticalVideoFeedProvider>
                                                      </UnifiedBadgeProvider>
                                                    </UnifiedNotificationProvider>
                                                  </VideoInteractionsProvider>
                                                </ProgressWebSocketProvider>
                                              </WebSocketProvider>
                                            </CommunicationHubProvider>
                                          </CallProvider>
                                        </MeetingProvider>
                                      </LazyProvider>
                                    </ProfileProvider>
                                  </ProjectDataProvider>
                                </UtilitiesProvider>
                              </BookingProvider>
                            </ViewHistoryProvider>
                          </FavoritesProvider>
                        </LazyProvider>
                      </DeferredProviderWrapper>
                    </VoucherProvider>
                  </CartProvider>
                </PerfexAuthProvider>
              </AuthProvider>
            </PermissionProvider>
          </FullMediaViewerProvider>
        </I18nProvider>
      </FormErrorBoundary>
    </GlobalTextSafetyProvider>
  );
});
