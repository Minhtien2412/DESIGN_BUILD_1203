/**
 * ProductApi — Remote data source for products
 * =============================================
 * All HTTP calls to /products endpoints.
 * Returns raw API response shapes (not domain entities).
 * Mapping to domain entities happens in ProductRepository.
 */

import { apiClient } from "./ApiClient";

// ─────────────────────────────────────────────
// Raw API response types (match BE JSON exactly)
// ─────────────────────────────────────────────

export interface ProductApiDto {
  id: number;
  name: string;
  description: string;
  price: string | number; // BE returns Decimal as string
  category: string;
  stock: number;
  status: string;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  soldCount: number;
  isBestseller: boolean;
  isNew: boolean;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
  images?: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
    displayOrder: number;
    createdAt: string;
  }>;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoryApiDto {
  id: string;
  value: string;
  label: string;
  icon: string;
}

// ─────────────────────────────────────────────
// Query params type
// ─────────────────────────────────────────────

export interface ProductApiParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  sellerId?: string;
  featured?: boolean;
  inStock?: boolean;
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

const BASE = "/products";

export const productApi = {
  /**
   * GET /products?page=&limit=&category=...
   */
  getAll(
    params?: ProductApiParams,
  ): Promise<PaginatedApiResponse<ProductApiDto>> {
    return apiClient.get<PaginatedApiResponse<ProductApiDto>>(BASE, params);
  },

  /**
   * GET /products/:id
   */
  getById(id: number): Promise<ProductApiDto> {
    return apiClient.get<ProductApiDto>(`${BASE}/${id}`);
  },

  /**
   * GET /products/featured
   */
  getFeatured(): Promise<PaginatedApiResponse<ProductApiDto>> {
    return apiClient.get<PaginatedApiResponse<ProductApiDto>>(
      `${BASE}/featured`,
    );
  },

  /**
   * GET /products/best-sellers?limit=
   */
  getBestSellers(limit?: number): Promise<PaginatedApiResponse<ProductApiDto>> {
    return apiClient.get<PaginatedApiResponse<ProductApiDto>>(
      `${BASE}/best-sellers`,
      limit ? { limit } : undefined,
    );
  },

  /**
   * GET /products/new-arrivals?limit=
   */
  getNewArrivals(limit?: number): Promise<PaginatedApiResponse<ProductApiDto>> {
    return apiClient.get<PaginatedApiResponse<ProductApiDto>>(
      `${BASE}/new-arrivals`,
      limit ? { limit } : undefined,
    );
  },

  /**
   * GET /products/categories
   */
  getCategories(): Promise<CategoryApiDto[]> {
    return apiClient.get<CategoryApiDto[]>(`${BASE}/categories`);
  },

  /**
   * GET /products?search=...&limit=
   */
  search(
    query: string,
    limit?: number,
  ): Promise<PaginatedApiResponse<ProductApiDto>> {
    return apiClient.get<PaginatedApiResponse<ProductApiDto>>(BASE, {
      search: query,
      limit: limit ?? 20,
    });
  },

  /**
   * POST /products
   */
  create(data: Record<string, any>): Promise<ProductApiDto> {
    return apiClient.post<ProductApiDto>(BASE, data);
  },

  /**
   * PATCH /products/:id
   */
  update(id: number, data: Record<string, any>): Promise<ProductApiDto> {
    return apiClient.patch<ProductApiDto>(`${BASE}/${id}`, data);
  },

  /**
   * DELETE /products/:id
   */
  delete(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`);
  },

  /**
   * POST /products/:id/approve  or  POST /products/:id/reject
   */
  moderate(
    id: number,
    action: string,
    reason?: string,
  ): Promise<ProductApiDto> {
    return apiClient.post<ProductApiDto>(`${BASE}/${id}/${action}`, { reason });
  },

  /**
   * GET /products?status=PENDING
   */
  getPending(
    params?: ProductApiParams,
  ): Promise<PaginatedApiResponse<ProductApiDto>> {
    return apiClient.get<PaginatedApiResponse<ProductApiDto>>(BASE, {
      ...params,
      status: "PENDING",
    });
  },
} as const;
