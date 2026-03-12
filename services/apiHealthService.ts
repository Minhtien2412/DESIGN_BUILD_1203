/**
 * Backend API Health Check & Connection Status
 * Checks all required endpoints for Home screen
 * @created 2026-02-04
 */

import { apiFetch } from "./api";

export interface EndpointStatus {
  endpoint: string;
  name: string;
  status: "ok" | "error" | "pending";
  responseTime?: number;
  error?: string;
}

export interface ApiHealthReport {
  baseUrl: string;
  timestamp: string;
  overallStatus: "healthy" | "degraded" | "down";
  endpoints: EndpointStatus[];
  summary: {
    total: number;
    ok: number;
    error: number;
  };
}

// All required endpoints for Home screen
const HOME_ENDPOINTS = [
  { endpoint: "/banners/home", name: "Home Banners" },
  { endpoint: "/workers", name: "Workers List" },
  { endpoint: "/workers/stats", name: "Workers Stats" },
  { endpoint: "/categories/featured", name: "Featured Categories" },
  { endpoint: "/categories/library", name: "Library Categories" },
  { endpoint: "/videos/featured", name: "Featured Videos" },
  { endpoint: "/livestreams/active", name: "Active Livestreams" },
  { endpoint: "/home/services/featured", name: "Featured Services" },
  { endpoint: "/home/services/design", name: "Design Services" },
  { endpoint: "/home/products/equipment", name: "Equipment Products" },
  { endpoint: "/home/data", name: "Aggregated Home Data" },
  { endpoint: "/home/sections", name: "Home Sections Config" },
];

/**
 * Check a single endpoint health
 */
async function checkEndpoint(
  endpoint: string,
  name: string,
): Promise<EndpointStatus> {
  const startTime = Date.now();

  try {
    await apiFetch(endpoint);
    const responseTime = Date.now() - startTime;

    return {
      endpoint,
      name,
      status: "ok",
      responseTime,
    };
  } catch (error: any) {
    return {
      endpoint,
      name,
      status: "error",
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Run full health check on all home endpoints
 */
export async function checkApiHealth(): Promise<ApiHealthReport> {
  const results: EndpointStatus[] = [];

  // Check all endpoints in parallel
  const checks = HOME_ENDPOINTS.map(({ endpoint, name }) =>
    checkEndpoint(endpoint, name),
  );

  const endpointResults = await Promise.all(checks);
  results.push(...endpointResults);

  // Calculate summary
  const ok = results.filter((r) => r.status === "ok").length;
  const error = results.filter((r) => r.status === "error").length;

  // Determine overall status
  let overallStatus: "healthy" | "degraded" | "down";
  if (error === 0) {
    overallStatus = "healthy";
  } else if (ok > error) {
    overallStatus = "degraded";
  } else {
    overallStatus = "down";
  }

  return {
    baseUrl: "https://baotienweb.cloud/api/v1",
    timestamp: new Date().toISOString(),
    overallStatus,
    endpoints: results,
    summary: {
      total: results.length,
      ok,
      error,
    },
  };
}

/**
 * Quick health check - just pings one endpoint
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    await apiFetch("/health");
    return true;
  } catch {
    try {
      // Fallback to home/data endpoint
      await apiFetch("/home/data");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Get list of missing/errored endpoints
 */
export async function getMissingEndpoints(): Promise<string[]> {
  const report = await checkApiHealth();
  return report.endpoints
    .filter((e) => e.status === "error")
    .map((e) => e.endpoint);
}

/**
 * Format health report for display
 */
export function formatHealthReport(report: ApiHealthReport): string {
  const lines: string[] = [
    `=== API Health Check Report ===`,
    `Base URL: ${report.baseUrl}`,
    `Time: ${report.timestamp}`,
    `Status: ${report.overallStatus.toUpperCase()}`,
    ``,
    `Summary: ${report.summary.ok}/${report.summary.total} endpoints OK`,
    ``,
    `Endpoints:`,
  ];

  for (const endpoint of report.endpoints) {
    const icon = endpoint.status === "ok" ? "✅" : "❌";
    const time = endpoint.responseTime ? ` (${endpoint.responseTime}ms)` : "";
    const error = endpoint.error ? ` - ${endpoint.error}` : "";
    lines.push(
      `  ${icon} ${endpoint.name}: ${endpoint.endpoint}${time}${error}`,
    );
  }

  return lines.join("\n");
}

export default {
  checkApiHealth,
  quickHealthCheck,
  getMissingEndpoints,
  formatHealthReport,
  HOME_ENDPOINTS,
};
