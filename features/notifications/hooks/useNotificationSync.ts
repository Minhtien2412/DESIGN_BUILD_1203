import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/features/notifications';
import { fetchRemoteNotifications } from '@/services/notificationsApi';
import { useCallback, useRef } from 'react';

/**
 * Hook để đồng bộ thông báo từ server khi unmute một type
 * Tự động fetch lại thông báo của type vừa được unmute
 */
export function useNotificationSync() {
  const { token } = useAuth();
  const { mergeServer, lastVersion, showToast } = useNotifications();
  const syncingRef = useRef(false);

  const syncUnmutedType = useCallback(async (unmutedType: string) => {
    if (syncingRef.current || !token) return;
    
    syncingRef.current = true;
    showToast('Đang đồng bộ...', `Lấy thông báo ${unmutedType}`);

    try {
      // Fetch tất cả thông báo gần đây từ server (API hiện tại không support type filter)
      const result = await fetchRemoteNotifications({
        token,
        since: Math.max(0, lastVersion - 86400 * 7), // Lấy 7 ngày gần nhất
      });

      if (result && result.notifications.length > 0) {
        // Filter client-side chỉ lấy notifications của type vừa unmute
        const filteredNotifications = result.notifications.filter((n: any) => n.type === unmutedType);
        
        if (filteredNotifications.length > 0) {
          mergeServer(filteredNotifications, result.latestVersion || lastVersion);
          showToast('Đồng bộ thành công', `${filteredNotifications.length} thông báo ${unmutedType}`);
        } else {
          showToast('Không có thông báo mới', `Type: ${unmutedType}`);
        }
      } else {
        showToast('Không có thông báo mới', `Type: ${unmutedType}`);
      }
    } catch (error) {
      console.warn('Sync unmuted type failed:', error);
      showToast('Đồng bộ thất bại', 'Vui lòng thử lại sau');
    } finally {
      syncingRef.current = false;
    }
  }, [token, lastVersion, mergeServer, showToast]);

  const bulkSyncAllUnmuted = useCallback(async (unmutedTypes: string[]) => {
    if (syncingRef.current || !token || unmutedTypes.length === 0) return;

    syncingRef.current = true;
    showToast('Đang đồng bộ tất cả...', `${unmutedTypes.length} loại thông báo`);

    try {
      // Fetch tất cả thông báo gần đây
      const result = await fetchRemoteNotifications({
        token,
        since: Math.max(0, lastVersion - 86400 * 7), // 7 ngày
      });

      if (result && result.notifications.length > 0) {
        // Filter client-side chỉ lấy notifications của các types vừa unmute
        const filteredNotifications = result.notifications.filter((n: any) => 
          unmutedTypes.includes(n.type || 'other')
        );
        
        if (filteredNotifications.length > 0) {
          mergeServer(filteredNotifications, result.latestVersion || lastVersion);
          showToast('Đồng bộ hoàn tất', `${filteredNotifications.length} thông báo`);
        } else {
          showToast('Không có thông báo mới');
        }
      } else {
        showToast('Không có thông báo mới');
      }
    } catch (error) {
      console.warn('Bulk sync failed:', error);
      showToast('Đồng bộ thất bại', 'Vui lòng thử lại');
    } finally {
      syncingRef.current = false;
    }
  }, [token, lastVersion, mergeServer, showToast]);

  return {
    syncUnmutedType,
    bulkSyncAllUnmuted,
    isSyncing: syncingRef.current,
  };
}