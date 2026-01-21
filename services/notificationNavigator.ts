/**
 * Notification Navigator Service
 * ==============================
 * 
 * Xử lý deep linking từ thông báo để điều hướng đến 
 * đúng nơi xảy ra sự kiện.
 * 
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

import { router } from 'expo-router';
import { Alert } from 'react-native';

// ==================== TYPES ====================

export interface NotificationData {
  id?: string;
  type?: string;
  relatedType?: string;
  relatedId?: string;
  route?: string;
  // Specific fields
  taskId?: string;
  projectId?: string;
  ticketId?: string;
  chatId?: string;
  messageId?: string;
  orderId?: string;
  meetingId?: string;
  roomId?: string;
  userId?: string;
  productId?: string;
  eventId?: string;
  invoiceId?: string;
  contractId?: string;
  // Custom data
  params?: Record<string, any>;
}

export interface NavigationResult {
  success: boolean;
  destination: string;
  error?: string;
}

// ==================== ROUTE MAPPINGS ====================

/**
 * Map notification types to routes
 */
const ROUTE_MAP: Record<string, string> = {
  // Tasks & Projects
  'task': '/projects/[id]/tasks',
  'project': '/projects/[id]',
  'project_update': '/projects/[id]',
  
  // Support
  'ticket': '/support/[id]',
  'ticket_reply': '/support/[id]',
  
  // Messaging
  'message': '/chat/[chatId]',
  'chat': '/chat/[chatId]',
  'new_message': '/chat/[chatId]',
  
  // Meetings & Calls
  'meeting': '/meet/[meetingId]/room',
  'call': '/call',
  'video_call': '/call',
  
  // Orders & Payments
  'order': '/order/[id]',
  'order_status': '/order/[id]',
  'payment': '/order/[id]',
  'invoice': '/invoices/[id]',
  
  // Products
  'product': '/product/[id]',
  'product_update': '/product/[id]',
  'flash_sale': '/flash-sale',
  'promotion': '/promotions',
  
  // User & Social
  'friend_request': '/profile/[userId]',
  'follow': '/profile/[userId]',
  'like': '/social',
  'comment': '/social',
  
  // System
  'system': '/notifications',
  'info': '/notifications',
  'warning': '/notifications',
  'error': '/notifications',
  
  // Construction Specific
  'construction': '/construction/[id]',
  'construction_progress': '/construction-progress/[id]',
  'quality_report': '/quality-assurance/[id]',
  'inspection': '/inspection/[id]',
  'material_delivery': '/materials/[id]',
  'worker_schedule': '/worker-schedule',
  'daily_report': '/daily-report/[id]',
  
  // Documents
  'document': '/documents/[id]',
  'contract': '/contracts/[id]',
  'quotation': '/quote-request',
  
  // Events
  'event': '/events/[id]',
  'reminder': '/notifications',
  'deadline': '/scheduled-tasks',
};

// ==================== MAIN NAVIGATOR ====================

/**
 * Navigate to the appropriate screen based on notification data
 * @param data Notification data containing type and related IDs
 * @returns NavigationResult indicating success/failure
 */
