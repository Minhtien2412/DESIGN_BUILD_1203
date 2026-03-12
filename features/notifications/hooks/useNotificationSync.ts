
/**
 * Hook để đồng bộ thông báo từ server khi unmute một type
 * Tự động fetch lại thông báo của type vừa được unmute
 */
export function useNotificationSync() { return { syncUnmutedType: async () => {}, syncAllUnmuted: async () => {} }; }
