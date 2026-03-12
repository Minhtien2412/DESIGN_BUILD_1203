/**
 * API with Mock Fallback
 * Automatically falls back to mock data when real API is unavailable
 */

import { get } from "./api";
import mockDataService, { getMockData, hasMockData } from "./mockDataService";

// Endpoints that should use mock fallback
const MOCK_ENABLED_ENDPOINTS = [
  "/home/featured-services",
  "/home/banners",
  "/home/videos",
  "/home/news",
  "/flash-sales",
  "/community/feed",
  "/crm/leads",
  "/crm/clients",
  "/crm/deals",
  "/crm/activities",
  "/files",
  "/documents",
  "/invoices",
  "/contracts",
  "/payments",
  "/equipment",
  "/communications",
  "/admin/dashboard",
  "/admin/stats",
];

/**
 * Fetch data with automatic mock fallback
 * Tries real API first, falls back to mock if:
 * - API returns 404
 * - API returns error
 * - Mock fallback is enabled for the endpoint
 */
export async function fetchWithFallback<T>(
  endpoint: string,
  options?: {
    useMockOnly?: boolean;
    skipMockFallback?: boolean;
  },
): Promise<T> {
  const { useMockOnly = false, skipMockFallback = false } = options || {};

  // If mock only mode, return mock data directly
  if (useMockOnly && hasMockData(endpoint)) {
    console.log(`[API] Using mock data for: ${endpoint}`);
    return getMockData<T>(endpoint) as T;
  }

  // Try real API first
  try {
    const response = await get<T>(endpoint);
    return response;
  } catch (error: unknown) {
    // Check if we should fallback to mock
    const shouldFallback =
      !skipMockFallback &&
      MOCK_ENABLED_ENDPOINTS.includes(endpoint) &&
      hasMockData(endpoint);

    if (shouldFallback) {
      console.log(`[API] Falling back to mock data for: ${endpoint}`);
      const mockData = getMockData<T>(endpoint);
      if (mockData) {
        return mockData;
      }
    }

    // Re-throw if no fallback available
    throw error;
  }
}

// ============================================
// HOME DATA APIs
// ============================================

export async function getFeaturedServices() {
  return fetchWithFallback<typeof mockDataService.featuredServices>(
    "/home/featured-services",
  );
}

export async function getBanners() {
  return fetchWithFallback<typeof mockDataService.banners>("/home/banners");
}

export async function getVideos() {
  return fetchWithFallback<typeof mockDataService.videos>("/home/videos");
}

export async function getNews() {
  return fetchWithFallback<typeof mockDataService.news>("/home/news");
}

export async function getFlashSales() {
  return fetchWithFallback<typeof mockDataService.flashSales>("/flash-sales");
}

// ============================================
// COMMUNITY APIs
// ============================================

export async function getCommunityFeed() {
  return fetchWithFallback<typeof mockDataService.communityFeed>(
    "/community/feed",
  );
}

// ============================================
// CRM APIs
// ============================================

export async function getCrmLeads() {
  return fetchWithFallback<typeof mockDataService.crmLeads>("/crm/leads");
}

export async function getCrmClients() {
  return fetchWithFallback<typeof mockDataService.crmClients>("/crm/clients");
}

export async function getCrmDeals() {
  return fetchWithFallback<typeof mockDataService.crmDeals>("/crm/deals");
}

export async function getCrmActivities() {
  return fetchWithFallback<typeof mockDataService.crmActivities>(
    "/crm/activities",
  );
}

// ============================================
// FILES & DOCUMENTS APIs
// ============================================

export async function getFiles() {
  return fetchWithFallback<typeof mockDataService.files>("/files");
}

export async function getDocuments() {
  return fetchWithFallback<typeof mockDataService.documents>("/documents");
}

// ============================================
// BUSINESS OPERATIONS APIs
// ============================================

export async function getInvoices() {
  return fetchWithFallback<typeof mockDataService.invoices>("/invoices");
}

export async function getContracts() {
  return fetchWithFallback<typeof mockDataService.contracts>("/contracts");
}

export async function getPayments() {
  return fetchWithFallback<typeof mockDataService.payments>("/payments");
}

export async function getEquipment() {
  return fetchWithFallback<typeof mockDataService.equipment>("/equipment");
}

export async function getCommunications() {
  return fetchWithFallback<typeof mockDataService.communications>(
    "/communications",
  );
}

// ============================================
// ADMIN APIs
// ============================================

export async function getAdminDashboard() {
  return fetchWithFallback<typeof mockDataService.adminDashboard>(
    "/admin/dashboard",
  );
}

export async function getAdminStats() {
  return fetchWithFallback<typeof mockDataService.adminStats>("/admin/stats");
}

export default {
  fetchWithFallback,
  // Home
  getFeaturedServices,
  getBanners,
  getVideos,
  getNews,
  getFlashSales,
  // Community
  getCommunityFeed,
  // CRM
  getCrmLeads,
  getCrmClients,
  getCrmDeals,
  getCrmActivities,
  // Files
  getFiles,
  getDocuments,
  // Business
  getInvoices,
  getContracts,
  getPayments,
  getEquipment,
  getCommunications,
  // Admin
  getAdminDashboard,
  getAdminStats,
};
