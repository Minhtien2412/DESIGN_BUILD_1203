/**
 * User Behavior Tracking System
 * Theo dõi và phân tích hành vi người dùng một cách có hệ thống
 */

export enum UserAction {
  // Navigation Actions
  TAB_SWITCH = 'TAB_SWITCH',
  SCREEN_VIEW = 'SCREEN_VIEW',
  SCROLL = 'SCROLL',
  SWIPE = 'SWIPE',
  
  // Interaction Actions
  BUTTON_PRESS = 'BUTTON_PRESS',
  SEARCH = 'SEARCH',
  FILTER = 'FILTER',
  SORT = 'SORT',
  
  // Content Actions
  ITEM_VIEW = 'ITEM_VIEW',
  ITEM_CLICK = 'ITEM_CLICK',
  EXPAND = 'EXPAND',
  COLLAPSE = 'COLLAPSE',
  
  // Form Actions
  INPUT_FOCUS = 'INPUT_FOCUS',
  INPUT_BLUR = 'INPUT_BLUR',
  FORM_SUBMIT = 'FORM_SUBMIT',
  
  // Other Actions
  PULL_REFRESH = 'PULL_REFRESH',
  LOAD_MORE = 'LOAD_MORE',
  ERROR = 'ERROR',
}

export interface UserBehaviorEvent {
  id: string;
  action: UserAction;
  timestamp: number;
  screen: string;
  metadata?: {
    tabName?: string;
    previousTab?: string;
    scrollPosition?: number;
    scrollDirection?: 'up' | 'down';
    searchQuery?: string;
    filterType?: string;
    sortBy?: string;
    itemId?: string;
    itemType?: string;
    duration?: number;
    error?: string;
    [key: string]: any;
  };
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  events: UserBehaviorEvent[];
  totalScrollDistance?: number;
  tabSwitches?: number;
  interactions?: number;
}

class UserBehaviorTracker {
  private static instance: UserBehaviorTracker;
  private currentSession: UserSession | null = null;
  private events: UserBehaviorEvent[] = [];
  private sessionStartTime: number = 0;
  private lastScrollPosition: number = 0;
  private lastTabName: string = '';

  private constructor() {
    this.initSession();
  }

  static getInstance(): UserBehaviorTracker {
    if (!UserBehaviorTracker.instance) {
      UserBehaviorTracker.instance = new UserBehaviorTracker();
    }
    return UserBehaviorTracker.instance;
  }

  private initSession(): void {
    this.sessionStartTime = Date.now();
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: this.sessionStartTime,
      events: [],
      totalScrollDistance: 0,
      tabSwitches: 0,
      interactions: 0,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track generic user action
   */
  track(action: UserAction, screen: string, metadata?: any): void {
    const event: UserBehaviorEvent = {
      id: this.generateEventId(),
      action,
      timestamp: Date.now(),
      screen,
      metadata,
    };

    this.events.push(event);
    if (this.currentSession) {
      this.currentSession.events.push(event);
      this.currentSession.interactions = (this.currentSession.interactions || 0) + 1;
    }

    // Console log for debugging (remove in production)
    if (__DEV__) {
      console.log('📊 User Behavior:', {
        action,
        screen,
        metadata,
      });
    }
  }

  /**
   * Track tab switch with transition details
   */
  trackTabSwitch(fromTab: string, toTab: string, screen: string, method: 'tap' | 'swipe' = 'tap'): void {
    this.track(UserAction.TAB_SWITCH, screen, {
      tabName: toTab,
      previousTab: fromTab,
      method,
      sessionDuration: Date.now() - this.sessionStartTime,
    });

    if (this.currentSession) {
      this.currentSession.tabSwitches = (this.currentSession.tabSwitches || 0) + 1;
    }

    this.lastTabName = toTab;
  }

  /**
   * Track scroll behavior
   */
  trackScroll(
    scrollPosition: number,
    screen: string,
    contentHeight: number,
    viewportHeight: number
  ): void {
    const direction = scrollPosition > this.lastScrollPosition ? 'down' : 'up';
    const scrollPercentage = (scrollPosition / (contentHeight - viewportHeight)) * 100;
    const scrollDistance = Math.abs(scrollPosition - this.lastScrollPosition);

    this.track(UserAction.SCROLL, screen, {
      scrollPosition,
      scrollDirection: direction,
      scrollPercentage: Math.min(100, Math.max(0, scrollPercentage)),
      scrollDistance,
    });

    if (this.currentSession) {
      this.currentSession.totalScrollDistance = 
        (this.currentSession.totalScrollDistance || 0) + scrollDistance;
    }

    this.lastScrollPosition = scrollPosition;
  }

  /**
   * Track swipe gesture
   */
  trackSwipe(direction: 'left' | 'right' | 'up' | 'down', screen: string, velocity?: number): void {
    this.track(UserAction.SWIPE, screen, {
      swipeDirection: direction,
      velocity,
    });
  }

  /**
   * Track search behavior
   */
  trackSearch(query: string, screen: string, resultsCount?: number): void {
    this.track(UserAction.SEARCH, screen, {
      searchQuery: query,
      queryLength: query.length,
      resultsCount,
    });
  }

  /**
   * Track filter usage
   */
  trackFilter(filterType: string, filterValue: any, screen: string, resultsCount?: number): void {
    this.track(UserAction.FILTER, screen, {
      filterType,
      filterValue,
      resultsCount,
    });
  }

  /**
   * Track sort action
   */
  trackSort(sortBy: string, screen: string, order: 'asc' | 'desc' = 'asc'): void {
    this.track(UserAction.SORT, screen, {
      sortBy,
      sortOrder: order,
    });
  }

  /**
   * Track item view (impression)
   */
  trackItemView(itemId: string, itemType: string, screen: string, position?: number): void {
    this.track(UserAction.ITEM_VIEW, screen, {
      itemId,
      itemType,
      position,
    });
  }

  /**
   * Track item click
   */
  trackItemClick(itemId: string, itemType: string, screen: string, position?: number): void {
    this.track(UserAction.ITEM_CLICK, screen, {
      itemId,
      itemType,
      position,
    });
  }

  /**
   * Track screen view with duration
   */
  trackScreenView(screen: string, previousScreen?: string): void {
    this.track(UserAction.SCREEN_VIEW, screen, {
      previousScreen,
      timestamp: Date.now(),
    });
  }

  /**
   * Track pull to refresh
   */
  trackPullRefresh(screen: string): void {
    this.track(UserAction.PULL_REFRESH, screen, {
      timestamp: Date.now(),
    });
  }

  /**
   * Track load more (pagination)
   */
  trackLoadMore(screen: string, page: number, itemsLoaded: number): void {
    this.track(UserAction.LOAD_MORE, screen, {
      page,
      itemsLoaded,
    });
  }

  /**
   * Track error
   */
  trackError(error: string, screen: string, context?: any): void {
    this.track(UserAction.ERROR, screen, {
      error,
      context,
    });
  }

  /**
   * Get session analytics
   */
  getSessionAnalytics(): {
    duration: number;
    totalEvents: number;
    tabSwitches: number;
    totalScrollDistance: number;
    interactions: number;
    topActions: { action: string; count: number }[];
  } {
    if (!this.currentSession) {
      return {
        duration: 0,
        totalEvents: 0,
        tabSwitches: 0,
        totalScrollDistance: 0,
        interactions: 0,
        topActions: [],
      };
    }

    const duration = Date.now() - this.currentSession.startTime;
    const actionCounts: Record<string, number> = {};

    this.currentSession.events.forEach((event) => {
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
    });

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      duration,
      totalEvents: this.currentSession.events.length,
      tabSwitches: this.currentSession.tabSwitches || 0,
      totalScrollDistance: this.currentSession.totalScrollDistance || 0,
      interactions: this.currentSession.interactions || 0,
      topActions,
    };
  }

