/**
 * useBadgeCount Hook
 * React hook để subscribe badge updates real-time
 */

import {
    BadgeCount,
    getBadgeCounts,
    subscribeToBadgeUpdates,
} from '@/services/notification-badge';
import { useEffect, useState } from 'react';

export function useBadgeCount() {
  const [counts, setCounts] = useState<BadgeCount>({
    notifications: 0,
    messages: 0,
    cart: 0,
    orders: 0,
  });

  useEffect(() => {
    // Load initial counts
    getBadgeCounts().then(setCounts);

    // Subscribe to updates
    const unsubscribe = subscribeToBadgeUpdates(setCounts);

    return unsubscribe;
  }, []);

  return counts;
}

/**
 * Hook cho badge đơn lẻ
 */
export function useSingleBadge(type: keyof BadgeCount): number {
  const counts = useBadgeCount();
  return counts[type];
}
