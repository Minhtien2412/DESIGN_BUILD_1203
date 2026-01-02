import AsyncStorage from "@react-native-async-storage/async-storage";

// Analytics event types
export type AnalyticsEvent =
  | "screen_view"
  | "category_click"
  | "module_click"
  | "search_query"
  | "navigation_action"
  | "feature_usage"
  | "drawer_open"
  | "favorites_add"
  | "favorites_remove"
  | "recent_view";

// Event data interface
export interface AnalyticsEventData {
  event: AnalyticsEvent;
  timestamp: number;
  properties: Record<string, any>;
  sessionId: string;
}

// Session management
let currentSessionId: string | null = null;
const SESSION_KEY = "@analytics_session";
const EVENTS_KEY = "@analytics_events";
const MAX_EVENTS = 1000;

// Initialize session
export async function initAnalyticsSession(): Promise<string> {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await AsyncStorage.setItem(SESSION_KEY, currentSessionId);
  }
  return currentSessionId;
}

// Get current session
export async function getSessionId(): Promise<string> {
  if (currentSessionId) return currentSessionId;
  
  const stored = await AsyncStorage.getItem(SESSION_KEY);
  if (stored) {
    currentSessionId = stored;
    return stored;
  }
  
  return initAnalyticsSession();
}

// Track event
export async function trackEvent(
  event: AnalyticsEvent,
  properties: Record<string, any> = {}
): Promise<void> {
  try {
    const sessionId = await getSessionId();
    
    const eventData: AnalyticsEventData = {
      event,
      timestamp: Date.now(),
      properties,
      sessionId,
    };

    // Store event locally
    await storeEvent(eventData);

    // In production, send to analytics service
    // await sendToAnalyticsService(eventData);
    
    console.log("📊 Analytics:", event, properties);
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
}

// Store event locally
async function storeEvent(eventData: AnalyticsEventData): Promise<void> {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEventData[] = eventsJson ? JSON.parse(eventsJson) : [];
    
    events.push(eventData);
    
    // Keep only last MAX_EVENTS
    const trimmedEvents = events.slice(-MAX_EVENTS);
    
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(trimmedEvents));
  } catch (error) {
    console.error("Error storing analytics event:", error);
  }
}

// Get stored events
export async function getStoredEvents(): Promise<AnalyticsEventData[]> {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error("Error retrieving analytics events:", error);
    return [];
  }
}

// Clear events
export async function clearAnalyticsEvents(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EVENTS_KEY);
  } catch (error) {
    console.error("Error clearing analytics events:", error);
  }
}

// Track screen view
export function trackScreenView(screenName: string, params?: Record<string, any>) {
  return trackEvent("screen_view", {
    screen_name: screenName,
    ...params,
  });
}

// Track category click
export function trackCategoryClick(categoryId: string, categoryName: string) {
  return trackEvent("category_click", {
    category_id: categoryId,
    category_name: categoryName,
  });
}

// Track module click
export function trackModuleClick(
  moduleId: string,
  moduleName: string,
  categoryId: string
) {
  return trackEvent("module_click", {
    module_id: moduleId,
    module_name: moduleName,
    category_id: categoryId,
  });
}

// Track search query
export function trackSearchQuery(query: string, resultsCount: number) {
  return trackEvent("search_query", {
    query,
    results_count: resultsCount,
  });
}

// Track navigation action
export function trackNavigationAction(
  action: "back" | "forward" | "drawer" | "tab" | "link",
  destination?: string
) {
  return trackEvent("navigation_action", {
    action,
    destination,
  });
}

// Track navigation (wrapper for route navigation)
export function trackNavigation(
  route: string,
  metadata?: { category?: string; layer?: number; sessionId?: string }
) {
  return trackEvent("navigation_action", {
    action: "link",
    destination: route,
    category: metadata?.category,
    layer: metadata?.layer,
  });
}

// Track feature usage
export function trackFeatureUsage(featureName: string, properties?: Record<string, any>) {
  return trackEvent("feature_usage", {
    feature_name: featureName,
    ...properties,
  });
}

// Track drawer open
export function trackDrawerOpen(source: "menu_button" | "swipe" | "other") {
  return trackEvent("drawer_open", {
    source,
  });
}

// Track favorites
export function trackFavoritesAdd(itemId: string, itemType: string) {
  return trackEvent("favorites_add", {
    item_id: itemId,
    item_type: itemType,
  });
}

export function trackFavoritesRemove(itemId: string, itemType: string) {
  return trackEvent("favorites_remove", {
    item_id: itemId,
    item_type: itemType,
  });
}

// Track recent view
export function trackRecentView(itemId: string, itemName: string, itemType: string) {
  return trackEvent("recent_view", {
    item_id: itemId,
    item_name: itemName,
    item_type: itemType,
  });
}

// Get analytics summary
export async function getAnalyticsSummary(): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  topScreens: Array<{ screen: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  searchQueries: Array<{ query: string; count: number }>;
}> {
  const events = await getStoredEvents();
  
  const eventsByType: Record<string, number> = {};
  const screenCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const searchCounts: Record<string, number> = {};
  
  events.forEach((event) => {
    // Count by type
    eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
    
    // Count screens
    if (event.event === "screen_view" && event.properties.screen_name) {
      const screen = event.properties.screen_name;
      screenCounts[screen] = (screenCounts[screen] || 0) + 1;
    }
    
    // Count categories
    if (event.event === "category_click" && event.properties.category_name) {
      const category = event.properties.category_name;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    
    // Count searches
    if (event.event === "search_query" && event.properties.query) {
      const query = event.properties.query;
      searchCounts[query] = (searchCounts[query] || 0) + 1;
    }
  });
  
  // Sort and get top items
  const topScreens = Object.entries(screenCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([screen, count]) => ({ screen, count }));
  
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }));
  
  const searchQueries = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
  
  return {
    totalEvents: events.length,
    eventsByType,
    topScreens,
    topCategories,
    searchQueries,
  };
}
