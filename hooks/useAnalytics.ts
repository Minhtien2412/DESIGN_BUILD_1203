import {
    trackCategoryClick,
    trackDrawerOpen,
    trackFavoritesAdd,
    trackFavoritesRemove,
    trackFeatureUsage,
    trackModuleClick,
    trackNavigationAction,
    trackRecentView,
    trackScreenView,
    trackSearchQuery,
} from "@/utils/analytics";
import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";

/**
 * Hook to automatically track screen views
 */
export function useScreenTracking() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== previousPath.current) {
      // Extract screen name from path
      const screenName = pathname === "/" ? "home" : pathname.replace(/^\//, "");
      
      trackScreenView(screenName, {
        path: pathname,
        previous_path: previousPath.current,
      });

      previousPath.current = pathname;
    }
  }, [pathname]);
}

/**
 * Hook to provide analytics tracking functions
 */
export function useAnalytics() {
  return {
    // Screen tracking
    trackScreen: (screenName: string, params?: Record<string, any>) => {
      trackScreenView(screenName, params);
    },

    // Category tracking
    trackCategory: (categoryId: string, categoryName: string) => {
      trackCategoryClick(categoryId, categoryName);
    },

    // Module tracking
    trackModule: (moduleId: string, moduleName: string, categoryId: string) => {
      trackModuleClick(moduleId, moduleName, categoryId);
    },

    // Search tracking
    trackSearch: (query: string, resultsCount: number) => {
      trackSearchQuery(query, resultsCount);
    },

    // Navigation tracking
    trackNavigation: (
      action: "back" | "forward" | "drawer" | "tab" | "link",
      destination?: string
    ) => {
      trackNavigationAction(action, destination);
    },

    // Feature tracking
    trackFeature: (featureName: string, properties?: Record<string, any>) => {
      trackFeatureUsage(featureName, properties);
    },

    // Drawer tracking
    trackDrawer: (source: "menu_button" | "swipe" | "other") => {
      trackDrawerOpen(source);
    },

    // Favorites tracking
    trackFavoriteAdd: (itemId: string, itemType: string) => {
      trackFavoritesAdd(itemId, itemType);
    },

    trackFavoriteRemove: (itemId: string, itemType: string) => {
      trackFavoritesRemove(itemId, itemType);
    },

    // Recent view tracking
    trackRecent: (itemId: string, itemName: string, itemType: string) => {
      trackRecentView(itemId, itemName, itemType);
    },
  };
}

/**
 * Hook to track component mount/unmount
 */
export function useComponentTracking(componentName: string) {
  useEffect(() => {
    trackFeatureUsage(`${componentName}_mount`);

    return () => {
      trackFeatureUsage(`${componentName}_unmount`);
    };
  }, [componentName]);
}

/**
 * Hook to track user interactions
 */
export function useInteractionTracking() {
  const trackClick = (elementName: string, properties?: Record<string, any>) => {
    trackFeatureUsage("click", {
      element: elementName,
      ...properties,
    });
  };

  const trackPress = (buttonName: string, properties?: Record<string, any>) => {
    trackFeatureUsage("press", {
      button: buttonName,
      ...properties,
    });
  };

  const trackScroll = (screenName: string, position: number) => {
    trackFeatureUsage("scroll", {
      screen: screenName,
      position,
    });
  };

  return {
    trackClick,
    trackPress,
    trackScroll,
  };
}
