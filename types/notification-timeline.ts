/**
 * Notification Timeline Types
 * Enhanced notification structure with activity tracking
 */

export interface NotificationTimestamp {
  createdAt: string; // ISO timestamp when notification was created
  receivedAt?: string; // ISO timestamp when user received it (device sync)
  readAt?: string; // ISO timestamp when user read it
  deliveredAt?: string; // ISO timestamp when delivered to device
}

export interface ActivityLogEntry {
  id: string;
  type: 'login' | 'logout' | 'notification' | 'action' | 'security';
  title: string;
  description: string;
  timestamp: string; // ISO timestamp
  metadata?: {
    ipAddress?: string;
    device?: string;
    location?: string;
    browser?: string;
    [key: string]: any;
  };
}

export interface EnhancedNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'call' | 'security' | 'activity' | 'system' | 'event' | 'live';
  title: string;
  message: string;
  read: boolean;
  timestamps: NotificationTimestamp;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'system' | 'event' | 'live' | 'message' | 'call' | 'project' | 'payment' | 'security'; // Notification categories
  actionUrl?: string; // Deep link for navigation
  data?: any;
}

// Specific notification types
export interface SystemNotification extends EnhancedNotification {
  category: 'system';
  type: 'system';
  systemType: 'maintenance' | 'update' | 'announcement' | 'policy';
  affectedServices?: string[];
}

export interface EventNotification extends EnhancedNotification {
  category: 'event';
  type: 'event';
  eventType: 'project' | 'deadline' | 'meeting' | 'reminder' | 'milestone';
  eventDate?: string;
  location?: string;
  participants?: string[];
}

export interface LiveNotification extends EnhancedNotification {
  category: 'live';
  type: 'live';
  liveType: 'stream' | 'video_call' | 'webinar' | 'broadcast';
  streamUrl?: string;
  isActive: boolean;
  viewerCount?: number;
  startedAt?: string;
}

export interface MessageNotification extends EnhancedNotification {
  category: 'message';
  type: 'message';
  messageType: 'chat' | 'email' | 'sms' | 'comment';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  conversationId?: string;
  preview?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  readToday: number;
  weeklyAverage: number;
}
