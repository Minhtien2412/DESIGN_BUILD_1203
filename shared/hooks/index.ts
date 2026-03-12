/**
 * Shared Hooks Index
 * Export tất cả hooks để dễ dàng import
 */

// Device hooks
export {
    default as deviceHooks, useAdaptiveQuality, useAppInfo,
    useBattery, useConnectionType, useDeviceInfo, useDeviceStatus, useIsCharging, useLowBattery, useLowEndDevice, useNetwork,
    useOnlineStatus, useShouldLoadMedia
} from "./deviceHooks";

// Optimized hooks (existing)
export {
    useCacheManager, useDebounce, useIntersectionObserver,
    useLocalStorage, usePaymentMutations, usePerformanceMonitor, usePrevious, useProjectDashboard, useProjectPayments, useProjectTasks, useTaskMutations
} from "./optimizedHooks";

