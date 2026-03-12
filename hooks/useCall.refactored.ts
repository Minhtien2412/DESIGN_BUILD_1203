/**
 * useCall Hook (Refactored)
 * ==========================
 * Manages call state, history, and actions with real-time updates
 * Tích hợp với UnifiedCallService và UnifiedBadgeContext
 *
 * @author AI Assistant
 * @date 12/01/2026
 */

import { useAuth } from "@/context/AuthContext";
import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { CallType } from "@/services/api/call.service";
import {
    UnifiedCall,
    UnifiedCallHistory,
    UnifiedCallService,
    formatDuration,
    getCallColor,
    getCallIcon,
    getCallStatusText,
} from "@/services/unifiedCallService";
import { useCallback, useEffect, useRef, useState } from "react";

// ==================== TYPES ====================

export interface IncomingCall {
  id: string;
  callerId: number;
  callerName: string;
  callerAvatar?: string;
  type: CallType;
  roomId: string;
}

export interface ActiveCallState {
  call: UnifiedCall;
  roomId: string;
  token: string;
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  duration: number;
}

export interface UseCallOptions {
  autoLoadHistory?: boolean;
  historyLimit?: number;
  onIncomingCall?: (call: IncomingCall) => void;
  onCallEnded?: (call: UnifiedCall) => void;
  /** Callback để sync badge count */
  badgeSyncCallback?: (count: number) => void;
}

export interface UseCallReturn {
  // State
  activeCall: ActiveCallState | null;
  incomingCall: IncomingCall | null;
  callHistory: UnifiedCall[];
  missedCallsCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Call Actions
  startCall: (userId: number, type?: CallType) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => Promise<void>;
  endCall: () => Promise<void>;

  // In-call Controls
  toggleMute: () => void;
  toggleVideo: () => void;

  // History Actions
  refreshHistory: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  markMissedAsRead: (callId: string) => Promise<void>;
  clearMissedCalls: () => Promise<void>;

  // Helpers
  formatDuration: typeof formatDuration;
  getCallStatusText: typeof getCallStatusText;
  getCallIcon: typeof getCallIcon;
  getCallColor: typeof getCallColor;
  isCallActive: boolean;
  hasMoreHistory: boolean;
}

// ==================== HOOK ====================

