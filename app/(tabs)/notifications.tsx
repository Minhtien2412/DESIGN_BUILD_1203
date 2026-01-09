/**
 * Notifications Tab
 * 
 * Sử dụng UnifiedNotificationsScreen để đồng bộ thông báo 
 * từ cả CRM và App Backend.
 * 
 * Toggle ENABLE_UNIFIED để chuyển giữa 2 mode:
 * - true: Hiển thị thông báo đồng bộ CRM + App
 * - false: Chỉ hiển thị thông báo từ App (cũ)
 */

import NotificationsScreenModernized from '@/features/notifications/NotificationsScreenModernized';
import UnifiedNotificationsScreen from '@/features/notifications/UnifiedNotificationsScreen';

// Toggle này để chuyển đổi giữa 2 mode hiển thị thông báo
const ENABLE_UNIFIED = true;

export default ENABLE_UNIFIED ? UnifiedNotificationsScreen : NotificationsScreenModernized;
