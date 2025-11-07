import { getItem, setItem } from '@/utils/storage';

export interface NotificationAnalytics {
  // Engagement metrics
  totalReceived: number;
  totalRead: number;
  totalClicked: number;
  totalDismissed: number;
  
  // Type breakdown
  typeBreakdown: Record<string, {
    received: number;
    read: number;
    clicked: number;
    readRate: number; // %
    clickRate: number; // %
  }>;
  
  // Time-based metrics
  dailyStats: Record<string, {
    date: string;
    received: number;
    read: number;
    clicked: number;
  }>;
  
  // Response time metrics
  avgReadTime: number; // seconds
  avgClickTime: number; // seconds
  
  // Last updated
  lastUpdated: number;
}

const ANALYTICS_KEY = 'notification_analytics';

// Default analytics structure
const DEFAULT_ANALYTICS: NotificationAnalytics = {
  totalReceived: 0,
  totalRead: 0,
  totalClicked: 0,
  totalDismissed: 0,
  typeBreakdown: {},
  dailyStats: {},
  avgReadTime: 0,
  avgClickTime: 0,
  lastUpdated: Date.now(),
};

// Load analytics from storage
export async function loadAnalytics(): Promise<NotificationAnalytics> {
  try {
    const stored = await getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ANALYTICS;
  } catch (error) {
    console.warn('Failed to load analytics:', error);
    return DEFAULT_ANALYTICS;
  }
}

// Persist analytics to storage
export async function persistAnalytics(analytics: NotificationAnalytics): Promise<void> {
  try {
    await setItem(ANALYTICS_KEY, JSON.stringify({ ...analytics, lastUpdated: Date.now() }));
  } catch (error) {
    console.error('Failed to persist analytics:', error);
  }
}

// Track notification received
export async function trackNotificationReceived(type: string = 'other'): Promise<void> {
  const analytics = await loadAnalytics();
  
  analytics.totalReceived++;
  
  // Update type breakdown
  if (!analytics.typeBreakdown[type]) {
    analytics.typeBreakdown[type] = { received: 0, read: 0, clicked: 0, readRate: 0, clickRate: 0 };
  }
  analytics.typeBreakdown[type].received++;
  
  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = { date: today, received: 0, read: 0, clicked: 0 };
  }
  analytics.dailyStats[today].received++;
  
  await persistAnalytics(analytics);
}

// Track notification read
export async function trackNotificationRead(type: string = 'other', readTime?: number): Promise<void> {
  const analytics = await loadAnalytics();
  
  analytics.totalRead++;
  
  // Update type breakdown
  if (!analytics.typeBreakdown[type]) {
    analytics.typeBreakdown[type] = { received: 0, read: 0, clicked: 0, readRate: 0, clickRate: 0 };
  }
  analytics.typeBreakdown[type].read++;
  
  // Calculate read rate
  if (analytics.typeBreakdown[type].received > 0) {
    analytics.typeBreakdown[type].readRate = Math.round(
      (analytics.typeBreakdown[type].read / analytics.typeBreakdown[type].received) * 100
    );
  }
  
  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = { date: today, received: 0, read: 0, clicked: 0 };
  }
  analytics.dailyStats[today].read++;
  
  // Track read time
  if (readTime && readTime > 0) {
    const totalReadTime = analytics.avgReadTime * (analytics.totalRead - 1);
    analytics.avgReadTime = Math.round((totalReadTime + readTime) / analytics.totalRead);
  }
  
  await persistAnalytics(analytics);
}

// Track notification clicked/tapped
export async function trackNotificationClicked(type: string = 'other', clickTime?: number): Promise<void> {
  const analytics = await loadAnalytics();
  
  analytics.totalClicked++;
  
  // Update type breakdown
  if (!analytics.typeBreakdown[type]) {
    analytics.typeBreakdown[type] = { received: 0, read: 0, clicked: 0, readRate: 0, clickRate: 0 };
  }
  analytics.typeBreakdown[type].clicked++;
  
  // Calculate click rate
  if (analytics.typeBreakdown[type].received > 0) {
    analytics.typeBreakdown[type].clickRate = Math.round(
      (analytics.typeBreakdown[type].clicked / analytics.typeBreakdown[type].received) * 100
    );
  }
  
  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = { date: today, received: 0, read: 0, clicked: 0 };
  }
  analytics.dailyStats[today].clicked++;
  
  // Track click time
  if (clickTime && clickTime > 0) {
    const totalClickTime = analytics.avgClickTime * (analytics.totalClicked - 1);
    analytics.avgClickTime = Math.round((totalClickTime + clickTime) / analytics.totalClicked);
  }
  
  await persistAnalytics(analytics);
}

// Track notification dismissed
export async function trackNotificationDismissed(): Promise<void> {
  const analytics = await loadAnalytics();
  analytics.totalDismissed++;
  await persistAnalytics(analytics);
}

// Clear old daily stats (keep last 30 days)
export async function cleanupOldAnalytics(): Promise<void> {
  const analytics = await loadAnalytics();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  
  // Remove old daily stats
  Object.keys(analytics.dailyStats).forEach(dateKey => {
    if (dateKey < cutoffDate) {
      delete analytics.dailyStats[dateKey];
    }
  });
  
  await persistAnalytics(analytics);
}

// Export analytics data (for backup/sharing)
export async function exportAnalytics(): Promise<string> {
  const analytics = await loadAnalytics();
  return JSON.stringify(analytics, null, 2);
}

// Import analytics data (for restore)
export async function importAnalytics(jsonData: string): Promise<void> {
  try {
    const analytics = JSON.parse(jsonData) as NotificationAnalytics;
    await persistAnalytics(analytics);
  } catch (error) {
    throw new Error('Invalid analytics data format');
  }
}