export function useCall(options: UseCallOptions = {}): UseCallReturn {
  const {
    autoLoadHistory = true,
    historyLimit = 20,
    onIncomingCall,
    onCallEnded,
    badgeSyncCallback,
  } = options;

  const { user } = useAuth();
  const { syncWithMessaging, badges } = useUnifiedBadge();

  // State
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [callHistory, setCallHistory] = useState<UnifiedCall[]>([]);
  const [missedCallsCount, setMissedCallsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Refs
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const isMountedRef = useRef(true);

  // ==================== BADGE SYNC ====================

  const updateBadge = useCallback(
    (count: number) => {
      setMissedCallsCount(count);
      // Use syncWithMessaging for missed calls badge sync
      syncWithMessaging(badges.messages, count);
      badgeSyncCallback?.(count);
    },
    [syncWithMessaging, badges.messages, badgeSyncCallback]
  );

  // ==================== LOAD HISTORY ====================

  const loadHistory = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      if (!user?.id) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (page === 1) {
          setLoading(true);
        }
        setError(null);

        const response: UnifiedCallHistory =
          await UnifiedCallService.getCallHistory({
            page,
            limit: historyLimit,
          });

        if (!isMountedRef.current) return;

        if (page === 1) {
          setCallHistory(response.calls);
        } else {
          setCallHistory((prev) => [...prev, ...response.calls]);
        }

        setHasMoreHistory(response.hasMore);
        setCurrentPage(page);

        // Count missed calls và sync badge
        const missedCount = response.calls.filter(
          (c) => c.status === "missed"
        ).length;
        if (page === 1) {
          updateBadge(missedCount);
        }

        console.log(
          "[useCall] Loaded history:",
          response.calls.length,
          "calls, page",
          page
        );
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Không thể tải lịch sử cuộc gọi";
        setError(message);
        console.error("[useCall] Load history error:", err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [user?.id, historyLimit, updateBadge]
  );

  const refreshHistory = useCallback(async () => {
    await loadHistory(1, true);
  }, [loadHistory]);

  const loadMoreHistory = useCallback(async () => {
    if (!hasMoreHistory || loading) return;
    await loadHistory(currentPage + 1, false);
  }, [hasMoreHistory, loading, currentPage, loadHistory]);

  // ==================== LOAD MISSED CALLS COUNT ====================

  const loadMissedCallsCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const count = await UnifiedCallService.getMissedCallsCount();
      if (isMountedRef.current) {
        updateBadge(count);
      }
    } catch (err) {
      console.warn("[useCall] Failed to load missed calls count:", err);
    }
  }, [user?.id, updateBadge]);

  // ==================== CALL ACTIONS ====================

  const startCall = useCallback(
    async (userId: number, type: CallType = "video") => {
      if (!user?.id) {
        setError("Vui lòng đăng nhập để thực hiện cuộc gọi");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { call, token } = await UnifiedCallService.startCall(
          userId,
          type
        );

        if (!isMountedRef.current) return;

        setActiveCall({
          call,
          roomId: call.roomId || "",
          token,
          isConnected: false,
          isMuted: false,
          isVideoEnabled: type === "video",
          duration: 0,
        });

        startDurationTimer();
        console.log("[useCall] Call started:", call.id);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Không thể bắt đầu cuộc gọi";
        setError(message);
        console.error("[useCall] Start call error:", err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [user?.id]
  );

  const acceptCall = useCallback(async (callId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { call, token } = await UnifiedCallService.acceptCall(
        parseInt(callId, 10)
      );

      if (!isMountedRef.current) return;

      setActiveCall({
        call,
        roomId: call.roomId || "",
        token,
        isConnected: true,
        isMuted: false,
        isVideoEnabled: call.type === "video",
        duration: 0,
      });

      setIncomingCall(null);
      startDurationTimer();
      console.log("[useCall] Call accepted:", callId);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof Error ? err.message : "Không thể chấp nhận cuộc gọi";
      setError(message);
      console.error("[useCall] Accept call error:", err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const rejectCall = useCallback(async (callId: string) => {
    try {
      setLoading(true);
      await UnifiedCallService.rejectCall(parseInt(callId, 10));

      if (!isMountedRef.current) return;
      setIncomingCall(null);
      console.log("[useCall] Call rejected:", callId);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof Error ? err.message : "Không thể từ chối cuộc gọi";
      setError(message);
      console.error("[useCall] Reject call error:", err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      setLoading(true);
      // endCall expects roomId string, not callId number
      await UnifiedCallService.endCall(
        activeCall.call.roomId || String(activeCall.call.id)
      );

      stopDurationTimer();

      if (onCallEnded) {
        onCallEnded(activeCall.call);
      }

      if (!isMountedRef.current) return;

      setActiveCall(null);

      // Refresh history to include this call
      await refreshHistory();
      console.log("[useCall] Call ended");
    } catch (err) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof Error ? err.message : "Không thể kết thúc cuộc gọi";
      setError(message);
      console.error("[useCall] End call error:", err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [activeCall, onCallEnded, refreshHistory]);

  // ==================== IN-CALL CONTROLS ====================

  const toggleMute = useCallback(() => {
    setActiveCall((prev) => {
      if (!prev) return null;
      return { ...prev, isMuted: !prev.isMuted };
    });
  }, []);

  const toggleVideo = useCallback(() => {
    setActiveCall((prev) => {
      if (!prev) return null;
      return { ...prev, isVideoEnabled: !prev.isVideoEnabled };
    });
  }, []);

  // ==================== MISSED CALLS ====================

  const markMissedAsRead = useCallback(
    async (callId: string) => {
      try {
        await UnifiedCallService.markMissedCallsAsRead([parseInt(callId, 10)]);

        if (!isMountedRef.current) return;

        // Update local state
        setCallHistory((prev) =>
          prev.map((item) =>
            item.id === callId ? { ...item, status: "ended" as const } : item
          )
        );

        // Update badge
        setMissedCallsCount((prev) => {
          const newCount = Math.max(0, prev - 1);
          syncWithMessaging(badges.messages, newCount);
          return newCount;
        });

        console.log("[useCall] Marked missed call as read:", callId);
      } catch (err) {
        console.error("[useCall] Mark missed as read error:", err);
      }
    },
    [syncWithMessaging, badges.messages]
  );

  const clearMissedCalls = useCallback(async () => {
    try {
      await UnifiedCallService.markMissedCallsAsRead();

      if (!isMountedRef.current) return;

      // Update all missed calls in history
      setCallHistory((prev) =>
        prev.map((item) =>
          item.status === "missed"
            ? { ...item, status: "ended" as const }
            : item
        )
      );

      // Clear badge
      updateBadge(0);
      console.log("[useCall] Cleared all missed calls");
    } catch (err) {
      console.error("[useCall] Clear missed calls error:", err);
    }
  }, [updateBadge]);

  // ==================== DURATION TIMER ====================

  const startDurationTimer = useCallback(() => {
    stopDurationTimer();

    durationIntervalRef.current = setInterval(() => {
      setActiveCall((prev) => {
        if (!prev) return null;
        return { ...prev, duration: prev.duration + 1 };
      });
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // ==================== HANDLE INCOMING CALL (WebSocket) ====================

  const handleIncomingCall = useCallback(
    (call: IncomingCall) => {
      setIncomingCall(call);

      // Update missed calls count (cuộc gọi đến mới)
      setMissedCallsCount((prev) => {
        const newCount = prev + 1;
        syncWithMessaging(badges.messages, newCount);
        return newCount;
      });

      if (onIncomingCall) {
        onIncomingCall(call);
      }
    },
    [onIncomingCall, syncWithMessaging, badges.messages]
  );

  // TODO: Integrate with call WebSocket service for real-time incoming calls
  // Placeholder for WebSocket integration
  useEffect(() => {
    // When call WebSocket is available, connect here
    // callWebSocket.onIncomingCall(handleIncomingCall);
    // return () => callWebSocket.disconnect();
  }, [handleIncomingCall]);

  // ==================== EFFECTS ====================

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto load history on mount
  useEffect(() => {
    if (autoLoadHistory && user?.id) {
      loadHistory(1, false);
      loadMissedCallsCount();
    }
  }, [autoLoadHistory, user?.id, loadHistory, loadMissedCallsCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTimer();
    };
  }, [stopDurationTimer]);

  // ==================== RETURN ====================

  return {
    // State
    activeCall,
    incomingCall,
    callHistory,
    missedCallsCount,
    loading,
    refreshing,
    error,

    // Call Actions
    startCall,
    acceptCall,
    rejectCall,
    endCall,

    // In-call Controls
    toggleMute,
    toggleVideo,

    // History Actions
    refreshHistory,
    loadMoreHistory,
    markMissedAsRead,
    clearMissedCalls,

    // Helpers
    formatDuration,
    getCallStatusText,
    getCallIcon,
    getCallColor,
    isCallActive: activeCall !== null,
    hasMoreHistory,
  };
}

export default useCall;
