/**
 * useCallUnreadCount Hook
 * Returns count of missed incoming calls (unread/unacknowledged)
 */

import { MESSAGING_ENDPOINTS } from '@/constants/api-endpoints';
import { apiFetch } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface MissedCall {
  id: number;
  status: 'missed' | 'declined';
  isIncoming: boolean;
  // ... other fields not needed for count
}

export function useCallUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ calls: MissedCall[] }>(MESSAGING_ENDPOINTS.MISSED_CALLS);
      // Only count incoming missed/declined calls as "unread"
      const missedIncoming = (data.calls || []).filter(call => call.isIncoming).length;
      setCount(missedIncoming);
    } catch (err) {
      console.error('[useCallUnreadCount] Failed to fetch:', err);
      // Keep previous count on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, loading, refresh: fetchCount };
}
