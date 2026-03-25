/**
 * Construction Map Backend Configuration
 * Centralized config for API endpoints, WebSocket connections, and environment settings
 *
 * @description This file provides a single source of truth for all backend connection settings.
 * Update these values when deploying to different environments or when backend URLs change.
 */

export type Environment = "development" | "staging" | "production";

export interface ConstructionMapConfig {
  // Environment
  env: Environment;

  // REST API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  // WebSocket Configuration
  websocket: {
    url: string;
    path: string;
    reconnection: boolean;
    reconnectionDelay: number;
    reconnectionAttempts: number;
    transports: ("websocket" | "polling")[];
  };

  // Feature Flags
  features: {
    enableRealTimeSync: boolean;
    enableOfflineMode: boolean;
    enableDebugLogs: boolean;
  };

  // Performance Settings
  performance: {
    maxCachedProjects: number;
    cacheTimeout: number; // milliseconds
    throttleDelay: number; // milliseconds for debouncing API calls
  };
}

// Development Configuration (Local dev server or IP)
const developmentConfig: ConstructionMapConfig = {
  env: "development",

  api: {
    baseUrl: "http://103.200.20.100:3003/api/construction-map",
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000,
  },

  websocket: {
    url: "wss://baotienweb.cloud",
    path: "/construction-map",
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
  },

  features: {
    enableRealTimeSync: true,
    enableOfflineMode: false,
    enableDebugLogs: true,
  },

  performance: {
    maxCachedProjects: 5,
    cacheTimeout: 300000, // 5 minutes
    throttleDelay: 300,
  },
};

// Staging Configuration (Optional - for testing before production)
const stagingConfig: ConstructionMapConfig = {
  env: "staging",

  api: {
    baseUrl: "https://staging.baotienweb.cloud/api/construction-map",
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1500,
  },

  websocket: {
    url: "wss://staging.baotienweb.cloud",
    path: "/construction-map",
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 10,
    transports: ["websocket", "polling"],
  },

  features: {
    enableRealTimeSync: true,
    enableOfflineMode: true,
    enableDebugLogs: true,
  },

  performance: {
    maxCachedProjects: 10,
    cacheTimeout: 600000, // 10 minutes
    throttleDelay: 500,
  },
};

// Production Configuration (Using IP until DNS is configured)
const productionConfig: ConstructionMapConfig = {
  env: "production",

  api: {
    baseUrl: "http://103.200.20.100/api/construction-map",
    timeout: 20000, // 20 seconds for slower connections
    retryAttempts: 5,
    retryDelay: 2000,
  },

  websocket: {
    url: "wss://baotienweb.cloud",
    path: "/construction-map",
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: 10,
    transports: ["websocket", "polling"], // Fallback to polling if WebSocket fails
  },

  features: {
    enableRealTimeSync: true,
    enableOfflineMode: true,
    enableDebugLogs: false, // Disable in production
  },

  performance: {
    maxCachedProjects: 20,
    cacheTimeout: 900000, // 15 minutes
    throttleDelay: 1000,
  },
};

/**
 * Get current environment from process.env or __DEV__ flag
 */
function getCurrentEnvironment(): Environment {
  // For React Native Expo
  if (typeof __DEV__ !== "undefined") {
    return __DEV__ ? "development" : "production";
  }

  // For web/Node.js
  const nodeEnv = process.env.NODE_ENV as string | undefined;
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "staging") return "staging";
  return "development";
}

/**
 * Get configuration based on current environment
 */
export function getConstructionMapConfig(
  env?: Environment,
): ConstructionMapConfig {
  const currentEnv = env || getCurrentEnvironment();

  switch (currentEnv) {
    case "production":
      return productionConfig;
    case "staging":
      return stagingConfig;
    case "development":
    default:
      return developmentConfig;
  }
}

/**
 * Default export - automatically selects config based on environment
 */
const config = getConstructionMapConfig();

export default config;

/**
 * Named exports for specific environments
 */
export { developmentConfig, productionConfig, stagingConfig };

/**
 * Helper function: Get full API endpoint URL
 */
