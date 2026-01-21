/**
 * useTokenRefresh Hook
 * Automatically refreshes access token before expiry
 */

import ENV from '@/config/env';
import { apiFetch } from '@/services/api';
import {
    clearTokens,
    getRefreshToken,
    isTokenExpired,
    saveTokens
} from '@/services/token.service';
import { useEffect, useRef } from 'react';

interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string;
}

export const useTokenRefresh = (
  isAuthenticated: boolean,
  onTokenExpired: () => void,
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const checkAndRefreshToken = async () => {
      try {
        const expired = await isTokenExpired();
        
        if (expired) {
          console.log('[useTokenRefresh] Token expired, refreshing...');
          const refreshToken = await getRefreshToken();
          
          if (!refreshToken) {
            console.error('[useTokenRefresh] No refresh token, logging out');
            await clearTokens();
            onTokenExpired();
            return;
          }

          // Call refresh endpoint
          const refreshPath = ENV.AUTH_REFRESH_PATH || '/auth/refresh';
          const result = await apiFetch<TokenRefreshResult>(refreshPath, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
            },
          });

          if (result?.accessToken) {
            // Save new tokens
            const expiryTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
            await saveTokens({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken || refreshToken, // Use new or keep old
              expiresAt: expiryTimestamp,
            });
            console.log('[useTokenRefresh] ✅ Token refreshed successfully');
          } else {
            throw new Error('No access token in refresh response');
          }
        }
      } catch (error) {
        console.error('[useTokenRefresh] ❌ Token refresh failed:', error);
        await clearTokens();
        onTokenExpired();
      }
    };

    // Check immediately on mount
    checkAndRefreshToken();

    // Check every 5 minutes
    intervalRef.current = setInterval(checkAndRefreshToken, 5 * 60 * 1000) as any;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, onTokenExpired]);
};
