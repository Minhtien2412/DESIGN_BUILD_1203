/**
 * Products API Service
 * Backend: http://103.200.20.100:3000/api/v1/products
 */

import type {
    CreateProductDto,
    FilterProductsDto,
    Product,
    ProductsResponse,
    UpdateProductDto
} from '@/types/products';
import { apiFetch } from './api';

const PRODUCTS_BASE = '/products';

/**
 * Get my products (vendor/supplier)
 * GET /products
 * Backend filters by authenticated user automatically
 */
export const getMyProducts = async (
  filters?: FilterProductsDto
): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.search) params.append('search', filters.search);
  // Note: isAvailable is not supported by BE - use status=APPROVED for available products
  // if (filters?.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());
  if (filters?.isAvailable === true && !filters?.status) {
    params.append('status', 'APPROVED'); // Map isAvailable to APPROVED status
  }
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  const url = `${PRODUCTS_BASE}${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await apiFetch<any>(url);
    
    // Handle different API response formats
    // Format 1: { products: [], total, page, limit, totalPages }
    if (response.products && Array.isArray(response.products)) {
      return {
        products: response.products,
        total: response.total ?? response.products.length,
        page: response.page ?? filters?.page ?? 1,
        limit: response.limit ?? filters?.limit ?? 20,
        totalPages: response.totalPages ?? Math.ceil((response.total ?? response.products.length) / (response.limit ?? 20)),
      };
    }
    
    // Format 2: { data: [], meta: { total, page, limit } }
    if (response.data && Array.isArray(response.data)) {
      const meta = response.meta || {};
      return {
        products: response.data,
        total: meta.total ?? response.data.length,
        page: meta.page ?? filters?.page ?? 1,
        limit: meta.limit ?? filters?.limit ?? 20,
        totalPages: meta.totalPages ?? Math.ceil((meta.total ?? response.data.length) / (meta.limit ?? 20)),
      };
    }
    
    // Format 3: Direct array response
    if (Array.isArray(response)) {
      return {
        products: response,
        total: response.length,
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 20,
        totalPages: Math.ceil(response.length / (filters?.limit ?? 20)),
      };
    }
    
    // Fallback: Return empty response
    console.warn('[getMyProducts] Unexpected response format:', response);
    return {
      products: [],
      total: 0,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
      totalPages: 0,
    };
  } catch (error) {
    console.error('[getMyProducts] API error:', error);
    // Return empty response on error
    return {
      products: [],
      total: 0,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
      totalPages: 0,
    };
  }
};

/**
 * Create new product
 * POST /products
 * Roles: VENDOR, SUPPLIER
 */
export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  return apiFetch<Product>(PRODUCTS_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Get product by ID
 * GET /products/:id
 * Access control:
 * - ADMIN: All products
 * - VENDOR/SUPPLIER: Own products
 * - CLIENT/ENGINEER: Only APPROVED products
 */
export const getProductById = async (id: number): Promise<Product> => {
  return apiFetch<Product>(`${PRODUCTS_BASE}/${id}`);
};

/**
 * Update product
 * PATCH /products/:id
 * Only owner can update
 */
export const updateProduct = async (
  id: number,
  data: UpdateProductDto
): Promise<Product> => {
  return apiFetch<Product>(`${PRODUCTS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * Delete product
 * DELETE /products/:id
 * Only owner or admin can delete
 */
export const deleteProduct = async (id: number): Promise<{ message: string; id: number }> => {
  return apiFetch<{ message: string; id: number }>(`${PRODUCTS_BASE}/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Moderate product (Admin only)
 * PATCH /products/:id/status
 * Approve or reject product
 */
export const moderateProduct = async (
  id: number,
  status: 'APPROVED' | 'REJECTED' | 'PENDING'
): Promise<Product> => {
  return apiFetch<Product>(`${PRODUCTS_BASE}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/**
 * Get approved products (for marketplace/catalog)
 * This is a helper function that filters approved products
 */
export const getApprovedProducts = async (
  filters?: Omit<FilterProductsDto, 'status'>
): Promise<ProductsResponse> => {
  return getMyProducts({
    ...filters,
    status: 'APPROVED' as any,
  });
};

/**
 * Search products
 */
export const searchProducts = async (
  query: string,
  filters?: Omit<FilterProductsDto, 'search'>
): Promise<ProductsResponse> => {
  return getMyProducts({
    ...filters,
    search: query,
  });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string,
  filters?: Omit<FilterProductsDto, 'category'>
): Promise<ProductsResponse> => {
  return getMyProducts({
    ...filters,
    category: category as any,
  });
};
