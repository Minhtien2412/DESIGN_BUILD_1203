// Services barrel - Consolidated exports
export * from './api';
export * from './auth';
export * from './bids';
export * from './categoryPosts';
export * from './cloud';
export * from './demoUsers';
export {
    captureAndUploadConstructionPhoto, deleteUploadedFile,
    getFileInfo, pickAndUploadDocument, uploadAvatar as uploadAvatarFile, uploadMultipleFiles, type UploadProgress,
    type UploadResult, type UploadType
} from './fileUpload';
export * from './metrics';
export * from './notifications';
export * from './payments';
export * from './permissions';
export * from './posts';
// Explicitly export from profile avoiding conflicts with profileApi
export {
    getAvatarUrlFor, getProfile as getProfileLocal,
    saveProfile, type UserProfileDetails
} from './profile';
export * from './profileApi';
export * from './projects';
export * from './remoteAuth';
export * from './search';
export * from './servicesApi';
export * from './social';
export * from './userGroups';
export * from './userProfile';

// Re-export from api/ folder
export { callService } from './api/call.service';
export { chatService } from './api/chat.service';
export { liveStreamService } from './api/livestream.service';
export { default as messagesApi } from './api/messagesApi';

// Chat services with real API integration
export { chatAPIService } from './chatAPIService';
export { default as ChatService } from './ChatService';
export type {
    Attachment, ChatMessage, ChatParticipant, ChatRoom, MessageReaction, MessageStatus, MessageType, TypingStatus
} from './ChatService';

// Notification Sync Services
export { NotificationRealtimeService, default as notificationRealtimeService } from './notificationRealtimeService';
export { NotificationSyncService, default as notificationSyncService } from './notificationSyncService';
export type { CRMActivity, CRMTask, CRMTicket, SyncResult, UnifiedNotification } from './notificationSyncService';

