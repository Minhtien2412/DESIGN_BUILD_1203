/**
 * Environment Configuration
 * This file exposes environment variables to the app
 */
import Constants from 'expo-constants';

interface EnvConfig {
  API_BASE_URL: string;
  API_PREFIX: string;
  API_KEY: string;
  WS_URL?: string;
  AUTH_REFRESH_PATH?: string;
  AUTH_GOOGLE_PATH?: string;
  AUTH_FACEBOOK_PATH?: string;
  ENABLE_SOCIAL_GOOGLE?: boolean;
  ENABLE_SOCIAL_FACEBOOK?: boolean;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_WEB_CLIENT_ID?: string;
  GOOGLE_ANDROID_CLIENT_ID?: string;
  GOOGLE_IOS_CLIENT_ID?: string;
  BACKOFF_BASE_MS?: number;
  BACKOFF_JITTER_MS?: number;
}

// Get values from Constants (loaded from app.config.ts)
const extra = Constants.expoConfig?.extra || {};

export const ENV: EnvConfig = {
  API_BASE_URL: extra.API_URL || extra.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn',
  // Mobile app uses /auth/* endpoints directly (NO /api prefix)
  API_PREFIX: '',
  API_KEY: extra.EXPO_PUBLIC_API_KEY || 'thietke-resort-api-key-2024',
  WS_URL: extra.EXPO_PUBLIC_WS_URL || 'wss://api.thietkeresort.com.vn/ws',
  AUTH_REFRESH_PATH: extra.EXPO_PUBLIC_AUTH_REFRESH_PATH || '/auth/refresh',
  AUTH_GOOGLE_PATH: extra.EXPO_PUBLIC_AUTH_GOOGLE_PATH || '/auth/google',
  AUTH_FACEBOOK_PATH: extra.EXPO_PUBLIC_AUTH_FACEBOOK_PATH || '/auth/facebook',
  ENABLE_SOCIAL_GOOGLE: (extra.EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE ?? '1') !== '0',
  ENABLE_SOCIAL_FACEBOOK: (extra.EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK ?? '1') !== '0',
  GOOGLE_CLIENT_ID: extra.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '702527545429-60e3mi47s816iu9aus38kb83qgkmkgna.apps.googleusercontent.com',
  GOOGLE_WEB_CLIENT_ID: extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || extra.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID: extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID: extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  BACKOFF_BASE_MS: parseInt(extra.EXPO_PUBLIC_BACKOFF_BASE_MS || '500', 10),
  BACKOFF_JITTER_MS: parseInt(extra.EXPO_PUBLIC_BACKOFF_JITTER_MS || '500', 10),
};

// Debug logging
console.log('[ENV] Configuration loaded:');
console.log('[ENV] API_BASE_URL:', ENV.API_BASE_URL);
console.log('[ENV] API_PREFIX:', ENV.API_PREFIX);
console.log('[ENV] API_KEY:', ENV.API_KEY ? ENV.API_KEY.substring(0, 15) + '...' : 'NOT SET ⚠️');
console.log('[ENV] WS_URL:', ENV.WS_URL);
console.log('[ENV] AUTH_REFRESH_PATH:', ENV.AUTH_REFRESH_PATH);
console.log('[ENV] AUTH_GOOGLE_PATH:', ENV.AUTH_GOOGLE_PATH);
console.log('[ENV] AUTH_FACEBOOK_PATH:', ENV.AUTH_FACEBOOK_PATH);
console.log('[ENV] ENABLE_SOCIAL (G, F):', ENV.ENABLE_SOCIAL_GOOGLE, ENV.ENABLE_SOCIAL_FACEBOOK);

// Validate critical values
if (!ENV.API_KEY) {
  console.error('[ENV] ❌ CRITICAL: API_KEY is not set!');
  console.error('[ENV] Check app.config.ts and .env file');
}

export default ENV;
