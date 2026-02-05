/**
 * Shared Module Index
 * =====================
 *
 * Tập trung tất cả shared utilities, hooks, stores và components
 * để dễ dàng import và tái sử dụng trong toàn bộ ứng dụng.
 *
 * Usage:
 * ```typescript
 * import { deviceUtils, formatVND, useOnlineStatus, PerformantList, haptic, copyToClipboard } from '@/shared';
 * ```
 */

// ============================================
// UTILITIES
// ============================================

// Device utilities
export {
    deviceUtils,
    getAppInfo,
    getBatteryInfo,
    getBrightness,
    getDeviceInfo,
    getNetworkInfo,
    getSystemBrightness,
    getTotalMemoryGB,
    isAndroid,
    isCellular,
    isIOS,
    isLowEndDevice,
    isOnline,
    isPhone,
    isRealDevice,
    isTablet,
    isWeb,
    isWifi,
    platformSelect,
    setBrightness,
    subscribeToBatteryLevel,
    subscribeToBatteryState,
    useSystemBrightness
} from "./utils/deviceUtils";
export type {
    AppInfo,
    BatteryInfo,
    DeviceInfo,
    NetworkInfo
} from "./utils/deviceUtils";

// Localization utilities
export {
    commonTranslations,
    createTranslator,
    formatCurrency,
    formatDate,
    formatDateLong,
    formatDateShort,
    formatDateTime,
    formatNumber,
    formatPercent,
    formatRelativeTime,
    formatTime,
    formatVND,
    getCurrencyCode,
    getLanguageCode,
    getLocaleInfo,
    getRegionCode,
    getTimezone,
    isRTL,
    localizationUtils,
    translate,
    uses24HourClock
} from "./utils/localizationUtils";
export type {
    LocaleInfo,
    SupportedLanguage,
    TranslationMap
} from "./utils/localizationUtils";

// Store review utilities
export {
    getReviewStats,
    hasReviewed,
    isReviewAvailable,
    markAsReviewed,
    maybeRequestReview,
    openStorePage,
    requestReview,
    resetReviewState,
    shouldRequestReview,
    storeReviewUtils,
    trackAppOpen,
    trackSignificantEvent
} from "./utils/storeReviewUtils";
export type { ReviewConfig, ReviewState } from "./utils/storeReviewUtils";

// Haptic feedback utilities
export {
    buttonPress, deleteAction, errorNotification, formSubmit, haptic, hapticUtils, heavyImpact, lightImpact, longPress, mediumImpact, pullToRefresh, purchaseComplete, selectionFeedback, successNotification, swipeAction, tabChange, warningNotification
} from "./utils/hapticUtils";
export type { HapticPreset, HapticStyle } from "./utils/hapticUtils";

// Clipboard utilities
export {
    clipboardUtils, copyEmail, copyJson, copyPhoneNumber, copyPrice, copyToClipboard, copyUrl, getFromClipboard,
    hasClipboardContent
} from "./utils/clipboardUtils";

// Share utilities
export {
    isFileSharingAvailable, shareAppInvite, shareFile,
    shareImage,
    sharePdf, shareProduct,
    shareProject, shareText,
    shareUrl, shareUtils, shareVideo
} from "./utils/shareUtils";
export type { ShareFileOptions, ShareResult } from "./utils/shareUtils";

// Permission utilities
export {
    checkBackgroundLocationPermission, checkCameraPermission, checkContactsPermission,
    checkLocationPermission, checkMediaLibraryPermission, checkMicrophonePermission, checkNotificationPermission, checkPermission, checkPermissions, checkPhotosPermission, getPermissionLabel, openSettings, permissionLabels, permissionUtils, requestBackgroundLocationPermission, requestCameraPermission, requestContactsPermission,
    requestLocationPermission, requestMediaLibraryPermission, requestMicrophonePermission, requestNotificationPermission, requestPermission, requestPermissions, requestPhotosPermission, showPermissionDeniedAlert
} from "./utils/permissionUtils";
export type {
    PermissionResult, PermissionStatus, PermissionType
} from "./utils/permissionUtils";

// Validation utilities
export {
    getFirstError, isEmpty, isFormValid, validateAge, validateCCCD,
    validateCMND, validateDate, validateEmail, validateField,
    validateForm, validateFutureDate, validateInteger, validateIsNumber, validateLengthRange, validateMax, validateMaxLength, validateMin, validateMinLength, validatePassword,
    validatePasswordMatch, validatePastDate, validatePhone, validatePositive, validateRange, validateRequired, validateTaxId,
    validateUrl, validateVietnamesePhone, validationUtils
} from "./utils/validationUtils";
export type {
    FieldValidation, ValidationResult,
    ValidationRule
} from "./utils/validationUtils";

// Date/Time utilities
export {
    addDays, addHours,
    addMinutes, addMonths,
    addYears, dateUtils, diffDetailed, diffInDays,
    diffInHours,
    diffInMinutes, endOfDay, endOfMonth, formatCountdown, formatDateFull, formatDateISO, formatDateTimeVN, formatDateVN, formatDayOfWeek, formatMonthYear, formatTimeFull, getCountdownTo, getRelativeTime,
    getSmartTime, isFuture, isPast, isSameDay, isThisMonth, isThisWeek, isThisYear, isToday, isTomorrow, isYesterday, parseDate, startOfDay, startOfMonth
} from "./utils/dateUtils";
export type { DateInput, TimeComponents } from "./utils/dateUtils";

// ============================================
// HOOKS
// ============================================

// Device hooks
export {
    deviceHooks,
    useAdaptiveQuality,
    useAppInfo,
    useBattery,
    useConnectionType,
    useDeviceInfo,
    useDeviceStatus,
    useIsCharging,
    useLowBattery,
    useLowEndDevice,
    useNetwork,
    useOnlineStatus,
    useShouldLoadMedia
} from "./hooks/deviceHooks";

// Optimized hooks
export {
    useCacheManager,
    useDebounce,
    useIntersectionObserver,
    useLocalStorage,
    usePaymentMutations,
    usePerformanceMonitor,
    usePrevious,
    useProjectDashboard,
    useProjectPayments,
    useProjectTasks,
    useTaskMutations
} from "./hooks/optimizedHooks";

// ============================================
// STORES
// ============================================

export {
    GlobalProvider,
    useCurrentProject,
    useCurrentUser,
    useGlobalState,
    useLoadingState,
    useNotifications,
    useProjectPayments as useStoreProjectPayments,
    useProjectTasks as useStoreProjectTasks,
    useUserPermissions
} from "./stores/globalStore";

// ============================================
// COMPONENTS
// ============================================

export { PerformantList } from "./components";
export type { PerformantListProps } from "./components";

