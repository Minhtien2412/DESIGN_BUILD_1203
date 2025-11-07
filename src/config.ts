/**
 * Application Configuration
 * Centralized config for API endpoints and LiveKit WebSocket URL
 */

// API Base URL
export const API_BASE = __DEV__
  ? 'http://localhost:4000'
  : 'https://api.thietkeresort.com.vn';

// LiveKit WebSocket URL
export const LIVEKIT_WS_URL = __DEV__
  ? 'ws://localhost:4000/livekit'
  : 'wss://api.thietkeresort.com.vn/livekit';

// API Timeout (ms)
export const API_TIMEOUT = 15000;

// App Config
export const APP_CONFIG = {
  name: 'ThietKeResort',
  version: '1.0.0',
  scheme: 'thietkeresort',
} as const;
