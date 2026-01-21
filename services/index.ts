// Services barrel - Consolidated exports
export * from "./api";
export * from "./auth";
export * from "./bids";
export * from "./categoryPosts";
export * from "./cloud";
export * from "./demoUsers";
export {
    captureAndUploadConstructionPhoto,
    deleteUploadedFile,
    getFileInfo,
    pickAndUploadDocument,
    uploadAvatar as uploadAvatarFile,
    uploadMultipleFiles,
    type UploadProgress,
    type UploadResult,
    type UploadType
} from "./fileUpload";
export * from "./metrics";
export * from "./notifications";
// Skip payments to avoid PaymentMethod conflict - use paymentService instead
// export * from "./payments";
export {
    addPaymentMethod,
    deletePaymentMethod,
    listPaymentMethods,
    setPrimaryPaymentMethod,
    togglePaymentMethodEnabled,
    updatePaymentMethod,
    type CreatePaymentMethodInput, // Rename to avoid conflict
    type PaymentMethodType,
    type PaymentMethod as PaymentsPaymentMethod,
    type UpdatePaymentMethodInput
} from "./payments";
export * from "./permissions";
export * from "./posts";
// Explicitly export from profile avoiding conflicts with profileApi
export {
    getAvatarUrlFor,
    getProfile as getProfileLocal,
    saveProfile,
    type UserProfileDetails
} from "./profile";
export * from "./profileApi";
export * from "./projects";
export * from "./remoteAuth";
export * from "./search";
export * from "./servicesApi";
export * from "./social";
export * from "./userGroups";
export * from "./userProfile";

// Re-export from api/ folder
export { callService } from "./api/call.service";
export { chatService } from "./api/chat.service";
export { liveStreamService } from "./api/livestream.service";
export { default as messagesApi } from "./api/messagesApi";

// Chat services with real API integration
export { chatAPIService } from "./chatAPIService";
export { default as ChatService } from "./ChatService";
export type {
    Attachment,
    ChatMessage,
    ChatParticipant,
    ChatRoom,
    Reaction as MessageReaction,
    MessageStatus,
    MessageType,
    TypingStatus
} from "./ChatService";

// Notification Sync Services
export {
    NotificationRealtimeService,
    default as notificationRealtimeService
} from "./notificationRealtimeService";
export {
    NotificationSyncService,
    default as notificationSyncService
} from "./notificationSyncService";
export type {
    CRMActivity,
    CRMTask,
    CRMTicket,
    SyncResult,
    UnifiedNotification
} from "./notificationSyncService";

// Notification Navigator for deep linking
export {
    getNotificationIcon,
    handleNotificationItemPress,
    handleNotificationTap,
    navigateAndShowEvent,
    navigateToNotification,
    default as notificationNavigator,
    showEventDetails
} from "./notificationNavigator";
export type {
    NavigationResult,
    NotificationData
} from "./notificationNavigator";

// Weather API Service
export {
    WEATHER_ICONS,
    getCurrentWeather,
    getForecast,
    getHourlyForecast,
    getWeather,
    getWeatherByCity,
    getWeatherEmoji,
    default as weatherApi
} from "./weatherApi";
export type {
    CurrentWeather,
    DailyForecast,
    HourlyForecast,
    WeatherAlert,
    WeatherData,
    WeatherLocation
} from "./weatherApi";

// News API Service
export {
    NEWS_CATEGORIES,
    NEWS_CATEGORY_LABELS,
    getConstructionNews,
    getNews,
    getNewsByCategories,
    getRealEstateNews,
    getTopHeadlines,
    default as newsApi,
    searchNews
} from "./newsApi";
export type {
    NewsArticle,
    NewsCategory,
    NewsQuery,
    NewsResponse
} from "./newsApi";

// OTP Service
export {
    canSendOTP,
    maskEmail,
    maskPhoneNumber,
    default as otpService,
    resendOTP,
    sendOTP,
    verifyOTP
} from "./otpService";
export type {
    OTPChannel,
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse
} from "./otpService";

// Payment Service
export {
    checkPaymentStatus,
    createPayment,
    formatCurrency,
    getAvailablePaymentMethods,
    default as paymentService,
    processPaymentCallback
} from "./paymentService";
export type {
    PaymentMethod,
    PaymentOrder,
    PaymentProvider,
    PaymentResult,
    PaymentStatus
} from "./paymentService";

// AI Services
export { geminiAI } from "./geminiAI";
export { OpenAIService, default as openAI } from "./openAI";

// Currency Service
export {
    CurrencyService,
    convertCurrency,
    default as currencyService,
    formatUSD,
    formatVND,
    getUSDtoVNDRate,
    usdToVND,
    vndToUSD
} from "./currencyService";

// External APIs
export {
    apiStatusChecker,
    exchangeRateService,
    externalAPIs,
    pineconeService
} from "./externalAPIs";

// Error Monitoring
export { SentryService, default as sentryService } from "./sentryService";

// Push Notification Service
export {
    PushNotificationService,
    broadcastSystemNotification,
    sendBulkExpoPushNotifications,
    sendExpoPushNotification,
    sendFCMNotification,
    sendFCMToTopic,
    sendNewsNotification,
    sendPaymentNotification,
    sendProjectUpdateNotification,
    sendTaskAssignedNotification,
    setupNotificationChannels
} from "./pushNotificationService";

// Perfex CRM Notification Service
export {
    PerfexNotificationService,
    fetchActivities as fetchCrmActivities,
    fetchNotifications as fetchCrmNotifications,
    fetchProjectUpdates as fetchCrmProjectUpdates,
    fetchTaskUpdates as fetchCrmTaskUpdates,
    fetchNewNotifications as fetchNewCrmNotifications,
    handleCrmWebhook,
    isPollingActive,
    markAllNotificationsAsRead as markAllCrmNotificationsAsRead,
    markNotificationAsRead as markCrmNotificationAsRead,
    startNotificationPolling,
    stopNotificationPolling
} from "./perfexNotificationService";
export type {
    PerfexActivity,
    PerfexNotification,
    PerfexNotificationType
} from "./perfexNotificationService";

// News Service (with push integration)
export {
    NewsService,
    cacheNews,
    createNewsAndNotify,
    fetchBreakingNews,
    fetchNews,
    fetchNewsDetail,
    getCachedNews,
    markNewsAsRead
} from "./newsService";
export type {
    NewsItem,
    NewsCategory as NewsServiceCategory
} from "./newsService";

// Construction Image Service
export {
    ConstructionImageService,
    DEFAULT_PROJECT_IMAGES,
    fetchProjectImages,
    getImageWithFallback,
    getImageWithFallbackAsync,
    getProjectImage,
    getProjectImages,
    isValidImageUrl,
    preloadProjectImages
} from "./constructionImageService";
export type { ProjectType as ConstructionProjectType } from "./constructionImageService";

// Zalo Auth Service
export {
    ZaloAuthService,
    isRunningInZaloMiniApp,
    openZaloOA,
    refreshZaloToken,
    shareToZalo,
    signInWithZalo
} from "./zaloAuthService";
export type {
    ZaloAuthResult,
    ZaloTokenResponse,
    ZaloUser
} from "./zaloAuthService";

