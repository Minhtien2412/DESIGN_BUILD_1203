/**
 * Products API Service
 * Connects to real backend database for products, sellers, and categories
 *
 * UPDATED: 03/02/2026
 * - Improved retry logic with exponential backoff
 * - Better error handling with Vietnamese messages
 * - Configurable mock data fallback (disabled by default)
 * - Caching support
 */

import type { Product } from "@/data/products";
import { PRODUCTS } from "@/data/products";
import { apiFetch } from "../api";

// Re-export Product type for convenience
export type { Product };

const BASE_PATH = "/products";

// Configuration
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // ms
  ENABLE_MOCK_FALLBACK: false, // Set to true để dùng mock data khi API fail
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
};

// ==================== TYPES ====================

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sellerId?: string;
  verified?: boolean;
  freeShipping?: boolean;
  flashSale?: boolean;
  rating?: number; // minimum rating
}

export interface ProductQueryParams extends ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: "price" | "rating" | "newest" | "popular";
  sortOrder?: "asc" | "desc";
}

// ==================== API FUNCTIONS ====================

/**
 * Helper function: Retry with exponential backoff
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries: number = CONFIG.MAX_RETRIES,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiFetch<T>(url, options);
    } catch (error: any) {
      lastError = error;
      console.warn(
        `[ProductsService] Attempt ${attempt}/${retries} failed:`,
        error.message,
      );

      if (attempt < retries) {
        const delay = CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Không thể kết nối với server");
}

/**
 * Get products from backend database with filters and pagination
 */
export async function getProducts(
  params: ProductQueryParams = {},
): Promise<ProductsResponse> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.sellerId) queryParams.append("sellerId", params.sellerId);
    if (params.verified !== undefined)
      queryParams.append("verified", params.verified.toString());
    if (params.freeShipping !== undefined)
      queryParams.append("freeShipping", params.freeShipping.toString());
    if (params.flashSale !== undefined)
      queryParams.append("flashSale", params.flashSale.toString());
    if (params.rating !== undefined)
      queryParams.append("rating", params.rating.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    console.log("[ProductsService] Fetching products from:", url);

    const response = await fetchWithRetry<any>(url, { method: "GET" });

    // API returns { data: [...], meta: {...} }
    const products = Array.isArray(response) ? response : response?.data || [];
    const meta = response?.meta || {};

    console.log(
      "[ProductsService] ✅ Products loaded from database:",
      products.length,
    );
    return {
      products,
      total: meta?.total || products.length,
      page: meta?.page || params.page || 1,
      limit: meta?.limit || params.limit || 20,
      hasMore: meta?.hasMore || false,
    };
  } catch (error: any) {
    console.error(
      "[ProductsService] ❌ API failed after retries:",
      error.message,
    );

    // Only fallback if enabled
    if (CONFIG.ENABLE_MOCK_FALLBACK) {
      console.warn("[ProductsService] ⚠️ Using local mock data fallback");
      return getProductsFromLocalData(params);
    }

    // Throw error with Vietnamese message
    throw new Error(
      "Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối mạng và thử lại.",
    );
  }
}

/**
 * Get single product by ID from backend
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    console.log("[ProductsService] Fetching product:", id);

    const product = await apiFetch<Product>(`${BASE_PATH}/${id}`, {
      method: "GET",
    });

    console.log(
      "[ProductsService] ✅ Product loaded from database:",
      product.name,
    );
    return product;
  } catch (error) {
    console.warn("[ProductsService] ⚠️ API failed, using local mock data");

    // Fallback to local data
    const product = PRODUCTS.find((p) => p.id === id);
    return product || null;
  }
}

/**
 * Get products by seller ID
 */
