/**
 * API Configuration
 * Centralized API configuration for services
 */
import ENV from './env';

export const API_CONFIG = {
  BACKEND: {
    BASE_URL: ENV.API_BASE_URL,
    API_KEY: ENV.API_KEY,
    TIMEOUT: 20000,
  },
  PERFEX: {
    BASE_URL: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
    API_TOKEN: ENV.PERFEX_API_TOKEN || '',
    TIMEOUT: 30000,
  },
  // WebSocket configuration
  SOCKET_URL: ENV.WS_BASE_URL || 'wss://baotienweb.cloud',
};

/**
 * Create API configuration with base URL
 */
export function createApiConfig(baseUrl: string) {
  return {
    baseUrl,
    timeout: API_CONFIG.BACKEND.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_CONFIG.BACKEND.API_KEY,
    },
  };
}

export default API_CONFIG;
