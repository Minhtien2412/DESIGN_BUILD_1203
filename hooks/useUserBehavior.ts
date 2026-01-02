/**
 * React Hook for User Behavior Tracking
 * Tích hợp tracking vào components một cách dễ dàng
 */

import { useCallback, useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

// TODO: Implement user-behavior-tracker module
// import {
//     UserAction,
//     trackFilter,
//     trackItemClick,
//     trackItemView,
//     trackLoadMore,
//     trackPullRefresh,
//     trackScreenView,
//     trackScroll,
//     trackSearch,
//     trackSort,
//     trackSwipe,
//     trackTabSwitch,
//     userBehaviorTracker,
// } from './user-behavior-tracker';

// Temporary stub types
type UserAction = any;
const trackScreenView = (...args: any[]) => {};
const trackScroll = (...args: any[]) => {};
const trackTabSwitch = (...args: any[]) => {};
const trackSearch = (...args: any[]) => {};
const trackFilter = (...args: any[]) => {};
const trackSort = (...args: any[]) => {};
const trackItemView = (...args: any[]) => {};
const trackItemClick = (...args: any[]) => {};
const trackPullRefresh = (...args: any[]) => {};
const trackLoadMore = (...args: any[]) => {};
const trackSwipe = (...args: any[]) => {};
const userBehaviorTracker = { 
  endSession: () => {},
  track: (...args: any[]) => {},
  getSessionAnalytics: () => ({}),
  getUserPatterns: () => ({}),
  exportSessionData: () => ({}),
  clearSession: () => {},
};
const UserActionEnum = {
  SCREEN_VIEW: 'SCREEN_VIEW',
  INPUT_FOCUS: 'INPUT_FOCUS',
  INPUT_BLUR: 'INPUT_BLUR',
  FORM_SUBMIT: 'FORM_SUBMIT',
} as const;

export interface UseUserBehaviorOptions {
  screenName: string;
  enableScrollTracking?: boolean;
  enableTabTracking?: boolean;
  enableAutoScreenView?: boolean;
}

/**
 * Main hook for user behavior tracking
 */
export function useUserBehavior(options: UseUserBehaviorOptions) {
  const { screenName, enableScrollTracking = true, enableTabTracking = true, enableAutoScreenView = true } = options;
  
  const scrollPositionRef = useRef(0);
  const contentHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const previousScreenRef = useRef<string | undefined>(undefined);

  // Track screen view on mount
  useEffect(() => {
    if (enableAutoScreenView) {
      trackScreenView(screenName, previousScreenRef.current);
    }

    return () => {
      previousScreenRef.current = screenName;
    };
  }, [screenName, enableAutoScreenView]);

  /**
   * Handle scroll events with throttling
   */
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!enableScrollTracking) return;

      const now = Date.now();
      // Throttle scroll events to max 1 per 500ms
      if (now - lastScrollTimeRef.current < 500) return;
      
      lastScrollTimeRef.current = now;

      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      
      scrollPositionRef.current = contentOffset.y;
      contentHeightRef.current = contentSize.height;
      viewportHeightRef.current = layoutMeasurement.height;

      trackScroll(
        contentOffset.y,
        screenName,
        contentSize.height,
        layoutMeasurement.height
      );
    },
    [screenName, enableScrollTracking]
  );

  /**
   * Handle tab switch
   */
  const handleTabSwitch = useCallback(
    (fromTab: string, toTab: string, method: 'tap' | 'swipe' = 'tap') => {
      if (!enableTabTracking) return;
      trackTabSwitch(fromTab, toTab, screenName, method);
    },
    [screenName, enableTabTracking]
  );

  /**
   * Handle search
   */
  const handleSearch = useCallback(
    (query: string, resultsCount?: number) => {
      trackSearch(query, screenName, resultsCount);
    },
    [screenName]
  );

  /**
   * Handle filter
   */
  const handleFilter = useCallback(
    (filterType: string, filterValue: any, resultsCount?: number) => {
      trackFilter(filterType, filterValue, screenName, resultsCount);
    },
    [screenName]
  );

  /**
   * Handle sort
   */
  const handleSort = useCallback(
    (sortBy: string, order: 'asc' | 'desc' = 'asc') => {
      trackSort(sortBy, screenName, order);
    },
    [screenName]
  );

  /**
   * Handle item view
   */
  const handleItemView = useCallback(
    (itemId: string, itemType: string, position?: number) => {
      trackItemView(itemId, itemType, screenName, position);
    },
    [screenName]
  );

  /**
   * Handle item click
   */
  const handleItemClick = useCallback(
    (itemId: string, itemType: string, position?: number) => {
      trackItemClick(itemId, itemType, screenName, position);
    },
    [screenName]
  );

  /**
   * Handle pull to refresh
   */
  const handlePullRefresh = useCallback(() => {
    trackPullRefresh(screenName);
  }, [screenName]);

  /**
   * Handle load more
   */
  const handleLoadMore = useCallback(
    (page: number, itemsLoaded: number) => {
      trackLoadMore(screenName, page, itemsLoaded);
    },
    [screenName]
  );

  /**
   * Track custom action
   */
  const trackCustomAction = useCallback(
    (action: UserAction, metadata?: any) => {
      userBehaviorTracker.track(action, screenName, metadata);
    },
    [screenName]
  );

  return {
    // Event handlers
    handleScroll,
    handleTabSwitch,
    handleSearch,
    handleFilter,
    handleSort,
    handleItemView,
    handleItemClick,
    handlePullRefresh,
    handleLoadMore,
    trackCustomAction,
    
    // Scroll state
    scrollPosition: scrollPositionRef.current,
    contentHeight: contentHeightRef.current,
    viewportHeight: viewportHeightRef.current,
  };
}

