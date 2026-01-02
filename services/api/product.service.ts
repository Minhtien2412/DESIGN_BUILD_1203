/**
 * Product Service
 * Handles product management endpoints
 * 
 * Endpoints:
 * - GET /products - List products with filters
 * - GET /products/:id - Get product details
 * - POST /products - Create product (CLIENT role)
 * - PATCH /products/:id - Update product (owner or ADMIN)
 * - DELETE /products/:id - Delete product (owner or ADMIN)
 * - PATCH /products/:id/status - Admin approve/reject (ADMIN only)
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Production: 15 products (12 APPROVED, 2 PENDING, 1 REJECTED)
 */

import { apiClient } from './client';
import type {
    CreateProductDto,
    Product,
    ProductQuery,
    UpdateProductDto,
    UpdateProductStatusDto
} from './types';

export const productService = {
  /**
   * List products with advanced filters
   * GET /products
   * 
   * @param params - Query parameters for filtering
   * @returns Paginated list of products
   */
  getProducts: async (params?: ProductQuery): Promise<{ data: Product[] }> => {
    console.log('[ProductService] 📦 Fetching products with filters:', params);
    
    const response = await apiClient.get<{ data: Product[], meta?: any }>('/products', params, {
      skipAuth: true, // Public endpoint for listing
    });

    // API returns { data: [...], meta: {...} }
    const products = Array.isArray(response) ? response : (response?.data || []);
    console.log(`[ProductService] ✅ Fetched ${products.length} products`);
    return { data: products };
  },

  /**
   * Get single product by ID
   * GET /products/:id
   * 
   * @param id - Product ID
   * @returns Product details with seller info
   */
  getProduct: async (id: number): Promise<Product> => {
    console.log('[ProductService] 🔍 Fetching product:', id);
    
    const response = await apiClient.get<Product>(`/products/${id}`, undefined, {
      skipAuth: true, // Public endpoint
    });

    console.log('[ProductService] ✅ Product fetched:', response.name);
    return response;
  },

  /**
   * Create new product
   * POST /products
   * Requires: CLIENT role (any authenticated user)
   * 
   * @param data - Product creation data
   * @returns Created product (status: PENDING)
   */
  createProduct: async (data: CreateProductDto): Promise<Product> => {
    console.log('[ProductService] ➕ Creating product:', data.name);
    
    const response = await apiClient.post<Product>('/products', data);

    console.log('[ProductService] ✅ Product created (status: PENDING)');
    return response;
  },

  /**
   * Update product
   * PATCH /products/:id
   * Requires: Product owner or ADMIN role
   * 
   * @param id - Product ID
   * @param data - Update data
   * @returns Updated product
   */
  updateProduct: async (id: number, data: UpdateProductDto): Promise<Product> => {
    console.log('[ProductService] ✏️ Updating product:', id);
    
    const response = await apiClient.patch<Product>(`/products/${id}`, data);

    console.log('[ProductService] ✅ Product updated');
    return response;
  },

  /**
   * Delete product
   * DELETE /products/:id
   * Requires: Product owner or ADMIN role
   * 
   * @param id - Product ID
   */
  deleteProduct: async (id: number): Promise<void> => {
    console.log('[ProductService] 🗑️ Deleting product:', id);
    
    await apiClient.delete(`/products/${id}`);

    console.log('[ProductService] ✅ Product deleted');
  },

  /**
   * Update product status (Admin approval)
   * PATCH /products/:id/status
   * Requires: ADMIN role only
   * 
   * @param id - Product ID
   * @param data - Status update (APPROVED or REJECTED with reason)
   * @returns Updated product
   */
  updateStatus: async (id: number, data: UpdateProductStatusDto): Promise<Product> => {
    console.log('[ProductService] 🔐 Updating product status:', id, data.status);
    
    const response = await apiClient.patch<Product>(`/products/${id}/status`, data);

    console.log('[ProductService] ✅ Product status updated to:', data.status);
    return response;
  },
};

export default productService;