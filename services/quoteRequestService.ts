/**
 * Quote Request Service
 * Handle customer quote requests for construction/services
 *
 * Backend: https://baotienweb.cloud/api/v1/quote-requests
 *
 * This service handles:
 * - Create new quote request (customer/guest)
 * - Get my quote requests (authenticated user)
 * - View quote request details
 * - Accept/Reject/Cancel quote requests
 * - Admin: view all, send quotation
 *
 * @author AI Assistant
 * @date 03/02/2026
 */

import { BackendResult, deleteReq, getJson, postJson } from "./backendClient";

// ============================================================================
// TYPES
// ============================================================================

export type QuoteRequestStatus =
  | "pending"
  | "reviewing"
  | "quoted"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type ProjectType =
  | "construction"
  | "renovation"
  | "design"
  | "consultation"
  | "maintenance"
  | "other";

export interface QuoteRequest {
  id: number;
  code: string;
  userId?: number;
  projectName: string;
  projectType: ProjectType;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
  budget?: number;
  expectedStartDate?: string;
  attachments?: string[];
  status: QuoteRequestStatus;
  quotedAmount?: number;
  quotedAt?: string;
  quotedBy?: number;
  responseMessage?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteRequestInput {
  projectName: string;
  projectType: ProjectType;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
  budget?: number;
  expectedStartDate?: string;
  attachments?: string[];
  notes?: string;
}

export interface QuoteRequestListResponse {
  data: QuoteRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QuoteRequestQuery {
  status?: QuoteRequestStatus;
  page?: number;
  limit?: number;
}

export interface AdminQuoteInput {
  quotedAmount: number;
  responseMessage?: string;
  validUntil?: string;
}

export interface RejectQuoteInput {
  reason: string;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

const ENDPOINTS = {
  create: "/api/v1/quote-requests",
  myRequests: "/api/v1/quote-requests/my",
  getById: (id: number | string) => `/api/v1/quote-requests/${id}`,
  accept: (id: number | string) => `/api/v1/quote-requests/${id}/accept`,
  reject: (id: number | string) => `/api/v1/quote-requests/${id}/reject`,
  cancel: (id: number | string) => `/api/v1/quote-requests/${id}/cancel`,
  delete: (id: number | string) => `/api/v1/quote-requests/${id}`,
  // Admin endpoints
  adminAll: "/api/v1/quote-requests/admin/all",
  adminQuote: (id: number | string) => `/api/v1/quote-requests/${id}/quote`,
};

// ============================================================================
// PUBLIC SERVICE FUNCTIONS
// ============================================================================

/**
 * Create a new quote request (Customer/Guest)
 * Guest users can also submit quote requests
 */
export async function createQuoteRequest(
  input: CreateQuoteRequestInput,
): Promise<BackendResult<QuoteRequest>> {
  return postJson<QuoteRequest>(ENDPOINTS.create, input);
}

/**
 * Get my quote requests (Authenticated users only)
 */
export async function getMyQuoteRequests(
  query?: QuoteRequestQuery,
): Promise<BackendResult<QuoteRequestListResponse>> {
  const params = new URLSearchParams();
  if (query?.status) params.append("status", query.status);
  if (query?.page) params.append("page", String(query.page));
  if (query?.limit) params.append("limit", String(query.limit));

  const url = params.toString()
    ? `${ENDPOINTS.myRequests}?${params}`
    : ENDPOINTS.myRequests;

  return getJson<QuoteRequestListResponse>(url, { retry: 2 });
}

/**
 * Get a single quote request by ID
 */
export async function getQuoteRequest(
  id: number | string,
): Promise<BackendResult<QuoteRequest>> {
  return getJson<QuoteRequest>(ENDPOINTS.getById(id), { retry: 2 });
}

/**
 * Accept a quote (after receiving quotation from admin)
 */
export async function acceptQuote(
  id: number | string,
): Promise<BackendResult<QuoteRequest>> {
  return postJson<QuoteRequest>(ENDPOINTS.accept(id), {});
}

/**
 * Reject a quote
 */
export async function rejectQuote(
  id: number | string,
  input: RejectQuoteInput,
): Promise<BackendResult<QuoteRequest>> {
  return postJson<QuoteRequest>(ENDPOINTS.reject(id), input);
}

/**
 * Cancel a pending quote request
 */
export async function cancelQuoteRequest(
  id: number | string,
): Promise<BackendResult<QuoteRequest>> {
  return postJson<QuoteRequest>(ENDPOINTS.cancel(id), {});
}

/**
 * Delete a quote request
 */
export async function deleteQuoteRequest(
  id: number | string,
): Promise<BackendResult<{ success: boolean }>> {
  return deleteReq(ENDPOINTS.delete(id));
}

// ============================================================================
// ADMIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Get all quote requests (Admin only)
 */
export async function getAllQuoteRequests(
  query?: QuoteRequestQuery,
): Promise<BackendResult<QuoteRequestListResponse>> {
  const params = new URLSearchParams();
  if (query?.status) params.append("status", query.status);
  if (query?.page) params.append("page", String(query.page));
  if (query?.limit) params.append("limit", String(query.limit));

  const url = params.toString()
    ? `${ENDPOINTS.adminAll}?${params}`
    : ENDPOINTS.adminAll;

  return getJson<QuoteRequestListResponse>(url, { retry: 2 });
}

/**
 * Send quotation to customer (Admin only)
 */
export async function sendQuotation(
  id: number | string,
  input: AdminQuoteInput,
): Promise<BackendResult<QuoteRequest>> {
  return postJson<QuoteRequest>(ENDPOINTS.adminQuote(id), input);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status label in Vietnamese
 */
export function getStatusLabel(status: QuoteRequestStatus): string {
  const labels: Record<QuoteRequestStatus, string> = {
    pending: "Chờ xử lý",
    reviewing: "Đang xem xét",
    quoted: "Đã báo giá",
    accepted: "Đã chấp nhận",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
    completed: "Hoàn thành",
  };
  return labels[status] || status;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: QuoteRequestStatus): string {
  const colors: Record<QuoteRequestStatus, string> = {
    pending: "#FFA500", // Orange
    reviewing: "#3498DB", // Blue
    quoted: "#9B59B6", // Purple
    accepted: "#27AE60", // Green
    rejected: "#E74C3C", // Red
    cancelled: "#95A5A6", // Gray
    completed: "#2ECC71", // Light Green
  };
  return colors[status] || "#666666";
}

/**
 * Get project type label in Vietnamese
 */
export function getProjectTypeLabel(type: ProjectType): string {
  const labels: Record<ProjectType, string> = {
    construction: "Xây dựng",
    renovation: "Cải tạo",
    design: "Thiết kế",
    consultation: "Tư vấn",
    maintenance: "Bảo trì",
    other: "Khác",
  };
  return labels[type] || type;
}

// ============================================================================
// MOCK DATA (Fallback for development)
// ============================================================================

export const MOCK_QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: 1,
    code: "QR-20260203-0001",
    projectName: "Xây nhà 3 tầng",
    projectType: "construction",
    description: "Xây dựng nhà ở 3 tầng trên diện tích 100m2",
    contactName: "Nguyễn Văn A",
    contactPhone: "0912345678",
    contactEmail: "nguyenvana@email.com",
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
    budget: 1500000000,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    code: "QR-20260203-0002",
    projectName: "Cải tạo căn hộ",
    projectType: "renovation",
    description: "Cải tạo nội thất căn hộ 80m2",
    contactName: "Trần Thị B",
    contactPhone: "0987654321",
    status: "quoted",
    quotedAmount: 200000000,
    quotedAt: new Date().toISOString(),
    responseMessage: "Đội ngũ chúng tôi có thể hoàn thành trong 45 ngày",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Customer functions
  createQuoteRequest,
  getMyQuoteRequests,
  getQuoteRequest,
  acceptQuote,
  rejectQuote,
  cancelQuoteRequest,
  deleteQuoteRequest,
  // Admin functions
  getAllQuoteRequests,
  sendQuotation,
  // Helpers
  getStatusLabel,
  getStatusColor,
  getProjectTypeLabel,
  // Mock data
  MOCK_QUOTE_REQUESTS,
};
