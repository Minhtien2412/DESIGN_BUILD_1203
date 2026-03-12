/**
 * Hook để sử dụng DataSync service trong components
 * 
 * @description Cung cấp các functions để đồng bộ dữ liệu với Perfex CRM
 */

import { useCallback, useState } from 'react';
import { dataSyncService, SyncedCRMData, SyncedUserData, SyncStatus } from '../services/dataSyncService';

interface UseDataSyncReturn {
  // State
  loading: boolean;
  error: string | null;
  isLinked: boolean;
  syncedUser: SyncedUserData | null;
  crmData: SyncedCRMData | null;
  
  // Actions
  fetchCRMData: (forceRefresh?: boolean) => Promise<SyncedCRMData | null>;
  syncProject: (projectData: any) => Promise<{ success: boolean; perfexProjectId?: string }>;
  syncInvoice: (invoiceData: any) => Promise<{ success: boolean; perfexInvoiceId?: string }>;
  checkSyncStatus: () => SyncStatus;
  clearData: () => void;
}

/**
 * Hook để đồng bộ dữ liệu với Perfex CRM
 * 
 * @example
 * ```tsx
 * const { isLinked, crmData, fetchCRMData, loading } = useDataSync();
 * 
 * useEffect(() => {
 *   if (isLinked) {
 *     fetchCRMData();
 *   }
 * }, [isLinked]);
 * ```
 */
export function useDataSync(): UseDataSyncReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [syncedUser, setSyncedUser] = useState<SyncedUserData | null>(null);
  const [crmData, setCrmData] = useState<SyncedCRMData | null>(null);

  /**
   * Kiểm tra trạng thái đồng bộ
   */
  const checkSyncStatus = useCallback((): SyncStatus => {
    const status = dataSyncService.getSyncStatus();
    setIsLinked(status.perfexLinked);
    return status;
  }, []);

  /**
   * Lấy dữ liệu từ Perfex CRM
   */
  const fetchCRMData = useCallback(async (forceRefresh = false): Promise<SyncedCRMData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataSyncService.fetchPerfexCRMData(forceRefresh);
      setCrmData(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lấy dữ liệu CRM';
      setError(message);
      console.error('[useDataSync] fetchCRMData error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Đồng bộ project lên Perfex CRM
   */
  const syncProject = useCallback(async (projectData: any): Promise<{ success: boolean; perfexProjectId?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dataSyncService.syncProjectToPerfex(projectData);
      // Refresh CRM data sau khi sync
      if (result.success) {
        await fetchCRMData(true);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi đồng bộ dự án';
      setError(message);
      console.error('[useDataSync] syncProject error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [fetchCRMData]);

  /**
   * Đồng bộ invoice lên Perfex CRM
   */
  const syncInvoice = useCallback(async (invoiceData: any): Promise<{ success: boolean; perfexInvoiceId?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dataSyncService.syncInvoiceToPerfex(invoiceData);
      // Refresh CRM data sau khi sync
      if (result.success) {
        await fetchCRMData(true);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi đồng bộ hóa đơn';
      setError(message);
      console.error('[useDataSync] syncInvoice error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [fetchCRMData]);

  /**
   * Xóa dữ liệu đồng bộ
   */
  const clearData = useCallback(() => {
    dataSyncService.clearSyncData();
    setIsLinked(false);
    setSyncedUser(null);
    setCrmData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    isLinked,
    syncedUser,
    crmData,
    fetchCRMData,
    syncProject,
    syncInvoice,
    checkSyncStatus,
    clearData,
  };
}

export default useDataSync;