export function navigateToNotification(data: NotificationData): NavigationResult {
  if (!data) {
    return { success: false, destination: '', error: 'No notification data provided' };
  }

  console.log('[NotificationNavigator] Processing:', data);

  try {
    // Priority 1: Direct route specified
    if (data.route) {
      router.push(data.route as any);
      return { success: true, destination: data.route };
    }

    // Priority 2: Related type + ID
    const type = (data.type || data.relatedType || '').toLowerCase();
    const id = data.relatedId || extractId(data);

    if (!type) {
      // Default to notifications screen
      router.push('/notifications');
      return { success: true, destination: '/notifications' };
    }

    // Get route template
    const routeTemplate = ROUTE_MAP[type];
    
    if (routeTemplate && id) {
      const destination = buildRoute(routeTemplate, type, id, data);
      router.push(destination as any);
      return { success: true, destination };
    }

    // Fallback routes based on type category
    const fallbackRoute = getFallbackRoute(type);
    router.push(fallbackRoute as any);
    return { success: true, destination: fallbackRoute };

  } catch (error) {
    console.error('[NotificationNavigator] Navigation error:', error);
    // Fallback to notifications
    router.push('/notifications');
    return { 
      success: false, 
      destination: '/notifications', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Navigate and show the event details in a modal or dedicated screen
 * @param data Notification data
 * @param showDetails Whether to show additional details alert
 */
export async function navigateAndShowEvent(
  data: NotificationData, 
  showDetails: boolean = false
): Promise<NavigationResult> {
  const result = navigateToNotification(data);
  
  if (showDetails && result.success) {
    // Small delay to allow navigation to complete
    setTimeout(() => {
      showEventDetails(data);
    }, 500);
  }
  
  return result;
}

/**
 * Show event details in an alert (for quick preview)
 */
export function showEventDetails(data: NotificationData): void {
  const type = (data.type || data.relatedType || 'Thông báo').toUpperCase();
  const id = data.relatedId || extractId(data) || 'N/A';
  
  const messages: string[] = [];
  
  if (data.taskId) messages.push(`Task ID: ${data.taskId}`);
  if (data.projectId) messages.push(`Project ID: ${data.projectId}`);
  if (data.orderId) messages.push(`Order ID: ${data.orderId}`);
  if (data.meetingId) messages.push(`Meeting ID: ${data.meetingId}`);
  if (data.ticketId) messages.push(`Ticket ID: ${data.ticketId}`);
  
  if (messages.length === 0) {
    messages.push(`ID: ${id}`);
  }

  Alert.alert(
    `📍 Chi tiết sự kiện`,
    `Loại: ${type}\n${messages.join('\n')}`,
    [{ text: 'Đóng', style: 'cancel' }]
  );
}

// ==================== HELPERS ====================

/**
 * Extract ID from notification data
 */
function extractId(data: NotificationData): string | null {
  return (
    data.relatedId ||
    data.taskId ||
    data.projectId ||
    data.ticketId ||
    data.chatId ||
    data.orderId ||
    data.meetingId ||
    data.roomId ||
    data.userId ||
    data.productId ||
    data.eventId ||
    data.invoiceId ||
    data.contractId ||
    null
  );
}

/**
 * Build route with parameters
 */
function buildRoute(
  template: string, 
  type: string, 
  id: string, 
  data: NotificationData
): string {
  let route = template;
  
  // Replace common placeholders
  route = route.replace('[id]', id);
  route = route.replace('[chatId]', data.chatId || id);
  route = route.replace('[meetingId]', data.meetingId || id);
  route = route.replace('[userId]', data.userId || id);
  
  // Handle special cases
  if (type === 'call' || type === 'video_call') {
    if (data.roomId) {
      route = `/call?roomId=${data.roomId}`;
    }
  }
  
  if (type === 'message' && data.messageId) {
    route += `?messageId=${data.messageId}`;
  }

  return route;
}

/**
 * Get fallback route based on notification type category
 */
function getFallbackRoute(type: string): string {
  const category = getTypeCategory(type);
  
  switch (category) {
    case 'task':
      return '/(tabs)/projects';
    case 'message':
      return '/chat';
    case 'order':
      return '/order';
    case 'meeting':
      return '/meet';
    case 'construction':
      return '/construction';
    case 'document':
      return '/documents';
    case 'social':
      return '/social';
    default:
      return '/notifications';
  }
}

/**
 * Categorize notification type
 */
function getTypeCategory(type: string): string {
  const taskTypes = ['task', 'project', 'project_update', 'deadline'];
  const messageTypes = ['message', 'chat', 'new_message'];
  const orderTypes = ['order', 'order_status', 'payment', 'invoice'];
  const meetingTypes = ['meeting', 'call', 'video_call', 'event'];
  const constructionTypes = ['construction', 'construction_progress', 'quality_report', 'inspection', 'daily_report'];
  const documentTypes = ['document', 'contract', 'quotation'];
  const socialTypes = ['friend_request', 'follow', 'like', 'comment'];
  
  if (taskTypes.includes(type)) return 'task';
  if (messageTypes.includes(type)) return 'message';
  if (orderTypes.includes(type)) return 'order';
  if (meetingTypes.includes(type)) return 'meeting';
  if (constructionTypes.includes(type)) return 'construction';
  if (documentTypes.includes(type)) return 'document';
  if (socialTypes.includes(type)) return 'social';
  
  return 'system';
}

// ==================== INTEGRATION HELPERS ====================

/**
 * Handle push notification tap
 * Use this in notification response listeners
 */
export function handleNotificationTap(response: any): NavigationResult {
  const data = response?.notification?.request?.content?.data as NotificationData;
  return navigateToNotification(data || {});
}

/**
 * Handle notification from list item press
 */
export function handleNotificationItemPress(notification: {
  id: string;
  type?: string;
  relatedType?: string;
  relatedId?: string;
  data?: Record<string, any>;
}): NavigationResult {
  const data: NotificationData = {
    id: notification.id,
    type: notification.type,
    relatedType: notification.relatedType,
    relatedId: notification.relatedId,
    ...notification.data,
  };
  
  return navigateToNotification(data);
}

/**
 * Get icon for notification type
 */
export function getNotificationIcon(type: string): { name: string; color: string } {
  const iconMap: Record<string, { name: string; color: string }> = {
    task: { name: 'checkmark-circle-outline', color: '#22C55E' },
    project: { name: 'folder-outline', color: '#F59E0B' },
    ticket: { name: 'help-buoy-outline', color: '#EF4444' },
    message: { name: 'chatbubble-outline', color: '#3B82F6' },
    chat: { name: 'chatbubbles-outline', color: '#3B82F6' },
    order: { name: 'cart-outline', color: '#8B5CF6' },
    payment: { name: 'card-outline', color: '#10B981' },
    meeting: { name: 'videocam-outline', color: '#EC4899' },
    call: { name: 'call-outline', color: '#14B8A6' },
    construction: { name: 'construct-outline', color: '#F97316' },
    document: { name: 'document-text-outline', color: '#6366F1' },
    system: { name: 'notifications-outline', color: '#64748B' },
    info: { name: 'information-circle-outline', color: '#3B82F6' },
    warning: { name: 'warning-outline', color: '#F59E0B' },
    error: { name: 'alert-circle-outline', color: '#EF4444' },
    success: { name: 'checkmark-done-outline', color: '#22C55E' },
  };
  
  const normalizedType = type?.toLowerCase() || 'system';
  return iconMap[normalizedType] || iconMap.system;
}

export default {
  navigateToNotification,
  navigateAndShowEvent,
  showEventDetails,
  handleNotificationTap,
  handleNotificationItemPress,
  getNotificationIcon,
};
