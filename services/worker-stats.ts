/**
 * Worker Statistics API Service
 * Provides worker count data for home screen utilities
 */

import type {
    RegisterWorkerRequest,
    WorkerRegistration,
    WorkerStatsResponse,
} from "@/types/worker-stats";
import { WorkerType } from "@/types/worker-stats";
import { apiFetch } from "./api";

const WORKER_STATS_ENDPOINT = "/workers/stats";
const WORKER_REGISTRATION_ENDPOINT = "/workers/register";

/**
 * Get worker statistics for all worker types and locations
 * Falls back to mock data if API is unavailable (expected for development)
 */
export async function getWorkerStats(): Promise<WorkerStatsResponse> {
  try {
    const response = await apiFetch(WORKER_STATS_ENDPOINT);
    return response;
  } catch (error) {
    // This is expected if backend endpoint doesn't exist yet - use mock data silently
    console.log("[WorkerStatsService] API unavailable, using mock data");
    // Return mock data as fallback
    return getMockWorkerStats();
  }
}

/**
 * Register a new worker for a specific type and location
 */
export async function registerWorker(
  data: RegisterWorkerRequest,
): Promise<WorkerRegistration> {
  try {
    const response = await apiFetch(WORKER_REGISTRATION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("[WorkerStatsService] Failed to register worker:", error);
    throw error;
  }
}

/**
 * Mock data for development/fallback
 */
function getMockWorkerStats(): WorkerStatsResponse {
  return {
    stats: [
      {
        workerType: WorkerType.EP_COC,
        totalCount: 50,
        locations: [
          { location: "Sài Gòn", count: 30, status: "available" },
          { location: "Hà Nội", count: 20, status: "available" },
        ],
      },
      {
        workerType: WorkerType.DAO_DAT,
        totalCount: 40,
        locations: [
          { location: "Sài Gòn", count: 25, status: "available" },
          { location: "Đà Nẵng", count: 15, status: "almost-done" },
        ],
      },
      {
        workerType: WorkerType.VAT_LIEU,
        totalCount: 30,
        locations: [
          { location: "Hà Nội", count: 18, status: "almost-done" },
          { location: "Cần Thơ", count: 12, status: "busy" },
        ],
      },
      {
        workerType: WorkerType.NHAN_CONG,
        totalCount: 13,
        locations: [
          { location: "Sài Gòn", count: 5, status: "busy" },
          { location: "Hà Nội", count: 8, status: "busy" },
        ],
      },
      {
        workerType: WorkerType.THO_XAY,
        totalCount: 50,
        locations: [
          { location: "Hà Nội", count: 28, status: "available" },
          { location: "Sài Gòn", count: 22, status: "available" },
        ],
      },
      {
        workerType: WorkerType.THO_COFFA,
        totalCount: 28,
        locations: [
          { location: "Sài Gòn", count: 12, status: "almost-done" },
          { location: "Đà Nẵng", count: 16, status: "available" },
        ],
      },
      {
        workerType: WorkerType.THO_DIEN_NUOC,
        totalCount: 22,
        locations: [
          { location: "Cần Thơ", count: 8, status: "busy" },
          { location: "Hà Nội", count: 14, status: "almost-done" },
        ],
      },
      {
        workerType: WorkerType.BE_TONG,
        totalCount: 30,
        locations: [
          { location: "Sài Gòn", count: 20, status: "almost-done" },
          { location: "Đà Nẵng", count: 10, status: "busy" },
        ],
      },
      {
        workerType: WorkerType.THO_LAT_GACH,
        totalCount: 40,
        locations: [
          { location: "Hà Nội", count: 22, status: "available" },
          { location: "Sài Gòn", count: 18, status: "available" },
        ],
      },
      {
        workerType: WorkerType.THO_THACH_CAO,
        totalCount: 24,
        locations: [
          { location: "Sài Gòn", count: 10, status: "busy" },
          { location: "Đà Nẵng", count: 14, status: "almost-done" },
        ],
      },
      {
        workerType: WorkerType.THO_SON,
        totalCount: 48,
        locations: [
          { location: "Đà Nẵng", count: 28, status: "available" },
          { location: "Hà Nội", count: 20, status: "available" },
        ],
      },
      {
        workerType: WorkerType.THO_DA,
        totalCount: 23,
        locations: [
          { location: "Sài Gòn", count: 14, status: "almost-done" },
          { location: "Cần Thơ", count: 9, status: "busy" },
        ],
      },
      {
        workerType: WorkerType.THO_LAM_CUA,
        totalCount: 28,
        locations: [
          { location: "Hà Nội", count: 16, status: "almost-done" },
          { location: "Sài Gòn", count: 12, status: "available" },
        ],
      },
      {
        workerType: WorkerType.THO_LAN_CAN,
        totalCount: 60,
        locations: [
          { location: "Sài Gòn", count: 35, status: "available" },
          { location: "Đà Nẵng", count: 25, status: "available" },
        ],
      },
      {
        workerType: WorkerType.THO_CONG,
        totalCount: 17,
        locations: [
          { location: "Cần Thơ", count: 6, status: "busy" },
          { location: "Hà Nội", count: 11, status: "almost-done" },
        ],
      },
      {
        workerType: WorkerType.THO_CAMERA,
        totalCount: 34,
        locations: [
          { location: "Sài Gòn", count: 19, status: "almost-done" },
          { location: "Hà Nội", count: 15, status: "available" },
        ],
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export const WorkerStatsService = {
  getWorkerStats,
  registerWorker,
  getMockWorkerStats,
};
