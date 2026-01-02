/**
 * Offline Storage Utility
 * Persist data for offline access using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const OFFLINE_PREFIX = 'offline_cache_';

export interface OfflineData<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Save data for offline access
 */
export async function saveOfflineData<T>(
  key: string,
  data: T,
  ttl: number = 24 * 60 * 60 * 1000 // Default 24 hours
): Promise<void> {
  if (Platform.OS === 'web') {
    // Skip on web SSR
    if (typeof window === 'undefined') return;
  }

  try {
    const offlineData: OfflineData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    await AsyncStorage.setItem(
      OFFLINE_PREFIX + key,
      JSON.stringify(offlineData)
    );

    console.log(`[OfflineStorage] Saved data for key: ${key}`);
  } catch (error) {
    console.error(`[OfflineStorage] Failed to save data for key ${key}:`, error);
  }
}

/**
 * Get offline data if available and not expired
 */
export async function getOfflineData<T>(key: string): Promise<T | null> {
  if (Platform.OS === 'web') {
    // Skip on web SSR
    if (typeof window === 'undefined') return null;
  }

  try {
    const stored = await AsyncStorage.getItem(OFFLINE_PREFIX + key);
    if (!stored) return null;

    const offlineData: OfflineData<T> = JSON.parse(stored);

    // Check if expired
    if (Date.now() > offlineData.expiresAt) {
      console.log(`[OfflineStorage] Data expired for key: ${key}`);
      await removeOfflineData(key);
      return null;
    }

    console.log(`[OfflineStorage] Retrieved data for key: ${key}`);
    return offlineData.data;
  } catch (error) {
    console.error(`[OfflineStorage] Failed to get data for key ${key}:`, error);
    return null;
  }
}

/**
 * Remove offline data
 */
export async function removeOfflineData(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
  }

  try {
    await AsyncStorage.removeItem(OFFLINE_PREFIX + key);
    console.log(`[OfflineStorage] Removed data for key: ${key}`);
  } catch (error) {
    console.error(`[OfflineStorage] Failed to remove data for key ${key}:`, error);
  }
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
  }

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const offlineKeys = allKeys.filter(key => key.startsWith(OFFLINE_PREFIX));
    await AsyncStorage.multiRemove(offlineKeys);
    console.log(`[OfflineStorage] Cleared ${offlineKeys.length} offline items`);
  } catch (error) {
    console.error('[OfflineStorage] Failed to clear offline data:', error);
  }
}

/**
 * Get offline storage stats
 */
export async function getOfflineStorageStats(): Promise<{
  count: number;
  keys: string[];
}> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return { count: 0, keys: [] };
    }
  }

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const offlineKeys = allKeys.filter(key => key.startsWith(OFFLINE_PREFIX));
    
    return {
      count: offlineKeys.length,
      keys: offlineKeys.map(key => key.replace(OFFLINE_PREFIX, '')),
    };
  } catch (error) {
    console.error('[OfflineStorage] Failed to get stats:', error);
    return { count: 0, keys: [] };
  }
}
