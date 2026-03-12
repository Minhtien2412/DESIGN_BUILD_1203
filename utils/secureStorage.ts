/**
 * Storage Utilities using expo-secure-store
 * Provides secure JWT token storage and retrieval
 */

import * as SecureStore from 'expo-secure-store';
import { clearToken, setToken, setTokenPersistor } from '../services/api';

const JWT_KEY = 'jwt_token';

/**
 * Save JWT token to secure storage and update API client
 */
export async function saveJWT(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(JWT_KEY, token);
    setToken(token);
  } catch (error) {
    console.error('Failed to save JWT:', error);
    throw new Error('Không thể lưu token xác thực');
  }
}

/**
 * Load JWT token from secure storage and update API client
 */
export async function loadJWT(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(JWT_KEY);
    if (token) {
      setToken(token);
    }
    return token;
  } catch (error) {
    console.error('Failed to load JWT:', error);
    return null;
  }
}

/**
 * Remove JWT token from secure storage and clear API client
 */
export async function removeJWT(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(JWT_KEY);
    clearToken();
  } catch (error) {
    console.error('Failed to remove JWT:', error);
    throw new Error('Không thể xóa token xác thực');
  }
}

/**
 * Check if JWT exists in secure storage
 */
export async function hasJWT(): Promise<boolean> {
  try {
    const token = await SecureStore.getItemAsync(JWT_KEY);
    return !!token;
  } catch (error) {
    console.error('Failed to check JWT:', error);
    return false;
  }
}

// Register a persistor so api.ts can save refreshed tokens transparently without importing this module
try {
  setTokenPersistor(async (token: string | null) => {
    try {
      if (token) {
        await SecureStore.setItemAsync(JWT_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(JWT_KEY);
      }
    } catch (err) {
      console.error('Failed to persist JWT from api refresh:', err);
    }
  });
} catch {}
