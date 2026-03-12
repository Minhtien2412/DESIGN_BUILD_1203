/**
 * Features Index - Export all main screens
 * Consolidates duplicate screens and exports the latest versions
 * @updated 2026-01-24
 */

// ============================================================================
// PROFILE
// ============================================================================
// Use Premium version (luxury glassmorphism, animated header, BE integration)
export {
    default as ProfileScreen,
    default as ProfileScreenPremium
} from "./profile/ProfileScreenPremium";
// Keep older versions for backward compatibility
export { default as ProfileScreenEuropean } from "./profile/ProfileScreenEuropean";
export { default as ProfileScreenModernized } from "./profile/ProfileScreenModernized";
export { default as ProfileScreenRedesigned } from "./profile/ProfileScreenRedesigned";

// ============================================================================
// PROJECTS
// ============================================================================
// Use Modernized (Nordic Green Theme) as default
export {
    default as ProjectsScreen,
    default as ProjectsScreenModernized
} from "./projects/ProjectsScreenModernized";
// Keep Modern for backward compatibility
export { default as ProjectsHubScreen } from "./projects/ProjectsHubScreen";
export { default as ProjectsScreenModern } from "./projects/ProjectsScreenModern";

// ============================================================================
// NOTIFICATIONS
// ============================================================================
// Use Unified as default (has CRM sync, messages/calls tabs)
export {
    default as NotificationsScreen,
    default as UnifiedNotificationsScreen
} from "./notifications/UnifiedNotificationsScreen";
// Keep Modernized for backward compatibility
export { default as NotificationsScreenModernized } from "./notifications/NotificationsScreenModernized";

// ============================================================================
// CHAT / MESSAGES
// ============================================================================
export {
    default as MessagesScreen,
    default as ModernMessagesScreen
} from "./chat/ModernMessagesScreen";

// ============================================================================
// CALL
// ============================================================================
// Use Premium as default (has ringtones, hold music, AI features)
export {
    default as CallScreen,
    default as PremiumCallScreen
} from "./call/PremiumCallScreen";
export { default as SimpleCallScreen } from "./call/SimpleCallScreen";

// ============================================================================
// AI
// ============================================================================
export { default as AIAssistantScreen } from "./ai-assistant/AIAssistantScreen";

// ============================================================================
// SEARCH
// ============================================================================
export { default as AISearchScreen } from "./search/AISearchScreen";
export { default as SearchResultsScreen } from "./search/SearchResultsScreen";

// ============================================================================
// SETTINGS
// ============================================================================
export { default as APIStatusScreen } from "./settings/APIStatusScreen";
export { default as PermissionsScreen } from "./settings/PermissionsScreen";
export { default as SoundSettingsScreen } from "./settings/SoundSettingsScreen";

// ============================================================================
// GALLERY / VIDEOS
// ============================================================================
export { default as PexelsGalleryScreen } from "./gallery/PexelsGalleryScreen";
export { default as DemoVideosScreen } from "./videos/DemoVideosScreen";

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================
// Types
export type {
    BannerItem,
    CategoryItem,
    HomeDataResponse,
    LiveStreamItem,
    ServiceItem,
    VideoItem,
    WorkerItem
} from "../services/homeDataService";

// Home data service functions
export {
    fetchBanners,
    fetchConstructionWorkers,
    fetchDesignServices,
    fetchEquipment,
    fetchFeaturedCategories,
    fetchFeaturedVideos,
    fetchFinishingWorkers,
    fetchHomeData,
    fetchLibraryCategories,
    fetchLiveStreams,
    fetchServices,
    mergeWithFallback,
    transformServiceItem
} from "../services/homeDataService";

