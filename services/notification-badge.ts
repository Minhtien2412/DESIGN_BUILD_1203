/**
 * Notification Badge Service
 * Quản lý badge số lượng thông báo và tin nhắn (như Shopee)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';

export interface BadgeCount {
  notifications: number;
  messages: number;
  cart: number;
  orders: number;
}

const STORAGE_KEY = 'badge_counts';
const LISTENERS: Set<(counts: BadgeCount) => void> = new Set();

let cachedCounts: BadgeCount = {
  notifications: 0,
  messages: 0,
  cart: 0,
  orders: 0,
};

/**
 * Lấy số lượng badge hiện tại
 */
export async function getBadgeCounts(): Promise<BadgeCount> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedCounts = JSON.parse(stored);
    }
    return cachedCounts;
  } catch (error) {
    console.error('Error getting badge counts:', error);
    return cachedCounts;
  }
}

/**
 * Cập nhật badge count
 */
export async function updateBadgeCount(
  type: keyof BadgeCount,
  count: number
): Promise<void> {
  try {
    cachedCounts[type] = count;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedCounts));
    
    // Notify listeners
    LISTENERS.forEach(listener => listener(cachedCounts));
  } catch (error) {
    console.error('Error updating badge count:', error);
  }
}

/**
 * Tăng badge count
 */
export async function incrementBadge(
  type: keyof BadgeCount,
  amount: number = 1
): Promise<void> {
  const current = cachedCounts[type] || 0;
  await updateBadgeCount(type, current + amount);
}

/**
 * Giảm badge count
 */
export async function decrementBadge(
  type: keyof BadgeCount,
  amount: number = 1
): Promise<void> {
  const current = cachedCounts[type] || 0;
  await updateBadgeCount(type, Math.max(0, current - amount));
}

/**
 * Reset badge count về 0
 */
export async function resetBadge(type: keyof BadgeCount): Promise<void> {
  await updateBadgeCount(type, 0);
}

/**
 * Reset tất cả badges
 */
export async function resetAllBadges(): Promise<void> {
  cachedCounts = {
    notifications: 0,
    messages: 0,
    cart: 0,
    orders: 0,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedCounts));
  LISTENERS.forEach(listener => listener(cachedCounts));
}

/**
 * Subscribe to badge updates
 */
export function subscribeToBadgeUpdates(
  callback: (counts: BadgeCount) => void
): () => void {
  LISTENERS.add(callback);
  
  // Return unsubscribe function
  return () => {
    LISTENERS.delete(callback);
  };
}

/**
 * Fetch badge counts từ server
 */
export async function fetchBadgeCountsFromServer(userId: string): Promise<BadgeCount> {
  try {
    const response = await apiFetch(`/users/${userId}/badge-counts`);
    const counts: BadgeCount = {
      notifications: response.notifications || 0,
      messages: response.messages || 0,
      cart: response.cart || 0,
      orders: response.orders || 0,
    };
    
    // Update local cache
    cachedCounts = counts;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    LISTENERS.forEach(listener => listener(counts));
    
    return counts;
  } catch (error) {
    console.error('Error fetching badge counts from server:', error);
    return cachedCounts;
  }
}

/**
 * Sync badge counts định kỳ
 */
export function startBadgeSync(userId: string, intervalMs: number = 30000): () => void {
  const interval = setInterval(() => {
    fetchBadgeCountsFromServer(userId);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Các helper functions cho từng loại badge
 */

// Thông báo
export const notificationBadge = {
  increment: () => incrementBadge('notifications'),
  decrement: () => decrementBadge('notifications'),
  reset: () => resetBadge('notifications'),
  set: (count: number) => updateBadgeCount('notifications', count),
};

// Tin nhắn
export const messageBadge = {
  increment: () => incrementBadge('messages'),
  decrement: () => decrementBadge('messages'),
  reset: () => resetBadge('messages'),
  set: (count: number) => updateBadgeCount('messages', count),
};

// Giỏ hàng
export const cartBadge = {
  increment: () => incrementBadge('cart'),
  decrement: () => decrementBadge('cart'),
  reset: () => resetBadge('cart'),
  set: (count: number) => updateBadgeCount('cart', count),
};

// Đơn hàng
export const orderBadge = {
  increment: () => incrementBadge('orders'),
  decrement: () => decrementBadge('orders'),
  reset: () => resetBadge('orders'),
  set: (count: number) => updateBadgeCount('orders', count),
};
