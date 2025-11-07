/**
 * useMessageUnreadCount Hook
 * Returns total unread message count from all conversations
 */

import { apiFetch } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface Conversation {
  id: number;
  unreadCount: number;
  // ... other fields not needed for count
}

export function useMessageUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ conversations: Conversation[] }>('/api/messages/conversations');
      const totalUnread = (data.conversations || []).reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setCount(totalUnread);
    } catch (err) {
      console.error('[useMessageUnreadCount] Failed to fetch:', err);
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