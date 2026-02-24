/**
 * App Startup Manager
 * ====================
 *
 * Quản lý việc khởi tạo app một cách có kiểm soát:
 * 1. Defer heavy operations đến khi UI sẵn sàng
 * 2. Load data theo priority
 * 3. Bọc providers với error boundaries
 * 4. Hiển thị splash/loading khi cần
 *
 * Giải quyết vấn đề app freeze khi khởi động
 *
 * @author ThietKeResort Team
 * @created 2026-01-29
 */

import { ENV } from "@/config/env";
import { lazyLoader } from "@/services/lazyLoader";
import { wsManager } from "@/services/wsManager";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    InteractionManager,
    StyleSheet,
    Text,
    View,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export type StartupPhase =
  | "initializing"
  | "auth"
  | "essential"
  | "ready"
  | "background"
  | "complete";

interface StartupState {
  phase: StartupPhase;
  progress: number;
  currentTask: string;
  isReady: boolean;
  error: Error | null;
}

interface StartupContextValue extends StartupState {
  triggerBackgroundLoad: () => void;
  retryStartup: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const StartupContext = createContext<StartupContextValue | null>(null);

export function useStartup(): StartupContextValue {
  const context = useContext(StartupContext);
  if (!context) {
    // Return default values if used outside provider
    return {
      phase: "complete",
      progress: 100,
      currentTask: "",
      isReady: true,
      error: null,
      triggerBackgroundLoad: () => {},
      retryStartup: () => {},
    };
  }
  return context;
}

// ============================================================================
// STARTUP MANAGER PROVIDER
// ============================================================================

interface Props {
  children: ReactNode;
  showSplash?: boolean;
  splashComponent?: ReactNode;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export function AppStartupManager({
  children,
  showSplash = false,
  splashComponent,
  onReady,
  onError,
}: Props): React.ReactElement {
  const [state, setState] = useState<StartupState>({
    phase: "initializing",
    progress: 0,
    currentTask: "Đang khởi động...",
    isReady: false,
    error: null,
  });

  const mountedRef = useRef(true);
  const startupDone = useRef(false);

  // Update state safely
  const safeSetState = useCallback((update: Partial<StartupState>) => {
    if (mountedRef.current) {
      setState((prev) => ({ ...prev, ...update }));
    }
  }, []);

  // Initialize WebSocket Manager
  const initializeWebSocket = useCallback(() => {
    try {
      const wsBaseUrl =
        ENV.WS_URL ||
        ENV.API_BASE_URL.replace(/^http/, "ws").replace("/api", "");
      wsManager.initialize(wsBaseUrl);
      console.log("[Startup] WebSocket manager initialized");
    } catch (error) {
      console.warn("[Startup] WebSocket init error:", error);
    }
  }, []);

  // Main startup sequence
  const runStartup = useCallback(async () => {
    if (startupDone.current) return;
    startupDone.current = true;

    try {
      // Phase 1: Initialize
      safeSetState({ phase: "initializing", currentTask: "Đang khởi động..." });

      // Wait for React Native to be ready (avoid JS bridge congestion)
      await InteractionManager.runAfterInteractions(() => {
        console.log("[Startup] Interaction manager ready");
      });

      // Small delay to let UI settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Phase 2: Auth check (critical)
      safeSetState({
        phase: "auth",
        progress: 20,
        currentTask: "Kiểm tra đăng nhập...",
      });
      await lazyLoader.loadUpTo("critical");

      // Phase 3: Essential data
      safeSetState({
        phase: "essential",
        progress: 50,
        currentTask: "Tải dữ liệu...",
      });

      // Initialize WebSocket AFTER auth is checked
      initializeWebSocket();

      // Load essential data
      await lazyLoader.loadUpTo("essential");

      // Phase 4: Ready - UI can be shown
      safeSetState({
        phase: "ready",
        progress: 80,
        isReady: true,
        currentTask: "Sẵn sàng!",
      });
      onReady?.();

      // Phase 5: Background tasks (after UI is visible)
      // Defer to next tick to not block render
      setTimeout(async () => {
        if (!mountedRef.current) return;

        safeSetState({ phase: "background", currentTask: "Đồng bộ..." });

        // Load background data
        await lazyLoader.loadUpTo("background");

        // Connect WebSockets with proper token
        // Delay WebSocket connections to avoid overwhelming
        setTimeout(() => {
          if (mountedRef.current) {
            wsManager.connectAll().catch((err) => {
              console.warn("[Startup] WebSocket connect error:", err);
            });
          }
        }, 1000);

        safeSetState({ phase: "complete", progress: 100, currentTask: "" });
      }, 500);
    } catch (error) {
      console.error("[Startup] Error:", error);
      safeSetState({ error: error as Error, phase: "ready", isReady: true });
      onError?.(error as Error);
    }
  }, [safeSetState, initializeWebSocket, onReady, onError]);

  // Retry startup
  const retryStartup = useCallback(() => {
    startupDone.current = false;
    safeSetState({
      phase: "initializing",
      progress: 0,
      currentTask: "Đang thử lại...",
      isReady: false,
      error: null,
    });
    runStartup();
  }, [runStartup, safeSetState]);

  // Trigger background load manually (for lazy loading more data)
  const triggerBackgroundLoad = useCallback(() => {
    if (state.phase === "complete") return;

    lazyLoader.loadUpTo("deferred").catch((err) => {
      console.warn("[Startup] Deferred load error:", err);
    });
  }, [state.phase]);

  // Run startup on mount
  useEffect(() => {
    mountedRef.current = true;
    runStartup();

    return () => {
      mountedRef.current = false;
    };
  }, [runStartup]);

  // Context value
  const contextValue: StartupContextValue = {
    ...state,
    triggerBackgroundLoad,
    retryStartup,
  };

  // Show splash while not ready
  if (showSplash && !state.isReady) {
    return (
      <StartupContext.Provider value={contextValue}>
        {splashComponent || (
          <DefaultSplash
            phase={state.phase}
            progress={state.progress}
            task={state.currentTask}
          />
        )}
      </StartupContext.Provider>
    );
  }

  // Show children
  return (
    <StartupContext.Provider value={contextValue}>
      {children}
    </StartupContext.Provider>
  );
}

// ============================================================================
// DEFAULT SPLASH COMPONENT
// ============================================================================

function DefaultSplash({
  phase,
  progress,
  task,
}: {
  phase: StartupPhase;
  progress: number;
  task: string;
}): React.ReactElement {
  return (
    <View style={styles.splash}>
      <Text style={styles.appName}>ThietKeResort</Text>
      <ActivityIndicator size="large" color="#0D9488" style={styles.loader} />
      <Text style={styles.task}>{task}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

// ============================================================================
// DEFERRED LOAD WRAPPER
// ============================================================================

interface DeferredProps {
  children: ReactNode;
  fallback?: ReactNode;
  waitFor?: StartupPhase;
}

/**
 * Defer rendering until startup phase is reached
 */
export function DeferredLoad({
  children,
  fallback,
  waitFor = "ready",
}: DeferredProps): React.ReactElement {
  const { phase } = useStartup();

  const phaseOrder: StartupPhase[] = [
    "initializing",
    "auth",
    "essential",
    "ready",
    "background",
    "complete",
  ];
  const currentIndex = phaseOrder.indexOf(phase);
  const targetIndex = phaseOrder.indexOf(waitFor);

  if (currentIndex < targetIndex) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Wrapper that only renders after InteractionManager is ready
 */
export function AfterInteractions({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}): React.ReactElement {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });

    return () => handle.cancel();
  }, []);

  if (!ready) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  task: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  progressBar: {
    width: "60%",
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0D9488",
    borderRadius: 2,
  },
});

export default AppStartupManager;
