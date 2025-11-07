import { deleteItem, getItem, setItem } from '@/utils/storage';

// In-memory token storage for API-only operations
// Tokens are managed by the ConstructionAuthContext and API server
let accessToken = '';
let refreshToken = '';

export const AuthStore = {
  async setTokens(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;
    // Store in secure storage
    await setItem('access_token', access);
    await setItem('refresh_token', refresh);
  },
  async getAccessToken() {
    if (!accessToken) {
      try {
        accessToken = (await getItem('access_token')) || '';
      } catch (error) {
        console.warn('Failed to get access token from storage:', error);
        return '';
      }
    }
    return accessToken;
  },
  async getRefreshToken() {
    if (!refreshToken) {
      try {
        refreshToken = (await getItem('refresh_token')) || '';
      } catch (error) {
        console.warn('Failed to get refresh token from storage:', error);
        return '';
      }
    }
    return refreshToken;
  },
  async clear() {
    accessToken = '';
    refreshToken = '';
    // Clear from secure storage
    await deleteItem('access_token');
    await deleteItem('refresh_token');
  },
};