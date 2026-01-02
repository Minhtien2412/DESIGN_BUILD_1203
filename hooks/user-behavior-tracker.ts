/**
 * User Behavior Tracker
 * Core tracking functionality for user interactions
 */

export interface UserAction {
  type: string;
  screenName: string;
  timestamp: number;
  data?: Record<string, any>;
}

class UserBehaviorTracker {
  private actions: UserAction[] = [];
  private maxActions = 1000;

  track(action: UserAction) {
    this.actions.push(action);
    
    // Keep only recent actions
    if (this.actions.length > this.maxActions) {
      this.actions = this.actions.slice(-this.maxActions);
    }

    // Log in development
    if (__DEV__) {
      console.log('[User Behavior]', action.type, action.data);
    }
  }

  getActions(screenName?: string): UserAction[] {
    if (screenName) {
      return this.actions.filter(a => a.screenName === screenName);
    }
    return this.actions;
  }

  clearActions() {
    this.actions = [];
  }

  getActionsByType(type: string): UserAction[] {
    return this.actions.filter(a => a.type === type);
  }

  getRecentActions(limit: number = 10): UserAction[] {
    return this.actions.slice(-limit);
  }
}

export const userBehaviorTracker = new UserBehaviorTracker();

// Tracking functions
export function trackScreenView(screenName: string, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'screen_view',
    screenName,
    timestamp: Date.now(),
    data,
  });
}

export function trackItemView(screenName: string, itemId: string, itemType: string, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'item_view',
    screenName,
    timestamp: Date.now(),
    data: { itemId, itemType, ...data },
  });
}

export function trackItemClick(screenName: string, itemId: string, itemType: string, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'item_click',
    screenName,
    timestamp: Date.now(),
    data: { itemId, itemType, ...data },
  });
}

export function trackScroll(screenName: string, scrollPosition: number, direction: 'up' | 'down', data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'scroll',
    screenName,
    timestamp: Date.now(),
    data: { scrollPosition, direction, ...data },
  });
}

export function trackSearch(screenName: string, query: string, resultsCount?: number, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'search',
    screenName,
    timestamp: Date.now(),
    data: { query, resultsCount, ...data },
  });
}

export function trackFilter(screenName: string, filterType: string, filterValue: any, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'filter',
    screenName,
    timestamp: Date.now(),
    data: { filterType, filterValue, ...data },
  });
}

export function trackSort(screenName: string, sortBy: string, sortOrder: 'asc' | 'desc', data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'sort',
    screenName,
    timestamp: Date.now(),
    data: { sortBy, sortOrder, ...data },
  });
}

export function trackTabSwitch(screenName: string, tabName: string, tabIndex: number, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'tab_switch',
    screenName,
    timestamp: Date.now(),
    data: { tabName, tabIndex, ...data },
  });
}

export function trackSwipe(screenName: string, direction: 'left' | 'right' | 'up' | 'down', data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'swipe',
    screenName,
    timestamp: Date.now(),
    data: { direction, ...data },
  });
}

export function trackPullRefresh(screenName: string, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'pull_refresh',
    screenName,
    timestamp: Date.now(),
    data,
  });
}

export function trackLoadMore(screenName: string, page: number, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'load_more',
    screenName,
    timestamp: Date.now(),
    data: { page, ...data },
  });
}

export function trackButtonClick(screenName: string, buttonName: string, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'button_click',
    screenName,
    timestamp: Date.now(),
    data: { buttonName, ...data },
  });
}

export function trackFormSubmit(screenName: string, formName: string, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'form_submit',
    screenName,
    timestamp: Date.now(),
    data: { formName, ...data },
  });
}

export function trackError(screenName: string, errorMessage: string, errorCode?: string, data?: Record<string, any>) {
  userBehaviorTracker.track({
    type: 'error',
    screenName,
    timestamp: Date.now(),
    data: { errorMessage, errorCode, ...data },
  });
}