  /**
   * Get user behavior patterns
   */
  getUserPatterns(): {
    averageSessionDuration: number;
    mostUsedActions: string[];
    averageScrollDistance: number;
    tabSwitchFrequency: number;
  } {
    const analytics = this.getSessionAnalytics();
    
    return {
      averageSessionDuration: analytics.duration,
      mostUsedActions: analytics.topActions.map((a) => a.action),
      averageScrollDistance: analytics.totalScrollDistance,
      tabSwitchFrequency: analytics.tabSwitches,
    };
  }

  /**
   * Export session data (for analytics)
   */
  exportSessionData(): UserSession | null {
    if (!this.currentSession) return null;

    return {
      ...this.currentSession,
      endTime: Date.now(),
    };
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    this.currentSession = null;
    this.events = [];
    this.initSession();
  }

  /**
   * Get all events
   */
  getAllEvents(): UserBehaviorEvent[] {
    return [...this.events];
  }

  /**
   * Get events by action type
   */
  getEventsByAction(action: UserAction): UserBehaviorEvent[] {
    return this.events.filter((event) => event.action === action);
  }

  /**
   * Get events by screen
   */
  getEventsByScreen(screen: string): UserBehaviorEvent[] {
    return this.events.filter((event) => event.screen === screen);
  }
}

// Export singleton instance
export const userBehaviorTracker = UserBehaviorTracker.getInstance();

// Export convenient tracking functions
export const trackTabSwitch = (from: string, to: string, screen: string, method?: 'tap' | 'swipe') => 
  userBehaviorTracker.trackTabSwitch(from, to, screen, method);

export const trackScroll = (position: number, screen: string, contentHeight: number, viewportHeight: number) => 
  userBehaviorTracker.trackScroll(position, screen, contentHeight, viewportHeight);

export const trackSwipe = (direction: 'left' | 'right' | 'up' | 'down', screen: string, velocity?: number) => 
  userBehaviorTracker.trackSwipe(direction, screen, velocity);

export const trackSearch = (query: string, screen: string, resultsCount?: number) => 
  userBehaviorTracker.trackSearch(query, screen, resultsCount);

export const trackFilter = (filterType: string, filterValue: any, screen: string, resultsCount?: number) => 
  userBehaviorTracker.trackFilter(filterType, filterValue, screen, resultsCount);

export const trackSort = (sortBy: string, screen: string, order?: 'asc' | 'desc') => 
  userBehaviorTracker.trackSort(sortBy, screen, order);

export const trackItemView = (itemId: string, itemType: string, screen: string, position?: number) => 
  userBehaviorTracker.trackItemView(itemId, itemType, screen, position);

export const trackItemClick = (itemId: string, itemType: string, screen: string, position?: number) => 
  userBehaviorTracker.trackItemClick(itemId, itemType, screen, position);

export const trackScreenView = (screen: string, previousScreen?: string) => 
  userBehaviorTracker.trackScreenView(screen, previousScreen);

export const trackPullRefresh = (screen: string) => 
  userBehaviorTracker.trackPullRefresh(screen);

export const trackLoadMore = (screen: string, page: number, itemsLoaded: number) => 
  userBehaviorTracker.trackLoadMore(screen, page, itemsLoaded);

export const trackError = (error: string, screen: string, context?: any) => 
  userBehaviorTracker.trackError(error, screen, context);

export const getSessionAnalytics = () => 
  userBehaviorTracker.getSessionAnalytics();

export const getUserPatterns = () => 
  userBehaviorTracker.getUserPatterns();

export const exportSessionData = () => 
  userBehaviorTracker.exportSessionData();
