/**
 * Application Configuration
 * Centralized config for API endpoints and LiveKit WebSocket URL
 */

// API Base URL — always point to production; local dev override via .env
export const API_BASE = "https://baotienweb.cloud/api";

// LiveKit WebSocket URL
export const LIVEKIT_WS_URL = "wss://api.thietkeresort.com.vn/livekit";

// API Timeout (ms)
export const API_TIMEOUT = 15000;

// App Config
export const APP_CONFIG = {
  name: "ThietKeResort",
  version: "1.0.0",
  scheme: "thietkeresort",
} as const;
