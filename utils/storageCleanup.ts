/**
 * Storage Cleanup Utility
 * Xóa dữ liệu auth cũ để sử dụng enhanced auth system
 */

import { clearToken, deleteItem } from '../utils/storage';

export async function clearOldAuthData() {
  try {
    console.log('[StorageCleanup] Clearing old auth data...');
    
    // Clear old auth tokens
    await clearToken();
    
    // Clear old user data
    const keysToRemove = [
      'auth:currentUser',
      'auth:currentUserId', 
      'user:profile',
      'session:token',
      'session:user',
      'auth:session',
      'auth:profile',
      'currentUser',
      'authToken'
    ];
    
    for (const key of keysToRemove) {
      try {
        await deleteItem(key);
        console.log(`[StorageCleanup] Removed: ${key}`);
      } catch (error) {
        // Continue even if key doesn't exist
      }
    }
    
    console.log('[StorageCleanup] ✅ Old auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('[StorageCleanup] Error clearing auth data:', error);
    return false;
  }
}

export async function resetAppToFreshState() {
  try {
    console.log('[StorageCleanup] Resetting app to fresh state...');
    
    // Clear auth data
    await clearOldAuthData();
    
    // Clear any cached API data
    const cacheKeys = [
      'api:cache',
      'api:responses',
      'user:cache',
      'session:cache'
    ];
    
    for (const key of cacheKeys) {
      try {
        await deleteItem(key);
      } catch (error) {
        // Continue even if key doesn't exist
      }
    }
    
    console.log('[StorageCleanup] ✅ App reset to fresh state');
    return true;
  } catch (error) {
    console.error('[StorageCleanup] Error resetting app:', error);
    return false;
  }
}