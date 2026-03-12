/**
 * API Services Index
 * Central export point for all API services
 *
 * Backend: https://baotienweb.cloud
 * API Prefix: /api/v1
 * Total Endpoints: 130+
 */

// Core Client & Types
export {
    ApiError,
    apiClient,
    clearTokens,
    getAccessToken,
    getRefreshToken,
    setTokens
} from "./client";
export type { RequestOptions } from "./client";

// All Types - excluding enums to avoid duplicate exports
export * from "./types";

// Domain Services
export { aiService } from "./ai.service";
export { authService } from "./auth.service";
export { budgetService } from "./budget.service";
// chatService is DEPRECATED — use conversations.service.ts instead
export { commentService } from "./comment.service";
export { communicationService } from "./communication.service";
export { dashboardService } from "./dashboard.service";
export { documentService } from "./document.service";
export { laborService } from "./labor.service";
export { notificationService } from "./notification.service";
export { paymentService } from "./payment.service";
export { photoTimelineService } from "./photo-timeline.service";
export { productService } from "./product.service";
export { projectService } from "./project.service";
export { qcService } from "./qc.service";
export { taskService } from "./task.service";
export { timelineService } from "./timeline.service";
export { uploadService } from "./upload.service";
export { userService } from "./user.service";
export { videoService } from "./video.service";

// Labor Service Types
export type {
    BookingRequest,
    BookingResponse,
    CreateLaborProviderDto,
    CreateReviewDto,
    LaborProvider,
    LaborProvidersResponse,
    LaborQuery,
    LaborReview,
    LaborReviewsResponse,
    UpdateLaborProviderDto
} from "./labor.service";

// Default exports
export { default as ai } from "./ai.service";
export { default as auth } from "./auth.service";
export { default as budget } from "./budget.service";
// chat default export is DEPRECATED — use conversations.service.ts instead
export { default as comment } from "./comment.service";
export { default as communication } from "./communication.service";
export { default as dashboard } from "./dashboard.service";
export { default as document } from "./document.service";
export { default as labor } from "./labor.service";
export { default as notification } from "./notification.service";
export { default as payment } from "./payment.service";
export { default as photoTimeline } from "./photo-timeline.service";
export { default as product } from "./product.service";
export { default as project } from "./project.service";
export { default as qc } from "./qc.service";
export { default as task } from "./task.service";
export { default as timeline } from "./timeline.service";
export { default as upload } from "./upload.service";
export { default as user } from "./user.service";
export { default as video } from "./video.service";

// Base Service for extending
export { BaseApiService } from "./base.service";
export type {
    CacheConfig,
    OfflineQueueItem,
    RetryConfig,
    ServiceConfig
} from "./base.service";

