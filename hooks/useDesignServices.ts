/**
 * useDesignServices — Fetches real design service data from server
 *
 * Merges live worker stats & pricing from the backend API with static
 * fallback data from @/data/home-data.ts.
 *
 * API endpoints used:
 *   GET /workers/stats          → worker counts per type per location
 *   GET /workers?limit=50       → individual worker records (dailyRate, location)
 *   GET /services/design        → design service listings (if available)
 *
 * The hook produces DesignServiceItem[] that the homepage grid can consume
 * directly — same shape as the static DESIGN_SERVICES but with live data.
 *
 * @created 2026-02-26
 */

import { DESIGN_SERVICES, type DesignServiceItem } from "@/data/home-data";
import { get } from "@/services/api";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types from server
// ============================================================================

/** Worker entry from GET /workers */
interface ServerWorkerEntry {
  id: string;
  name: string;
  workerType: string;
  location: string;
  dailyRate: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  status: string;
  verified: boolean;
}

/** Stats entry from GET /workers/stats */
interface WorkerStatEntry {
  workerType: string;
  locations: { location: string; count: number }[];
}

interface WorkerStatsResponse {
  stats: WorkerStatEntry[];
  total: number;
}

// ============================================================================
// Mapping: design service ID → worker type string on the server
// ============================================================================

const DESIGN_SERVICE_WORKER_MAP: Record<number, string> = {
  1: "KIEN_TRUC_SU", // Kiến trúc sư
  2: "KY_SU", // Kỹ sư
  3: "KET_CAU", // Kết cấu
  4: "THO_DIEN", // Điện
  5: "THO_NUOC", // Nước
  6: "DU_TOAN", // Dự toán
  7: "THO_MOC", // Nội thất (thợ mộc/nội thất)
  8: "AI_TOOLS", // Công Cụ AI (no worker mapping)
};

// Alternative names the server might use
const WORKER_TYPE_ALIASES: Record<string, string[]> = {
  KIEN_TRUC_SU: ["KIEN_TRUC", "ARCHITECT", "KTS"],
  KY_SU: ["ENGINEER", "KY_SU_XD"],
  KET_CAU: ["STRUCTURAL", "KET_CAU_XD"],
  THO_DIEN: ["ELECTRICIAN", "DIEN"],
  THO_NUOC: ["PLUMBER", "NUOC", "THO_ONG_NUOC"],
  DU_TOAN: ["ESTIMATOR", "QS"],
  THO_MOC: ["CARPENTER", "NOI_THAT", "THO_NOI_THAT"],
};

// ============================================================================
// Price formatting helpers
// ============================================================================

function formatPricePerM2(dailyRate: number): string {
  // Convert daily rate to approximate per-m2 price
  // Assumption: worker covers ~2m2 per day for design services
  const perM2 = Math.round(dailyRate / 2);
  return `${perM2.toLocaleString("vi-VN")}đ/m2`;
}

function abbreviateLocation(location: string): string {
  if (!location) return "Sài Gòn";
  if (
    location.includes("Sài Gòn") ||
    location.includes("TP.HCM") ||
    location.includes("Hồ Chí Minh")
  )
    return "Sài Gòn";
  if (location.includes("Hà Nội")) return "HN";
  if (location.includes("Đà Nẵng")) return "ĐN";
  if (location.includes("Cần Thơ")) return "CT";
  return location.length > 8 ? location.slice(0, 8) : location;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useDesignServices() {
  const [services, setServices] =
    useState<DesignServiceItem[]>(DESIGN_SERVICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch worker stats + worker list in parallel
      const [statsRes, workersRes] = await Promise.allSettled([
        get<WorkerStatsResponse>("/workers/stats"),
        get<{ data: ServerWorkerEntry[] }>("/workers?limit=100"),
      ]);

      // Parse results
      const statsData: WorkerStatEntry[] =
        statsRes.status === "fulfilled" && statsRes.value?.stats
          ? statsRes.value.stats
          : [];

      const workersList: ServerWorkerEntry[] =
        workersRes.status === "fulfilled" && workersRes.value?.data
          ? Array.isArray(workersRes.value.data)
            ? workersRes.value.data
            : []
          : [];

      // Only update if we got real data from at least one source
      if (statsData.length === 0 && workersList.length === 0) {
        // No server data — keep static fallback
        setServices(DESIGN_SERVICES);
        return;
      }

      // Build lookup: workerType → { count, avgPrice, primaryLocation }
      const typeLookup = new Map<
        string,
        { count: number; avgPrice: number; location: string }
      >();

      // From stats endpoint
      for (const stat of statsData) {
        const totalCount = stat.locations.reduce((s, l) => s + l.count, 0);
        const topLocation = stat.locations.sort((a, b) => b.count - a.count)[0];
        typeLookup.set(stat.workerType, {
          count: totalCount,
          avgPrice: 0, // will be enriched from workers list
          location: topLocation?.location || "Sài Gòn",
        });
      }

      // From workers list — compute avg price per type
      const priceByType = new Map<string, number[]>();
      for (const w of workersList) {
        if (w.status !== "APPROVED" || !w.dailyRate) continue;
        const existing = priceByType.get(w.workerType) || [];
        existing.push(w.dailyRate);
        priceByType.set(w.workerType, existing);

        // Also fill count if not from stats
        if (!typeLookup.has(w.workerType)) {
          typeLookup.set(w.workerType, {
            count: 1,
            avgPrice: w.dailyRate,
            location: w.location || "Sài Gòn",
          });
        }
      }

      // Merge avg prices into lookup
      for (const [type, prices] of priceByType.entries()) {
        const existing = typeLookup.get(type);
        if (existing) {
          existing.avgPrice = Math.round(
            prices.reduce((s, p) => s + p, 0) / prices.length,
          );
        }
      }

      // Helper: find stats for a worker type, including aliases
      const findStats = (workerType: string) => {
        if (typeLookup.has(workerType)) return typeLookup.get(workerType)!;
        const aliases = WORKER_TYPE_ALIASES[workerType];
        if (aliases) {
          for (const alias of aliases) {
            if (typeLookup.has(alias)) return typeLookup.get(alias)!;
          }
        }
        return null;
      };

      // Merge live data into static design services
      const merged = DESIGN_SERVICES.map((svc) => {
        const serverType = DESIGN_SERVICE_WORKER_MAP[svc.id];
        if (!serverType) return svc; // e.g. AI Tools

        const liveData = findStats(serverType);
        if (!liveData) return svc; // no server data for this type

        return {
          ...svc,
          price:
            liveData.avgPrice > 0
              ? formatPricePerM2(liveData.avgPrice)
              : svc.price,
          location: abbreviateLocation(liveData.location),
          count: String(liveData.count),
        };
      });

      setServices(merged);
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu dịch vụ thiết kế");
      console.warn("[useDesignServices] Error:", err);
      // Keep static fallback on error
      setServices(DESIGN_SERVICES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      const timer = setTimeout(fetchData, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchData]);

  return {
    services,
    loading,
    error,
    refresh: fetchData,
  };
}
