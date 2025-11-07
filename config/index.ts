// NOTE:
// Backend public docs at: https://api.thietkeresort.com.vn/docs/
// (Assumption) Raw OpenAPI JSON often available at /openapi.json or /docs-json.
// Adjust EXPO_PUBLIC_API_BASE_URL in your .env if the base path differs (e.g. includes /api).
// We add API_PREFIX so if backend later serves under /api you only change env.

// Runtime override (set when dynamic fallback detects local mock server)
let RUNTIME_API_BASE_OVERRIDE: string | null = null;

const IS_PROD_ENV = (process.env.EXPO_PUBLIC_ENV || '').toLowerCase().startsWith('prod');
if (IS_PROD_ENV) {
  // Ensure no stale dev override leaks into a production session (hot reload, etc.)
  RUNTIME_API_BASE_OVERRIDE = null;
}

export const AppConfig = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn',
  API_PREFIX: process.env.EXPO_PUBLIC_API_PREFIX || '', // e.g. '/api' if server uses that prefix
  NODE_API_BASE_URL:
    process.env.EXPO_PUBLIC_NODE_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'https://api.thietkeresort.com.vn',
  VIDEOS_URL: process.env.EXPO_PUBLIC_VIDEOS_URL,
  TIMEOUT_MS: 15000,
  API_DEBUG: process.env.EXPO_PUBLIC_API_DEBUG === '1',
  API_SUPPRESS_KNOWN_404: process.env.EXPO_PUBLIC_API_SUPPRESS_KNOWN_404 === '1',
  API_MUTE_404_ENDPOINTS: (process.env.EXPO_PUBLIC_API_MUTE_404_ENDPOINTS || '/users/contacts,/users/presence,/users/search,/video-call/history,/video-call/sessions,/video-call/invite,/video-call/ice-config,/video-call/notifications,/auth/api-key').split(',').map((s: string) => s.trim()).filter(Boolean),
  // Feature flag: when enabled, skip remote contacts fetch (use local synthesized list)
  DISABLE_REMOTE_CONTACTS: process.env.EXPO_PUBLIC_DISABLE_REMOTE_CONTACTS === '1',
  // Suppress known Expo Go warnings
  SUPPRESS_EXPO_GO_WARNINGS: process.env.EXPO_PUBLIC_SUPPRESS_EXPO_GO_WARNINGS === '1',
  SILENT_NETWORK_ERRORS: process.env.EXPO_PUBLIC_SILENT_NETWORK_ERRORS === '1',
  SUPPRESS_KEY_WARN: process.env.EXPO_PUBLIC_SUPPRESS_KEY_WARN === '1',
  FORCE_PROD: process.env.EXPO_PUBLIC_FORCE_PROD === '1',
  USE_REMOTE_NOTIFICATIONS: process.env.EXPO_PUBLIC_USE_REMOTE_NOTIFICATIONS === '1',
} as const;

export function setRuntimeApiBase(url: string) {
  if (IS_PROD_ENV) return; // Do not allow override in production mode
  if (url && typeof url === 'string') {
    RUNTIME_API_BASE_OVERRIDE = url.replace(/\/$/, '');
    console.log('[API][RuntimeOverride] Switched API base to:', RUNTIME_API_BASE_OVERRIDE);
  }
}

export function getEffectiveApiBase() {
  if (IS_PROD_ENV) return AppConfig.API_BASE_URL.replace(/\/$/, '');
  return (RUNTIME_API_BASE_OVERRIDE || AppConfig.API_BASE_URL).replace(/\/$/, '');
}

export function buildApiUrl(path: string) {
  const base = getEffectiveApiBase();
  const prefix = (AppConfig.API_PREFIX || '').replace(/\/$/, '');
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${base}${prefix}${cleaned}`;
}
