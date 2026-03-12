/**
 * Shared Utilities Index
 * Export tất cả utilities để dễ dàng import
 */

// Device utilities
export {
    default as deviceUtils,
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
} from "./deviceUtils";
export type {
    AppInfo,
    BatteryInfo,
    DeviceInfo,
    NetworkInfo
} from "./deviceUtils";

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
    default as localizationUtils,
    translate,
    uses24HourClock
} from "./localizationUtils";
export type {
    LocaleInfo,
    SupportedLanguage,
    TranslationMap
} from "./localizationUtils";

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
    default as storeReviewUtils,
    trackAppOpen,
    trackSignificantEvent
} from "./storeReviewUtils";
export type { ReviewConfig, ReviewState } from "./storeReviewUtils";

// Haptic feedback utilities
export {
    buttonPress, deleteAction, errorNotification, formSubmit, haptic, default as hapticUtils, heavyImpact, lightImpact, longPress, mediumImpact, pullToRefresh, purchaseComplete, selectionFeedback, successNotification, swipeAction, tabChange, warningNotification
} from "./hapticUtils";
export type { HapticPreset, HapticStyle } from "./hapticUtils";

// Clipboard utilities
export {
    default as clipboardUtils, copyEmail, copyJson, copyPhoneNumber, copyPrice, copyToClipboard, copyUrl, getFromClipboard,
    hasClipboardContent
} from "./clipboardUtils";

// Share utilities
export {
    isFileSharingAvailable, shareAppInvite, shareFile,
    shareImage,
    sharePdf, shareProduct,
    shareProject, shareText,
    shareUrl, default as shareUtils, shareVideo
} from "./shareUtils";
export type { ShareFileOptions, ShareResult } from "./shareUtils";

// Permission utilities
export {
    checkBackgroundLocationPermission, checkCameraPermission, checkContactsPermission,
    checkLocationPermission, checkMediaLibraryPermission, checkMicrophonePermission, checkNotificationPermission, checkPermission, checkPermissions, checkPhotosPermission, getPermissionLabel, openSettings, permissionLabels, default as permissionUtils, requestBackgroundLocationPermission, requestCameraPermission, requestContactsPermission,
    requestLocationPermission, requestMediaLibraryPermission, requestMicrophonePermission, requestNotificationPermission, requestPermission, requestPermissions, requestPhotosPermission, showPermissionDeniedAlert
} from "./permissionUtils";
export type {
    PermissionResult, PermissionStatus, PermissionType
} from "./permissionUtils";

// Validation utilities
export {
    getFirstError, isEmpty, isFormValid, validateAge, validateCCCD,
    validateCMND, validateDate as validateDateInput, validateEmail, validateField,
    validateForm, validateFutureDate, validateInteger, validateIsNumber, validateLengthRange, validateMax, validateMaxLength, validateMin, validateMinLength, validatePassword,
    validatePasswordMatch, validatePastDate, validatePhone, validatePositive, validateRange, validateRequired, validateTaxId,
    validateUrl, validateVietnamesePhone, default as validationUtils
} from "./validationUtils";
export type {
    FieldValidation, ValidationResult,
    ValidationRule
} from "./validationUtils";

// Date/Time utilities
export {
    addDays, addHours,
    addMinutes, addMonths,
    addYears, default as dateUtils, diffDetailed, diffInDays,
    diffInHours,
    diffInMinutes, endOfDay, endOfMonth, formatCountdown, formatDateFull, formatDateISO, formatDateTimeVN, formatDateVN, formatDayOfWeek, formatMonthYear, formatTimeFull, getCountdownTo, getRelativeTime,
    getSmartTime, isFuture, isPast, isSameDay, isThisMonth, isThisWeek, isThisYear, isToday, isTomorrow, isYesterday, parseDate, startOfDay, startOfMonth
} from "./dateUtils";
export type { DateInput, TimeComponents } from "./dateUtils";

