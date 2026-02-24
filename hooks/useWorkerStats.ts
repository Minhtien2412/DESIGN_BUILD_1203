/**
 * useWorkerStats Hook
 * Fetches and manages worker statistics for home screen utilities
 */

import { WorkerStatsService } from "@/services/worker-stats";
import type { WorkerStatsResponse } from "@/types/worker-stats";
import { WorkerType } from "@/types/worker-stats";
import { useCallback, useEffect, useState } from "react";

// Available locations for filtering
export const LOCATIONS = [
  "Tất cả",
  "Sài Gòn",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
] as const;
export type LocationType = (typeof LOCATIONS)[number];

export function useWorkerStats(autoRefresh = false, intervalMs = 300000) {
  const [stats, setStats] = useState<WorkerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationType>("Sài Gòn");

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

  /**
   * Get worker count for a specific worker type at selected location
   */
  const getWorkerCount = useCallback(
    (workerType: WorkerType): { location: string; count: number } => {
      if (!stats) {
        return {
          location:
            selectedLocation === "Tất cả" ? "Toàn quốc" : selectedLocation,
          count: 0,
        };
      }

      const workerStat = stats.stats.find((s) => s.workerType === workerType);
      if (!workerStat) {
        return {
          location:
            selectedLocation === "Tất cả" ? "Toàn quốc" : selectedLocation,
          count: 0,
        };
      }

      if (selectedLocation === "Tất cả") {
        // Sum all locations
        const totalCount = workerStat.locations.reduce(
          (sum, loc) => sum + loc.count,
          0,
        );
        return { location: "Toàn quốc", count: totalCount };
      }

      // Find specific location
      const locationStat = workerStat.locations.find(
        (l) => l.location === selectedLocation,
      );
      return {
        location: selectedLocation,
        count: locationStat?.count || 0,
      };
    },
    [stats, selectedLocation],
  );

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
    selectedLocation,
    setSelectedLocation,
    getWorkerCount,
  };
}

/**
 * Get stats for a specific worker type
 */
export function useWorkerTypeStats(workerType: WorkerType) {
  const {
    stats,
    loading,
    error,
    refresh,
    selectedLocation: _selectedLocation,
    getWorkerCount,
  } = useWorkerStats();

  const typeStats = stats?.stats.find((s) => s.workerType === workerType);
  const locationStats = getWorkerCount(workerType);

  return {
    typeStats,
    locationStats,
    loading,
    error,
    refresh,
  };
}

/**
 * Map worker type enum to utility item IDs
 */
export const WORKER_TYPE_MAP: Record<number, WorkerType> = {
  // Construction utilities (IDs 1-16)
  1: WorkerType.EP_COC,
  2: WorkerType.DAO_DAT,
  3: WorkerType.VAT_LIEU,
  4: WorkerType.NHAN_CONG,
  5: WorkerType.THO_XAY,
  6: WorkerType.THO_SAT,
  7: WorkerType.THO_COFFA,
  8: WorkerType.THO_HAN, // Thợ cơ khí
  9: WorkerType.THO_XAY, // Thợ tô tường (use mason)
  10: WorkerType.THO_DIEN_NUOC,
  11: WorkerType.BE_TONG,
  12: WorkerType.THO_COFFA, // Cốp pha

  // Finishing utilities (IDs 101-116)
  101: WorkerType.THO_LAT_GACH,
  102: WorkerType.THO_THACH_CAO,
  103: WorkerType.THO_SON,
  104: WorkerType.THO_DA,
  105: WorkerType.THO_LAM_CUA,
  106: WorkerType.THO_LAN_CAN,
  107: WorkerType.THO_CONG,
  108: WorkerType.THO_CAMERA,
  109: WorkerType.THO_DA, // Thợ ốp đá
  110: WorkerType.THO_DIEN, // Thợ điện
  111: WorkerType.THO_MOC, // Thợ nội thất
  112: WorkerType.THO_XAY, // Tổng hợp
  113: WorkerType.THO_MOC, // Thợ mộc
  114: WorkerType.THO_NHOM_KINH, // Thợ nhôm kính
  115: WorkerType.THO_CAMERA, // Thợ vệ sinh
};
