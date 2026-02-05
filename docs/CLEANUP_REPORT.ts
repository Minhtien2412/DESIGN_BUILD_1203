/**
 * Cleanup Report - Duplicate Files Analysis
 * Generated: 2026-01-24
 *
 * This file documents duplicate/deprecated files that can be safely removed
 * after confirming all references have been updated.
 */

// ============================================================================
// DUPLICATE SCREENS ANALYSIS
// ============================================================================

export const DUPLICATE_FILES = {
  // Projects - Keep ProjectsScreenModernized.tsx
  projects: {
    keep: "features/projects/ProjectsScreenModernized.tsx",
    deprecated: [
      "features/projects/ProjectsScreen.tsx", // Old version, complex
      "features/projects/ProjectsScreenModern.tsx", // Intermediate version
    ],
    note: "ProjectsScreenModernized uses Nordic Green theme, is cleanest",
  },

  // Profile - Keep ProfileScreenEuropean.tsx
  profile: {
    keep: "features/profile/ProfileScreenEuropean.tsx",
    deprecated: [
      "features/profile/ProfileScreenModernized.tsx", // Earlier modernization
    ],
    note: "ProfileScreenEuropean has QR code, achievements, 3D effects",
  },

  // Notifications - Keep UnifiedNotificationsScreen.tsx
  notifications: {
    keep: "features/notifications/UnifiedNotificationsScreen.tsx",
    deprecated: [
      "features/notifications/NotificationsScreenModernized.tsx", // Older version
    ],
    note: "UnifiedNotificationsScreen has CRM sync, messages/calls tabs",
  },

  // Call - Keep PremiumCallScreen.tsx
  call: {
    keep: "features/call/PremiumCallScreen.tsx",
    deprecated: [
      "features/call/SimpleCallScreen.tsx", // Basic version, keep for fallback
    ],
    note: "PremiumCallScreen has ringtones, hold music, animations",
  },
};

// ============================================================================
// SERVICES TO CONSOLIDATE
// ============================================================================

export const SERVICES_TO_REVIEW = {
  // Auth services - multiple implementations
  auth: [
    "services/auth.ts",
    "services/authApi.ts",
    "services/authService.ts",
    "services/unifiedAuth.ts",
    "services/enhancedAuth.ts",
    "services/remoteAuth.ts",
    "services/serverAuth.ts",
    "services/localAuth.ts",
    "services/thietke-auth.ts",
    "services/mysqlAuth.ts",
    "services/perfexAuth.ts",
    // Recommendation: Use unifiedAuth.ts as main, others are specific adapters
  ],

  // Project services
  projects: [
    "services/projects.ts",
    "services/projectApi.ts",
    "services/projectsApi.ts",
    "services/projects.api.ts",
    "services/remoteProjects.ts",
    "services/enhancedProjectApi.ts",
    "services/secureProjectApi.ts",
    "services/workingProjectApiService.ts",
    // Recommendation: Consolidate to projectApi.ts
  ],

  // API clients
  api: [
    "services/api.ts", // Main - keep
    "services/api-client.ts",
    "services/apiClient.ts",
    "services/http-client.ts",
    "services/serverClient.ts",
    "services/backendClient.ts",
    "services/enhancedApi.ts",
    "services/enhancedServerClient.ts",
    // Recommendation: Use api.ts as main, others for specific purposes
  ],

  // Notification services
  notifications: [
    "services/notifications.ts",
    "services/notifications-api.ts",
    "services/notificationsApi.ts",
    "services/notificationService.ts",
    "services/notificationSyncService.ts",
    "services/notificationRealtimeService.ts",
    "services/pushNotifications.ts",
    "services/pushNotificationService.ts",
    "services/push.ts",
    "services/push-notification.service.ts",
    "services/notification-badge.ts",
    "services/notification-listener.ts",
    // Recommendation: Use notificationSyncService.ts for unified approach
  ],

  // Chat/Message services
  chat: [
    "services/ChatService.ts",
    "services/chatAPIService.ts",
    "services/chatHistoryService.ts",
    "services/chatRealtime.ts",
    "services/unifiedChatService.ts",
    "services/message.service.ts",
    // Recommendation: Use unifiedChatService.ts
  ],

  // Video services
  video: [
    "services/videoService.ts",
    "services/videoManager.ts",
    "services/videoCache.ts",
    "services/VideoCacheManager.ts",
    "services/VideoFeedService.ts",
    "services/VideoUploadService.ts",
    "services/VideoPlayerController.ts",
    "services/VideoViewerService.ts",
    "services/VideoInteractionsService.ts",
    "services/video-interactions.ts",
    "services/video-interactions.service.ts",
    "services/shortVideoService.ts",
    "services/reelsService.ts",
    // Recommendation: Keep separate, each has specific purpose
  ],
};

// ============================================================================
// RECOMMENDED CLEANUP ACTIONS
// ============================================================================

export const CLEANUP_ACTIONS = [
  {
    priority: "HIGH",
    action: "Update app routes to use features/index.ts exports",
    files: [
      "app/profile/index.tsx",
      "app/projects/index.tsx",
      "app/notifications/index.tsx",
    ],
  },
  {
    priority: "MEDIUM",
    action: "Remove unused screen files after confirming no references",
    files: DUPLICATE_FILES.projects.deprecated,
  },
  {
    priority: "LOW",
    action: "Consolidate API services into unified modules",
    files: SERVICES_TO_REVIEW.api,
  },
];

// ============================================================================
// API ENDPOINTS CURRENTLY IN USE
// ============================================================================

export const ACTIVE_API_ENDPOINTS = {
  homeScreen: {
    workers: "GET /workers/stats",
    services: "GET /services/featured",
    videos: "GET /videos/featured (Pexels)",
    news: "GET /news (GNews)",
  },
  profile: {
    stats: "GET /users/{id}/stats",
    avatar: "POST /users/{id}/avatar",
    update: "PUT /users/{id}",
  },
  notifications: {
    list: "GET /notifications",
    sync: "GET /notifications/sync",
    markRead: "PUT /notifications/{id}/read",
    crmSync: "GET /crm/notifications",
  },
  projects: {
    list: "GET /projects",
    detail: "GET /projects/{id}",
    create: "POST /projects",
    update: "PUT /projects/{id}",
  },
  messages: {
    conversations: "GET /conversations",
    messages: "GET /conversations/{id}/messages",
    send: "POST /conversations/{id}/messages",
  },
  calls: {
    history: "GET /calls/history",
    missed: "GET /calls/missed",
  },
};

export default {
  DUPLICATE_FILES,
  SERVICES_TO_REVIEW,
  CLEANUP_ACTIONS,
  ACTIVE_API_ENDPOINTS,
};
