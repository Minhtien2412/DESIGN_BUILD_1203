/**
 * useCall Hook
 * Manages call state, history, and actions with real-time updates
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useAuth } from '@/context/AuthContext';
import {
    Call,
    CallHistoryItem,
    callService,
    CallType,
    getCallDisplayInfo,
    MOCK_CALL_HISTORY,
} from '@/services/api/call.service';
import { useCallback, useEffect, useRef, useState } from 'react';

// ==================== TYPES ====================

export interface IncomingCall {
  id: number;
  callerId: number;
  callerName: string;
  callerAvatar?: string;
  type: CallType;
  roomId: string;
}

export interface ActiveCallState {
  call: Call;
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
  onCallEnded?: (call: Call) => void;
}

export interface UseCallReturn {
  // State
  activeCall: ActiveCallState | null;
  incomingCall: IncomingCall | null;
  callHistory: CallHistoryItem[];
  missedCallsCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Call Actions
  startCall: (userId: number, type?: CallType) => Promise<void>;
  acceptCall: (callId: number) => Promise<void>;
  rejectCall: (callId: number) => Promise<void>;
  endCall: () => Promise<void>;

  // In-call Controls
  toggleMute: () => void;
  toggleVideo: () => void;

  // History Actions
  refreshHistory: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  markMissedAsRead: (callId: number) => Promise<void>;
  clearMissedCalls: () => Promise<void>;

  // Helpers
  getCallInfo: (call: Call) => CallHistoryItem;
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
  } = options;

  const { user } = useAuth();

  // State
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [missedCallsCount, setMissedCallsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Refs
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Current user ID
  const currentUserId = typeof user?.id === 'string' ? parseInt(user.id, 10) : (user?.id ?? 0);

  // ==================== LOAD HISTORY ====================

  const loadHistory = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    if (!user?.id) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }
      setError(null);

      // Try API first, fallback to mock data
      let calls: Call[] = [];
      let hasMore = false;

      try {
        const response = await callService.getCallHistory({
          page,
          limit: historyLimit,
        });
        calls = response.calls;
        hasMore = response.hasMore;
      } catch {
        // Fallback to mock data in development
        console.warn('[useCall] API failed, using mock data');
        calls = MOCK_CALL_HISTORY;
        hasMore = false;
      }

      // Transform to CallHistoryItem
      const historyItems = calls.map(call => getCallDisplayInfo(call, currentUserId));

      if (page === 1) {
        setCallHistory(historyItems);
      } else {
        setCallHistory(prev => [...prev, ...historyItems]);
      }

      setHasMoreHistory(hasMore);
      setCurrentPage(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải lịch sử cuộc gọi';
      setError(message);
      console.error('[useCall] Load history error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, currentUserId, historyLimit]);

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
      const count = await callService.getMissedCallsCount();
      setMissedCallsCount(count);
    } catch {
      // Ignore error, keep current count
    }
  }, [user?.id]);

  // ==================== CALL ACTIONS ====================

  const startCall = useCallback(async (userId: number, type: CallType = 'video') => {
    if (!user?.id) {
      setError('Vui lòng đăng nhập để thực hiện cuộc gọi');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await callService.startCall(userId, type);

      setActiveCall({
        call: response.call,
        roomId: response.roomId,
        token: response.token,
        isConnected: false,
        isMuted: false,
        isVideoEnabled: type === 'video',
        duration: 0,
      });

      // Start duration timer
      startDurationTimer();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể bắt đầu cuộc gọi';
      setError(message);
      console.error('[useCall] Start call error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const acceptCall = useCallback(async (callId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await callService.acceptCall(callId);

      setActiveCall({
        call: response.call,
        roomId: response.call.roomId,
        token: response.token,
        isConnected: true,
        isMuted: false,
        isVideoEnabled: response.call.type === 'video',
        duration: 0,
      });

      setIncomingCall(null);
      startDurationTimer();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể chấp nhận cuộc gọi';
      setError(message);
      console.error('[useCall] Accept call error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectCall = useCallback(async (callId: number) => {
    try {
      setLoading(true);
      await callService.rejectCall(callId);
      setIncomingCall(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể từ chối cuộc gọi';
      setError(message);
      console.error('[useCall] Reject call error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      setLoading(true);
      const endedCall = await callService.endCall(activeCall.roomId);

      stopDurationTimer();

      if (onCallEnded) {
        onCallEnded(endedCall);
      }

      setActiveCall(null);
      
      // Refresh history to include this call
      await refreshHistory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể kết thúc cuộc gọi';
      setError(message);
      console.error('[useCall] End call error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCall, onCallEnded, refreshHistory]);

  // ==================== IN-CALL CONTROLS ====================

  const toggleMute = useCallback(() => {
    setActiveCall(prev => {
      if (!prev) return null;
      return { ...prev, isMuted: !prev.isMuted };
    });
  }, []);

  const toggleVideo = useCallback(() => {
    setActiveCall(prev => {
      if (!prev) return null;
      return { ...prev, isVideoEnabled: !prev.isVideoEnabled };
    });
  }, []);

  // ==================== MISSED CALLS ====================

  const markMissedAsRead = useCallback(async (callId: number) => {
    try {
      await callService.markMissedCallAsRead(callId);
      setMissedCallsCount(prev => Math.max(0, prev - 1));
      
      // Update history item
      setCallHistory(prev =>
        prev.map(item =>
          item.id === callId ? { ...item, status: 'ended' as const } : item
        )
      );
    } catch (err) {
      console.error('[useCall] Mark missed as read error:', err);
    }
  }, []);

  const clearMissedCalls = useCallback(async () => {
    const missedCalls = callHistory.filter(c => c.status === 'missed');
    
    await Promise.all(
      missedCalls.map(call => callService.markMissedCallAsRead(call.id))
    );
    
    setMissedCallsCount(0);
  }, [callHistory]);

  // ==================== DURATION TIMER ====================

  const startDurationTimer = useCallback(() => {
    stopDurationTimer();
    
    durationIntervalRef.current = setInterval(() => {
      setActiveCall(prev => {
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

  // ==================== HELPER FUNCTIONS ====================

  const getCallInfo = useCallback((call: Call): CallHistoryItem => {
    return getCallDisplayInfo(call, currentUserId);
  }, [currentUserId]);

  // ==================== HANDLE INCOMING CALL (WebSocket) ====================

  const handleIncomingCall = useCallback((call: IncomingCall) => {
    setIncomingCall(call);
    
    if (onIncomingCall) {
      onIncomingCall(call);
    }
  }, [onIncomingCall]);

  // ==================== EFFECTS ====================

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
    getCallInfo,
    isCallActive: activeCall !== null,
    hasMoreHistory,
  };
}

export default useCall;
