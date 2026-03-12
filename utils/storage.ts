import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const WEB_PREFIX = "secure:";

// Some platforms (SecureStore) are picky about key characters.
// Normalize to a safe subset: letters, numbers, dot, underscore, hyphen.
const SAFE_KEY_RE = /[^a-zA-Z0-9._-]/g;
function normalizeKey(key: string) {
  return String(key).replace(SAFE_KEY_RE, "_");
}

export async function setItem(key: string, value: string): Promise<void> {
  const safeKey = normalizeKey(key);

  // Warn about large values that might not be stored successfully
  if (value.length > 2048) {
    console.warn(
      `[Storage] Value for key '${key}' is ${value.length} bytes (>2048). May not be stored successfully in SecureStore.`,
    );
  }

  if (Platform.OS === "web") {
    try {
      const ls: any = (window as any)?.localStorage;
      if (ls && typeof ls.setItem === "function") {
        ls.setItem(WEB_PREFIX + safeKey, value);
      }
    } catch {}
    return;
  }
  await SecureStore.setItemAsync(safeKey, value);
}

export async function getItem(key: string): Promise<string | null> {
  const safeKey = normalizeKey(key);
  if (Platform.OS === "web") {
    try {
      const ls: any = (window as any)?.localStorage;
      if (!ls) return null;
      const v = ls.getItem?.(WEB_PREFIX + safeKey) ?? null;
      if (v != null) return v;
      const legacy = ls.getItem?.(WEB_PREFIX + key) ?? null;
      return legacy;
    } catch {
      return null;
    }
  }
  const v = await SecureStore.getItemAsync(safeKey);
  if (v != null) return v;
  // No reliable legacy fallback on native; but try raw key once for backward compat
  try {
    return await SecureStore.getItemAsync(String(key));
  } catch {
    return null;
  }
}

export async function deleteItem(key: string): Promise<void> {
  const safeKey = normalizeKey(key);
  if (Platform.OS === "web") {
    try {
      const ls: any = (window as any)?.localStorage;
      if (ls) {
        try {
          ls.removeItem?.(WEB_PREFIX + safeKey);
        } catch {}
        try {
          ls.removeItem?.(WEB_PREFIX + key);
        } catch {}
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.deleteItemAsync(safeKey);
  } catch {}
  try {
    await SecureStore.deleteItemAsync(String(key));
  } catch {}
}

export async function setToken(token: string) {
  await setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return getItem(TOKEN_KEY);
}

// Alias for backward compatibility
export const getAuthToken = getToken;

export async function clearToken() {
  await deleteItem(TOKEN_KEY);
}

// ============================================
// GENERIC STORAGE HELPERS FOR JSON DATA
// ============================================

/**
 * Store any JSON-serializable data
 */
export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await setItem(key, jsonValue);
  } catch (error) {
    console.error(`Failed to store item '${key}':`, error);
    throw error;
  }
}

/**
 * Retrieve and parse JSON data
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await getItem(key);
    if (!jsonValue) return null;
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`Failed to retrieve item '${key}':`, error);
    return null;
  }
}

/**
 * Delete stored item
 */
export async function deleteStorageItem(key: string): Promise<void> {
  await deleteItem(key);
}

// ============================================
// SECURE ITEM ALIASES (for compatibility)
// ============================================

/**
 * Alias for setItem - stores secure data
 */
export const setSecureItem = setItem;

/**
 * Alias for getItem - retrieves secure data
 */
export const getSecureItem = getItem;

/**
 * Alias for deleteItem - removes secure data
 */
export const deleteSecureItem = deleteItem;
