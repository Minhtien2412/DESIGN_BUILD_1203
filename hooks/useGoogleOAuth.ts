/**
 * Google OAuth Platform-Agnostic Entry Point
 * 
 * Metro bundler will automatically resolve to:
 * - useGoogleOAuth.native.ts for iOS/Android (full OAuth functionality)
 * - useGoogleOAuth.web.ts for web (disabled due to WebCrypto restrictions)
 * 
 * This file should NEVER be imported directly.
 * It exists only as a fallback for Metro resolver.
 */

// Re-export from native implementation as fallback
// (Metro will use .web.ts or .native.ts based on platform)
export * from './useGoogleOAuth.native';
