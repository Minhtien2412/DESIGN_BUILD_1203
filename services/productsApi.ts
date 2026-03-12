/**
 * Products API Service
 * Based on FRONTEND-INTEGRATION-GUIDE.md
 * 
 * Endpoints:
 * - GET /products - Get list of products
 * - GET /products/:id - Get product details
 */

import { get } from './apiClient';

// ============================================================================
// Types
// ============================================================================

export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
}

export interface ProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Products API Functions
// ============================================================================

/**
 * Get list of products with pagination and filters
 */
export async function getProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
  console.log('[ProductsAPI] Fetching products with params:', params);
  
  const response = await get<ProductsResponse>('/products', {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.category && { category: params.category }),
      ...(params.search && { search: params.search }),
      ...(params.minPrice && { minPrice: params.minPrice }),
      ...(params.maxPrice && { maxPrice: params.maxPrice }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    },
  });

  console.log('[ProductsAPI] ✅ Fetched', response.data.length, 'products');
  
  return response;
}

/**
 * Get product details by ID
 */
export async function getProduct(id: string | number): Promise<Product> {
  console.log('[ProductsAPI] Fetching product:', id);
  
  const response = await get<Product>(`/products/${id}`);

  console.log('[ProductsAPI] ✅ Product fetched:', response.name);
  
  return response;
}

/**
 * Get product categories
 */
export async function getProductCategories(): Promise<string[]> {
  console.log('[ProductsAPI] Fetching product categories');
  
  const response = await get<{ data: string[] }>('/products/categories');

  return response.data;
}

/**
 * Search products
 */
export async function searchProducts(query: string, params: ProductsParams = {}): Promise<ProductsResponse> {
  console.log('[ProductsAPI] Searching products:', query);
  
  return getProducts({
    ...params,
    search: query,
  });
}

/**
 * Get featured/popular products
 */
export async function getFeaturedProducts(limit = 10): Promise<Product[]> {
  console.log('[ProductsAPI] Fetching featured products');
  
  const response = await get<{ data: Product[] }>('/products/featured', {
    params: { limit },
  });

  return response.data;
}

/**
 * Get related products
 */
export async function getRelatedProducts(productId: string | number, limit = 5): Promise<Product[]> {
  console.log('[ProductsAPI] Fetching related products for:', productId);
  
  const response = await get<{ data: Product[] }>(`/products/${productId}/related`, {
    params: { limit },
  });

  return response.data;
}

// ============================================================================
// Export
// ============================================================================

export default {
  getProducts,
  getProduct,
  getProductCategories,
  searchProducts,
  getFeaturedProducts,
  getRelatedProducts,
};
