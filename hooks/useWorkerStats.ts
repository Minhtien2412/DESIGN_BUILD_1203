/**
 * useWorkerStats Hook
 * Fetches and manages worker statistics for home screen utilities
 */

import { WorkerStatsService } from '@/services/worker-stats';
import type { WorkerStatsResponse } from '@/types/worker-stats';
import { WorkerType } from '@/types/worker-stats';
import { useEffect, useState } from 'react';

export function useWorkerStats(autoRefresh = false, intervalMs = 300000) {
  const [stats, setStats] = useState<WorkerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WorkerStatsService.getWorkerStats();
      setStats(data);
    } catch (err) {
      setError(err as Error);
      // Use mock data on error
      setStats(WorkerStatsService.getMockWorkerStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, intervalMs);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, intervalMs]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

/**
 * Get stats for a specific worker type
 */
export function useWorkerTypeStats(workerType: WorkerType) {
  const { stats, loading, error, refresh } = useWorkerStats();

  const typeStats = stats?.stats.find(s => s.workerType === workerType);

  return {
    typeStats,
    loading,
    error,
    refresh,
  };
}

/**
 * Map worker type enum to utility item IDs
 */
export const WORKER_TYPE_MAP: Record<number, WorkerType> = {
  // Construction utilities (IDs 1-8)
  1: WorkerType.EP_COC,
  2: WorkerType.DAO_DAT,
  3: WorkerType.VAT_LIEU,
  4: WorkerType.NHAN_CONG,
  5: WorkerType.THO_XAY,
  6: WorkerType.THO_COFFA,
  7: WorkerType.THO_DIEN_NUOC,
  8: WorkerType.BE_TONG,
  
  // Finishing utilities (IDs 1-8, but offset in context)
  101: WorkerType.THO_LAT_GACH,
  102: WorkerType.THO_THACH_CAO,
  103: WorkerType.THO_SON,
  104: WorkerType.THO_DA,
  105: WorkerType.THO_LAM_CUA,
  106: WorkerType.THO_LAN_CAN,
  107: WorkerType.THO_CONG,
  108: WorkerType.THO_CAMERA,
};