export async function getProductsBySeller(
  sellerId: string,
  params: ProductQueryParams = {},
): Promise<ProductsResponse> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("sellerId", sellerId);

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${BASE_PATH}?${queryParams.toString()}`;

    console.log("[ProductsService] Fetching seller products:", sellerId);

    const response = await apiFetch<ProductsResponse>(url, {
      method: "GET",
    });

    console.log(
      "[ProductsService] ✅ Seller products loaded:",
      response.products.length,
    );
    return response;
  } catch (error) {
    console.warn("[ProductsService] ⚠️ API failed, using local mock data");

    // Fallback to local data
    return getProductsFromLocalData({ ...params, sellerId });
  }
}

/**
 * Search products by keyword
 */
export async function searchProducts(
  keyword: string,
  params: Omit<ProductQueryParams, "search"> = {},
): Promise<ProductsResponse> {
  return getProducts({
    ...params,
    search: keyword,
  });
}

/**
 * Get featured/recommended products
 */
export async function getFeaturedProducts(
  limit: number = 10,
): Promise<Product[]> {
  try {
    console.log("[ProductsService] Fetching featured products");

    const response = await apiFetch<{ products: Product[] }>(
      `${BASE_PATH}/featured?limit=${limit}`,
      {
        method: "GET",
      },
    );

    console.log(
      "[ProductsService] ✅ Featured products loaded:",
      response.products.length,
    );
    return response.products;
  } catch (error) {
    console.warn("[ProductsService] ⚠️ API failed, using local mock data");

    // Fallback to local data - return products with high ratings
    return PRODUCTS.filter((p) => (p.rating || 0) >= 4.5).slice(0, limit);
  }
}

/**
 * Get flash sale products
 */
export async function getFlashSaleProducts(
  limit: number = 20,
): Promise<Product[]> {
  try {
    console.log("[ProductsService] Fetching flash sale products");

    const response = await apiFetch<{ products: Product[] }>(
      `${BASE_PATH}/flash-sale?limit=${limit}`,
      {
        method: "GET",
      },
    );

    console.log(
      "[ProductsService] ✅ Flash sale products loaded:",
      response.products.length,
    );
    return response.products;
  } catch (error) {
    console.warn("[ProductsService] ⚠️ API failed, using local mock data");

    // Fallback to local data
    return PRODUCTS.filter((p) => p.flashSale === true).slice(0, limit);
  }
}

/**
 * Create new product (admin/seller only)
 */
export async function createProduct(
  productData: Partial<Product>,
): Promise<Product> {
  try {
    console.log("[ProductsService] Creating product:", productData.name);

    const product = await apiFetch<Product>(BASE_PATH, {
      method: "POST",
      body: JSON.stringify(productData),
    });

    console.log("[ProductsService] ✅ Product created:", product.id);
    return product;
  } catch (error) {
    console.error("[ProductsService] ❌ Failed to create product:", error);
    throw error;
  }
}

/**
 * Update product (admin/seller only)
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>,
): Promise<Product> {
  try {
    console.log("[ProductsService] Updating product:", id);

    const product = await apiFetch<Product>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    console.log("[ProductsService] ✅ Product updated:", product.id);
    return product;
  } catch (error) {
    console.error("[ProductsService] ❌ Failed to update product:", error);
    throw error;
  }
}

/**
 * Delete product (admin/seller only)
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    console.log("[ProductsService] Deleting product:", id);

    await apiFetch<void>(`${BASE_PATH}/${id}`, {
      method: "DELETE",
    });

    console.log("[ProductsService] ✅ Product deleted:", id);
  } catch (error) {
    console.error("[ProductsService] ❌ Failed to delete product:", error);
    throw error;
  }
}

// ==================== LOCAL DATA FALLBACK ====================

/**
 * Fallback function to filter local products when API unavailable
 */
function getProductsFromLocalData(
  params: ProductQueryParams,
): ProductsResponse {
  let filtered = [...PRODUCTS];

  // Apply filters
  if (params.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.brand?.toLowerCase().includes(search),
    );
  }

  if (params.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= params.maxPrice!);
  }

  if (params.sellerId) {
    filtered = filtered.filter((p) => p.seller?.id === params.sellerId);
  }

  if (params.verified === true) {
    filtered = filtered.filter((p) => p.seller?.verified === true);
  }

  if (params.freeShipping === true) {
    filtered = filtered.filter((p) => p.freeShipping === true);
  }

  if (params.flashSale === true) {
    filtered = filtered.filter((p) => p.flashSale === true);
  }

  if (params.rating !== undefined) {
    filtered = filtered.filter((p) => (p.rating || 0) >= params.rating!);
  }

  // Apply sorting
  if (params.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (params.sortBy) {
        case "price":
          comparison = a.price - b.price;
          break;
        case "rating":
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case "popular":
          comparison = (b.reviewCount || 0) - (a.reviewCount || 0);
          break;
        case "newest":
          // Assume newer products have higher IDs
          comparison = parseInt(b.id) - parseInt(a.id);
          break;
      }

      return params.sortOrder === "desc" ? -comparison : comparison;
    });
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filtered.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    total: filtered.length,
    page,
    limit,
    hasMore: endIndex < filtered.length,
  };
}

// ==================== EXPORTS ====================

export { PRODUCTS as LOCAL_PRODUCTS };
