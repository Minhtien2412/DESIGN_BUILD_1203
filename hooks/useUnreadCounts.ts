/**
 * useUnreadCounts Hook
 * Fetches unread counts for messages, calls, and notifications from server
 * Auto-refreshes every 30 seconds
 * Fallback to local state when server endpoint not available
 */

import { NOTIFICATION_ENDPOINTS } from '@/constants/api-endpoints';
import { useNotifications } from '@/features/notifications';
import { apiFetch } from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UnreadCounts {
  messages: number;
  calls: number;
  notifications: number;
  total: number;
}

interface UseUnreadCountsResult {
  counts: UnreadCounts;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUnreadCounts(autoRefresh = true): UseUnreadCountsResult {
  const { unreadCount: localNotifUnread } = useNotifications();
  
  // Local state for unread counts (will be fetched from server)
  const [messagesCount] = useState(0);
  const [callsCount] = useState(0);
  
  const [counts, setCounts] = useState<UnreadCounts>({
    messages: 0,
    calls: 0,
    notifications: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const endpointMissingRef = useRef(false);
  const warnedRef = useRef(false);
  const probeAttemptsRef = useRef(0);

  const fetchCounts = useCallback(async () => {
    try {
      if (endpointMissingRef.current) {
        const notifications = Number.isFinite(localNotifUnread) ? localNotifUnread : 0;
        const messages = messagesCount;
        const calls = callsCount;
        setCounts({
          messages,
          calls,
          notifications,
          total: messages + calls + notifications,
        });
        setError(null);
        return;
      }

      const data = await apiFetch(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
      setCounts({
        messages: data.messages || 0,
        calls: data.calls || 0,
        notifications: data.notifications || 0,
        total: data.total || ((data.messages || 0) + (data.calls || 0) + (data.notifications || 0)),
      });
      setError(null);
    } catch (err: any) {
      const status = err?.status ?? err?.data?.statusCode;
      if (status === 404) {
        endpointMissingRef.current = true;
        if (!warnedRef.current) {
          console.warn('[useUnreadCounts] Endpoint not found (404). Switching to local fallback.');
          warnedRef.current = true;
        }
        const notifications = Number.isFinite(localNotifUnread) ? localNotifUnread : 0;
        const messages = messagesCount;
        const calls = callsCount;
        setCounts({ messages, calls, notifications, total: messages + calls + notifications });
        setError(null);
      } else {
        console.error('Failed to fetch unread counts:', err);
        setError(err?.message || 'Failed to fetch unread counts');
      }
    } finally {
      setLoading(false);
    }
  }, [localNotifUnread, messagesCount, callsCount]);

  // Probe to check if server endpoint becomes available
  const probeEndpoint = useCallback(async () => {
    try {
      const data = await apiFetch(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
      // Success! Endpoint is back
      endpointMissingRef.current = false;
      warnedRef.current = false;
      probeAttemptsRef.current = 0;
      console.log('[useUnreadCounts] Server endpoint restored. Switching back to server source.');
      // Update counts immediately
      setCounts({
        messages: data.messages || 0,
        calls: data.calls || 0,
        notifications: data.notifications || 0,
        total: data.total || ((data.messages || 0) + (data.calls || 0) + (data.notifications || 0)),
      });
      setError(null);
    } catch (err: any) {
      // Still missing, increment attempts
      probeAttemptsRef.current++;
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchCounts();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchCounts]);

  // Re-probe timer: start at 10 minutes, exponential backoff up to 60 minutes
  useEffect(() => {
    if (!autoRefresh || !endpointMissingRef.current) return;

    const baseInterval = 10 * 60 * 1000; // 10 minutes
    const maxInterval = 60 * 60 * 1000; // 60 minutes
    const backoffFactor = Math.min(Math.pow(2, probeAttemptsRef.current), maxInterval / baseInterval);
    const probeInterval = Math.min(baseInterval * backoffFactor, maxInterval);

    const timer = setTimeout(() => {
      if (endpointMissingRef.current) {
        console.log(`[useUnreadCounts] Probing endpoint (attempt ${probeAttemptsRef.current + 1})...`);
        probeEndpoint();
      }
    }, probeInterval);

    return () => clearTimeout(timer);
  }, [autoRefresh, probeEndpoint, endpointMissingRef.current, probeAttemptsRef.current]);

  return {
    counts,
    loading,
    error,
    refresh,
  };
}
