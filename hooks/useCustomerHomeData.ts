/**
 * useCustomerHomeData Hook
 * Async data hook for Customer (Khách) home screen sections.
 * Fetches design services, banners, construction/finishing workers via useHomeData.
 * Falls back to local data when API unavailable.
 *
 * @created 2026-03-16 — Round 4 async expansion
 */

import type { GridItem } from "@/components/home/CategoryIconGrid";
import {
    CONSTRUCTION_BANNERS,
    DESIGN_BANNERS,
    SHOPPING_BANNERS,
} from "@/data/home-banners";
import type { WorkerItem } from "@/data/home-data";
import {
    COMMUNITY_ITEMS,
    CONSTRUCTION_WORKERS,
    DESIGN_SERVICES,
    FINISHING_WORKERS,
} from "@/data/home-data";
import { useHomeData } from "@/hooks/useHomeData";
import { useWorkerStats, WORKER_TYPE_MAP } from "@/hooks/useWorkerStats";
import { useMemo } from "react";

export interface CustomerHomeDataResult {
  // Data
  designGridItems: GridItem[];
  dynamicConstructionWorkers: WorkerItem[];
  dynamicFinishingWorkers: WorkerItem[];
  communityItems: typeof COMMUNITY_ITEMS;
  designBanners: typeof DESIGN_BANNERS;
  constructionBanners: typeof CONSTRUCTION_BANNERS;
  shoppingBanners: typeof SHOPPING_BANNERS;

  // States
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;

  // Actions
  refresh: () => Promise<void>;
}

export function useCustomerHomeData(): CustomerHomeDataResult {
  const {
    designServices: apiDesignServices,
    constructionWorkers: apiConstructionWorkers,
    finishingWorkers: apiFinishingWorkers,
    banners: apiBanners,
    isLoading,
    isRefreshing,
    error,
    refresh: refreshHomeData,
  } = useHomeData(
    {},
    {
      sections: [
        "designServices",
        "constructionWorkers",
        "finishingWorkers",
        "banners",
      ],
    },
  );

  const {
    stats: workerStats,
    refresh: refreshStats,
    getWorkerCount,
  } = useWorkerStats();

  // Design services: merge API → local fallback
  const designGridItems: GridItem[] = useMemo(() => {
    const source =
      apiDesignServices.length > 0 ? apiDesignServices : DESIGN_SERVICES;
    return source.slice(0, 8).map((s) => ({
      id: typeof s.id === "string" ? parseInt(s.id, 10) || 0 : (s.id as number),
      label: s.label ?? (s as any).name ?? "",
      icon: s.icon,
      route: s.route ?? "/services",
    }));
  }, [apiDesignServices]);

  // Dynamic construction workers with API stats
  const dynamicConstructionWorkers: WorkerItem[] = useMemo(() => {
    const source: WorkerItem[] =
      apiConstructionWorkers.length > 0
        ? apiConstructionWorkers.map((w) => ({
            ...w,
            price: w.price ?? "",
            icon:
              w.icon ?? CONSTRUCTION_WORKERS.find((cw) => cw.id === w.id)?.icon,
          }))
        : CONSTRUCTION_WORKERS;
    return source.map((worker) => {
      const workerType = WORKER_TYPE_MAP[worker.id];
      if (!workerType || worker.id === 16) return worker;
      const { location, count } = getWorkerCount(workerType);
      return { ...worker, price: `${location} - ${count}` };
    });
  }, [apiConstructionWorkers, getWorkerCount, workerStats]);

  // Dynamic finishing workers with API stats
  const dynamicFinishingWorkers: WorkerItem[] = useMemo(() => {
    const source: WorkerItem[] =
      apiFinishingWorkers.length > 0
        ? apiFinishingWorkers.map((w) => ({
            ...w,
            price: w.price ?? "",
            icon:
              w.icon ?? FINISHING_WORKERS.find((fw) => fw.id === w.id)?.icon,
          }))
        : FINISHING_WORKERS;
    return source.map((worker) => {
      const workerType = WORKER_TYPE_MAP[worker.id + 100];
      if (!workerType || worker.id === 16) return worker;
      const { location, count } = getWorkerCount(workerType);
      return { ...worker, price: `${location} - ${count}` };
    });
  }, [apiFinishingWorkers, getWorkerCount, workerStats]);

  // Combined refresh
  const refresh = async () => {
    await Promise.all([refreshHomeData(), refreshStats()]);
  };

  return {
    designGridItems,
    dynamicConstructionWorkers,
    dynamicFinishingWorkers,
    communityItems: COMMUNITY_ITEMS,
    designBanners: DESIGN_BANNERS,
    constructionBanners: CONSTRUCTION_BANNERS,
    shoppingBanners: SHOPPING_BANNERS,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