/**
 * Hook for tracking visible items (impression tracking)
 */
export function useItemVisibilityTracking(
  screenName: string,
  itemType: string
) {
  const viewedItemsRef = useRef<Set<string>>(new Set());

  const trackItemVisibility = useCallback(
    (itemId: string, isVisible: boolean, position?: number) => {
      if (isVisible && !viewedItemsRef.current.has(itemId)) {
        viewedItemsRef.current.add(itemId);
        trackItemView(itemId, itemType, screenName, position);
      }
    },
    [screenName, itemType]
  );

  const resetViewedItems = useCallback(() => {
    viewedItemsRef.current.clear();
  }, []);

  return {
    trackItemVisibility,
    resetViewedItems,
    viewedItemsCount: viewedItemsRef.current.size,
  };
}

/**
 * Hook for tracking time spent on screen
 */
export function useScreenTimeTracking(screenName: string) {
  const startTimeRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const timeSpent = Date.now() - startTimeRef.current;
      totalTimeRef.current += timeSpent;

      userBehaviorTracker.track(UserActionEnum.SCREEN_VIEW, screenName, {
        duration: timeSpent,
        totalDuration: totalTimeRef.current,
      });
    };
  }, [screenName]);

  const getTimeSpent = useCallback(() => {
    return Date.now() - startTimeRef.current;
  }, []);

  return {
    getTimeSpent,
    totalTime: totalTimeRef.current,
  };
}

/**
 * Hook for tracking form interactions
 */
export function useFormTracking(screenName: string, formName: string) {
  const formStartTimeRef = useRef<number>(0);
  const fieldInteractionsRef = useRef<Record<string, number>>({});

  const trackFieldFocus = useCallback(
    (fieldName: string) => {
      formStartTimeRef.current = formStartTimeRef.current || Date.now();
      fieldInteractionsRef.current[fieldName] = 
        (fieldInteractionsRef.current[fieldName] || 0) + 1;

      userBehaviorTracker.track(UserActionEnum.INPUT_FOCUS, screenName, {
        formName,
        fieldName,
        interactionCount: fieldInteractionsRef.current[fieldName],
      });
    },
    [screenName, formName]
  );

  const trackFieldBlur = useCallback(
    (fieldName: string, value?: any) => {
      userBehaviorTracker.track(UserActionEnum.INPUT_BLUR, screenName, {
        formName,
        fieldName,
        hasValue: !!value,
        valueLength: typeof value === 'string' ? value.length : undefined,
      });
    },
    [screenName, formName]
  );

  const trackFormSubmit = useCallback(
    (isSuccess: boolean, errorFields?: string[]) => {
      const timeToSubmit = formStartTimeRef.current 
        ? Date.now() - formStartTimeRef.current 
        : 0;

      userBehaviorTracker.track(UserActionEnum.FORM_SUBMIT, screenName, {
        formName,
        isSuccess,
        timeToSubmit,
        fieldInteractions: fieldInteractionsRef.current,
        errorFields,
      });

      // Reset
      formStartTimeRef.current = 0;
      fieldInteractionsRef.current = {};
    },
    [screenName, formName]
  );

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFormSubmit,
  };
}

/**
 * Hook for tracking gestures (swipe, pinch, etc.)
 */
export function useGestureTracking(screenName: string) {
  const trackSwipeGesture = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down', velocity?: number) => {
      trackSwipe(direction, screenName, velocity);
    },
    [screenName]
  );

  return {
    trackSwipeGesture,
  };
}

/**
 * Hook for analytics summary
 */
export function useAnalyticsSummary() {
  const getAnalytics = useCallback(() => {
    return userBehaviorTracker.getSessionAnalytics();
  }, []);

  const getUserPatterns = useCallback(() => {
    return userBehaviorTracker.getUserPatterns();
  }, []);

  const exportData = useCallback(() => {
    return userBehaviorTracker.exportSessionData();
  }, []);

  const clearData = useCallback(() => {
    userBehaviorTracker.clearSession();
  }, []);

  return {
    getAnalytics,
    getUserPatterns,
    exportData,
    clearData,
  };
}