export function getApiUrl(
  path: string,
  customConfig?: ConstructionMapConfig,
): string {
  const cfg = customConfig || config;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cfg.api.baseUrl}${cleanPath}`;
}

/**
 * Helper function: Get WebSocket connection URL
 */
export function getWebSocketUrl(customConfig?: ConstructionMapConfig): string {
  const cfg = customConfig || config;
  return cfg.websocket.url;
}

/**
 * Helper function: Check if feature is enabled
 */
export function isFeatureEnabled(
  feature: keyof ConstructionMapConfig["features"],
): boolean {
  return config.features[feature];
}

/**
 * Health Check Configuration
 */
export const HEALTH_CHECK = {
  endpoint: "/health",
  interval: 30000, // Check every 30 seconds
  timeout: 5000,
};

/**
 * API Endpoints Registry
 * Centralized list of all available endpoints
 */
export const API_ENDPOINTS = {
  // Health
  health: "/health",

  // Project
  getProject: (projectId: string) => `/${projectId}`,
  getProgress: (projectId: string) => `/${projectId}/progress`,

  // Map State
  getMapState: (projectId: string) => `/${projectId}/state`,
  saveMapState: (projectId: string) => `/${projectId}/state`,

  // Tasks
  createTask: "/tasks",
  getTask: (taskId: string) => `/tasks/${taskId}`,
  updateTask: (taskId: string) => `/tasks/${taskId}`,
  deleteTask: (taskId: string) => `/tasks/${taskId}`,
  updateTaskPosition: (taskId: string) => `/tasks/${taskId}/position`,
  updateTaskStatus: (taskId: string) => `/tasks/${taskId}/status`,

  // Stages
  createStage: "/stages",
  getStage: (stageId: string) => `/stages/${stageId}`,
  updateStage: (stageId: string) => `/stages/${stageId}`,
  deleteStage: (stageId: string) => `/stages/${stageId}`,

  // Links
  createLink: "/links",
  deleteLink: (linkId: string) => `/links/${linkId}`,
} as const;

/**
 * WebSocket Events Registry
 * Centralized list of all socket events
 */
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_PROJECT: "join-project",
  LEAVE_PROJECT: "leave-project",
  TASK_MOVED: "task-moved",
  TASK_STATUS_CHANGED: "task-status-changed",
  ZOOM_CHANGED: "zoom-changed",
  PAN_CHANGED: "pan-changed",
  PING: "ping",

  // Server -> Client
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  TASK_MOVED_BROADCAST: "task-moved",
  TASK_STATUS_CHANGED_BROADCAST: "task-status-changed",
  ZOOM_CHANGED_BROADCAST: "zoom-changed",
  PAN_CHANGED_BROADCAST: "pan-changed",
  PONG: "pong",
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  CONNECTION_FAILED:
    "Không thể kết nối đến server. Vui lòng kiểm tra internet.",
  TIMEOUT: "Yêu cầu quá thời gian chờ. Vui lòng thử lại.",
  UNAUTHORIZED: "Bạn không có quyền truy cập. Vui lòng đăng nhập lại.",
  NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
  SERVER_ERROR: "Lỗi server. Vui lòng thử lại sau.",
  NETWORK_ERROR: "Lỗi mạng. Vui lòng kiểm tra kết nối internet.",
} as const;

/**
 * Usage Example:
 *
 * ```typescript
 * import config, { getApiUrl, API_ENDPOINTS, SOCKET_EVENTS } from '@/config/construction-map.config';
 *
 * // Get full API URL
 * const healthUrl = getApiUrl(API_ENDPOINTS.health);
 * // => "http://103.200.20.100:3003/api/construction-map/health"
 *
 * // Use config in hooks
 * const response = await fetch(getApiUrl(`/${projectId}`), {
 *   timeout: config.api.timeout,
 * });
 *
 * // WebSocket connection
 * const socket = io(config.websocket.url, {
 *   path: config.websocket.path,
 *   reconnection: config.websocket.reconnection,
 * });
 *
 * // Emit events
 * socket.emit(SOCKET_EVENTS.JOIN_PROJECT, { projectId });
 * ```
 */
