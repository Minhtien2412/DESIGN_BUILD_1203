/**
 * Deferred Providers
 * ===================
 *
 * Lazy load các providers không cần thiết ngay khi app khởi động.
 * Giúp giảm ANR (Application Not Responding) bằng cách:
 * 1. Chỉ load essential providers trước
 * 2. Defer non-essential providers sau khi UI render xong
 * 3. Use InteractionManager để không block main thread
 *
 * @author ThietKeResort Team
 * @created 2026-01-29
 */

import React, {
    createContext,
    type JSX,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { InteractionManager } from "react-native";

// ============================================================================
// TYPES
// ============================================================================

interface DeferredState {
  phase1Ready: boolean; // Auth, basic UI
  phase2Ready: boolean; // Communication, notifications
  phase3Ready: boolean; // Optional features
}

interface DeferredContextValue extends DeferredState {
  isFullyReady: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const DeferredContext = createContext<DeferredContextValue>({
  phase1Ready: false,
  phase2Ready: false,
  phase3Ready: false,
  isFullyReady: false,
});

export const useDeferredReady = () => useContext(DeferredContext);

// ============================================================================
// DEFERRED PROVIDER WRAPPER
// ============================================================================

interface DeferredProviderWrapperProps {
  children: ReactNode;
  onPhase1?: () => void;
  onPhase2?: () => void;
  onFullyReady?: () => void;
}

export function DeferredProviderWrapper({
  children,
  onPhase1,
  onPhase2,
  onFullyReady,
}: DeferredProviderWrapperProps): JSX.Element {
  const [state, setState] = useState<DeferredState>({
    phase1Ready: false,
    phase2Ready: false,
    phase3Ready: false,
  });

  useEffect(() => {
    // Phase 1: Immediate (after first render)
    // Use requestAnimationFrame to ensure UI has rendered
    const frame1 = requestAnimationFrame(() => {
      setState((prev) => ({ ...prev, phase1Ready: true }));
      onPhase1?.();

      // Phase 2: After interactions complete (500ms delay)
      const handle = InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          setState((prev) => ({ ...prev, phase2Ready: true }));
          onPhase2?.();

          // Phase 3: Deferred (1500ms delay)
          setTimeout(() => {
            setState((prev) => ({ ...prev, phase3Ready: true }));
            onFullyReady?.();
          }, 1000);
        }, 500);
      });

      return () => handle.cancel();
    });

    return () => cancelAnimationFrame(frame1);
  }, []);

  const contextValue: DeferredContextValue = {
    ...state,
    isFullyReady: state.phase1Ready && state.phase2Ready && state.phase3Ready,
  };

  return (
    <DeferredContext.Provider value={contextValue}>
      {children}
    </DeferredContext.Provider>
  );
}

// ============================================================================
// LAZY PROVIDER COMPONENT
// ============================================================================

interface LazyProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  waitForPhase?: 1 | 2 | 3;
}

/**
 * Chỉ render children khi phase ready
 */
export function LazyProvider({
  children,
  fallback = null,
  waitForPhase = 2,
}: LazyProviderProps): JSX.Element {
  const { phase1Ready, phase2Ready, phase3Ready } = useDeferredReady();

  const isReady =
    waitForPhase === 1
      ? phase1Ready
      : waitForPhase === 2
        ? phase2Ready
        : phase3Ready;

  if (!isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// NO-OP PROVIDER (for disabled features)
// ============================================================================

interface NoOpProviderProps {
  children: ReactNode;
}

/**
 * A provider that does nothing - used as placeholder
 */
export function NoOpProvider({ children }: NoOpProviderProps): JSX.Element {
  return <>{children}</>;
}

// ============================================================================
// SAFE PROVIDER WRAPPER
// ============================================================================

interface SafeProviderProps {
  children: ReactNode;
  Provider: React.ComponentType<{ children: ReactNode }>;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Wrap a provider with error handling
 */
export function SafeProvider({
  children,
  Provider,
  enabled = true,
  onError,
}: SafeProviderProps): JSX.Element {
  if (!enabled) {
    return <>{children}</>;
  }

  try {
    return <Provider>{children}</Provider>;
  } catch (error) {
    console.error("[SafeProvider] Error:", error);
    onError?.(error as Error);
    return <>{children}</>;
  }
}

export default DeferredProviderWrapper;
