/**
 * useRememberMe Hook
 * Handle "Remember Me" functionality with secure credential storage
 */

import { deleteItem, getItem, setItem } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

const REMEMBER_ME_KEY = 'remember_me';
const REMEMBERED_EMAIL_KEY = 'remembered_email';
const REMEMBERED_TOKEN_KEY = 'remembered_token';

export interface RememberedCredentials {
  email: string;
  token: string;
  timestamp: number;
}

export function useRememberMe() {
  const [isRemembered, setIsRemembered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRememberedStatus();
  }, []);

  const checkRememberedStatus = async () => {
    try {
      const remembered = await getItem(REMEMBER_ME_KEY);
      setIsRemembered(remembered === 'true');
    } catch (error) {
      console.error('[useRememberMe] Error checking status:', error);
      setIsRemembered(false);
    } finally {
      setLoading(false);
    }
  };

  const saveCredentials = useCallback(async (email: string, token: string): Promise<boolean> => {
    try {
      const credentials: RememberedCredentials = {
        email,
        token,
        timestamp: Date.now(),
      };
      
      await setItem(REMEMBERED_EMAIL_KEY, email);
      await setItem(REMEMBERED_TOKEN_KEY, token);
      await setItem(REMEMBER_ME_KEY, 'true');
      
      setIsRemembered(true);
      return true;
    } catch (error) {
      console.error('[useRememberMe] Error saving credentials:', error);
      return false;
    }
  }, []);

  const getCredentials = useCallback(async (): Promise<RememberedCredentials | null> => {
    try {
      const remembered = await getItem(REMEMBER_ME_KEY);
      if (remembered !== 'true') return null;

      const email = await getItem(REMEMBERED_EMAIL_KEY);
      const token = await getItem(REMEMBERED_TOKEN_KEY);

      if (!email || !token) {
        // Clear invalid data
        await clearCredentials();
        return null;
      }

      return {
        email,
        token,
        timestamp: Date.now(), // Could store actual timestamp if needed
      };
    } catch (error) {
      console.error('[useRememberMe] Error getting credentials:', error);
      return null;
    }
  }, []);

  const clearCredentials = useCallback(async (): Promise<boolean> => {
    try {
      await deleteItem(REMEMBER_ME_KEY);
      await deleteItem(REMEMBERED_EMAIL_KEY);
      await deleteItem(REMEMBERED_TOKEN_KEY);
      setIsRemembered(false);
      return true;
    } catch (error) {
      console.error('[useRememberMe] Error clearing credentials:', error);
      return false;
    }
  }, []);

  const enableRememberMe = useCallback(async (email: string, token: string): Promise<boolean> => {
    return await saveCredentials(email, token);
  }, [saveCredentials]);

  const disableRememberMe = useCallback(async (): Promise<boolean> => {
    return await clearCredentials();
  }, [clearCredentials]);

  return {
    isRemembered,
    loading,
    saveCredentials,
    getCredentials,
    clearCredentials,
    enableRememberMe,
    disableRememberMe,
  };
}
