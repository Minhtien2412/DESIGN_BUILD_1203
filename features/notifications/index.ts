// Domain barrel: notifications
// Hooks - moved to separate imports to avoid cycles
// export * from './hooks/useNotificationSync';
// export * from './hooks/usePushNotifications';
import type { Notification as _Notification } from '@/context/NotificationContext';

export { NotificationProvider, useNotifications } from '@/context/NotificationContext';
export type { Notification } from '@/context/NotificationContext';

// Core services
export * from '@/services/notifications';
export * from '@/services/scheduledNotifications';

// Analytics
export * from './storage/analyticsStore';

// Rich templates & i18n
export * from './i18n';
export function notifyFromChat(add: (n: Omit<_Notification, 'id' | 'createdAt' | 'read'>) => void, params: { fromUserId: string; preview?: string; title?: string }) {
	const { fromUserId, preview, title } = params;
	add({
		type: 'message',
		title: title || 'Tin nhắn mới',
		message: preview || '',
		data: { route: '/chat/[userId]', params: { userId: fromUserId } },
	});
}
export function notifyFromOrder(add: (n: Omit<_Notification, 'id' | 'createdAt' | 'read'>) => void, params: { id: string; title?: string; body?: string }) {
	add({
		type: 'info',
		title: params.title || 'Đơn hàng',
		message: params.body || '',
		data: { route: '/orders/[id]', params: { id: params.id } },
	});
}

